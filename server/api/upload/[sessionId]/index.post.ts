import { kubo } from "~~/server/utils/kubo"
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { fileTypeFromBuffer } from 'file-type'
import sharp from 'sharp'

const IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif"
]

const MAX_FILES_PER_REQUEST = 10
const MAX_FILE_SIZE = 20 * 1024 * 1024       // 20 MB
const MAX_FILES_PER_SESSION = 500
const MAX_TOTAL_SIZE_PER_SESSION = 150 * 1024 * 1024  // 150 MB
const MAX_WIDTH = 10000
const MAX_HEIGHT = 10000

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const params = await getValidatedRouterParams(event, z.object({
    sessionId: zUuid
  }).parse)

  const data = await readMultipartFormData(event)

  if (!data || data.length === 0) throw createError({
    statusCode: 400,
    statusMessage: 'No files uploaded'
  })

  if (data.length > MAX_FILES_PER_REQUEST) throw createError({
    statusCode: 400,
    statusMessage: `Cannot upload more than ${MAX_FILES_PER_REQUEST} files per request`
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

  const sessionStats = await prisma.uploadSessionFile.aggregate({
    _count: true,
    _sum: { fileSize: true },
    where: { sessionId: session.id }
  })

  let currentFileCount = sessionStats._count || 0
  let currentTotalSize = sessionStats._sum?.fileSize || 0

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
      if (currentFileCount + 1 > MAX_FILES_PER_SESSION) {
        throw new Error(`Session file limit exceeded (${MAX_FILES_PER_SESSION})`)
      }

      if (file.data.length > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024*1024)}MB`)
      }

      if (currentTotalSize + file.data.length > MAX_TOTAL_SIZE_PER_SESSION) {
        throw new Error(`Session total size limit exceeded (${MAX_TOTAL_SIZE_PER_SESSION / (1024*1024)}MB)`)
      }

      const detect = await fileTypeFromBuffer(file.data)
      const mime = detect?.mime

      if (!mime || !IMAGE_TYPES.includes(mime)) {
        throw new Error(`Invalid or unrecognized file type: ${mime ?? 'unknown'}. Allowed: JPEG, PNG, GIF.`)
      }

      const metadata = await sharp(file.data).metadata()
      if (metadata.width! > MAX_WIDTH || metadata.height! > MAX_HEIGHT) {
        throw new Error(`Image dimensions exceed ${MAX_WIDTH}x${MAX_HEIGHT}. Actual: ${metadata.width}x${metadata.height}`)
      }

      const result = await kubo.add(file.data) //TODO: compare add vs addAll perf
      const cid = result.cid.toString()

      results.push({
        filename: file.filename ?? `unnamed-${Date.now()}.bin`,
        cid: cid,
        size: result.size,
        type: file.type,
        status: 'success'
      })
    } catch (e) {
      console.error({ filename: file.filename, error: e })

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