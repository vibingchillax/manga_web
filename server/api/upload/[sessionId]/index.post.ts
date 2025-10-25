import { kubo } from "~~/server/utils/kubo"
import { randomUUID } from 'crypto'
import * as z from 'zod'
import { fileTypeFromBuffer } from 'file-type'

const IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif"
]

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const params = await getValidatedRouterParams(event, z.object({
    sessionId: z.string().uuid()
  }).parse)

  const data = await readMultipartFormData(event)

  if (!data || data.length === 0) throw createError({
    statusCode: 400,
    statusMessage: 'No files uploaded'
  })

  const session = await prisma.uploadSession.findUnique({
    where: {
      id: params.sessionId,
      userId: user.id
    }
  })

  if (!session) throw createError({
    statusCode: 400,
    statusMessage: 'Invalid upload session id'
  })

  const results: {
    filename: string,
    cid: string,
    size: number,
    type?: string,
    status: 'success' | 'error'
    message?: string
  }[] = []

  for (const file of data) {
    try {
      const detect = await fileTypeFromBuffer(file.data)
      const mime = detect?.mime

      if (!mime || !IMAGE_TYPES.includes(mime)) {
        throw new Error(`Invalid or unrecognized file type: ${mime ?? 'unknown'}. Allowed: JPEG, PNG, GIF.`)
      }

      const result = await kubo.add(file.data) //TODO: compare add vs addAll perf
      const cid = result.cid.toString()
      const targetDir = `/manga_web/${session.mangaId}/${session.id}`
      const targetPath = `${targetDir}/${file.filename}`
      try {
        await kubo.files.rm(targetPath)
      } catch {

      }
      await kubo.files.mkdir(targetDir, { parents: true })
      await kubo.files.cp(`/ipfs/${cid}`, `${targetDir}/${file.filename}`) //rpc client missing force param!

      results.push({
        filename: file.filename ?? `unnamed-${Date.now()}.bin`,
        cid: cid,
        size: result.size,
        type: file.type,
        status: 'success'
      })
    } catch (e) {
      console.log(e)
      results.push({
        filename: file.filename ?? `unnamed-${Date.now()}.bin`,
        cid: '',
        size: file.data.length,
        type: file.type,
        status: 'error',
        message: e instanceof Error ? e.message : (e as any).toString()
      })
    }
  }

  const added = await prisma.uploadSessionFile.createManyAndReturn({
    data: results.filter(f => f.status === 'success').map(result => ({
      id: randomUUID(),
      sessionId: session.id,
      originalFileName: result.filename ?? 'none',
      cid: result.cid,
      fileSize: result.size,
      mimeType: result.type ?? 'none',
      source: 'local',
    }))
  })

  return {
    result: "ok",
    errors: results.filter(f => f.status === 'error'),
    data: added.map(f => ({
      id: f.id,
      type: "upload_session_file",
      attributes: {
        originalFileName: f.originalFileName,
        cid: f.cid,
        fileSize: f.fileSize,
        mimeType: f.mimeType,
        source: f.source,
        version: f.version
      }
    }))
  }
})