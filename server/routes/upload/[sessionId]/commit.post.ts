import { randomUUID } from "crypto"

type Body = {
  chapterDraft: {
    volume?: string | null
    chapter?: string | null
    title?: string | null
    translatedLanguage: string
    publishAt: Date
  }
  pageOrder: string[]
}

export default defineEventHandler(async (event) => {
  const kuboUrl = useAppConfig().kuboUrl

  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const id = getRouterParam(event, 'sessionId')

  if (!id) throw createError({
    statusCode: 400,
    statusMessage: 'No sessionId provided'
  })

  const body: Body = await readBody(event)

  if (!body.chapterDraft || !body.pageOrder) throw createError({
    statusCode: 400,
    statusMessage: 'Missing chapterDraft or pageOrder in body'
  })

  const session = await prisma.uploadSession.findUnique({
    where: {
      id: id
    },
    include: {
      UploadSessionFile: true
    }
  })

  if (!session) throw createError({
    statusCode: 400,
    statusMessage: 'No upload session with that id'
  })

  if (!(session.UploadSessionFile.length > 0)) throw createError({
    statusCode: 400,
    statusMessage: 'No files uploaded yet'
  })

  const orderedFiles = body.pageOrder.map(idOrName => {
    const file = session.UploadSessionFile.find(f => f.id === idOrName || f.originalFileName === idOrName)
    if (!file) throw createError({ statusCode: 400, statusMessage: `File ${idOrName} not found in session` })
    return file
  })

  const chapter = await prisma.uploadedChapter.create({
    data: {
      id: randomUUID(),
      mangaId: session.mangaId,
      title: body.chapterDraft.title,
      volume: body.chapterDraft.volume,
      chapter: body.chapterDraft.chapter,
      translatedLanguage: body.chapterDraft.translatedLanguage,
      uploader: user.id,
      pages: {
        originalUrl: kuboUrl as string,
        data: orderedFiles.map(f => ({
          originalFileName: f.originalFileName,
          cid: f.cid,
          fileSize: f.fileSize,
          mimeType: f.mimeType
        }))
      },
      publishAt: body.chapterDraft.publishAt
    }
  })

  const deleted = await prisma.uploadSession.delete({
    where: {
      id: id,
      userId: user.id
    }
  })

  try {
    await kubo.files.mkdir(`/manga_web/${deleted.mangaId}/${chapter.id}`, { parents: true })
    await kubo.files.mv(`/manga_web/${deleted.mangaId}/${deleted.id}`,
      `/manga_web/${deleted.mangaId}/${chapter.id}_${chapter.translatedLanguage}_v${chapter.volume ?? 'v'}_c${chapter.chapter ?? 'c'}`, { recursive: true })
  } catch (e) {
    console.warn('Failed to move files, might need manual cleanup', e)
  }

  return chapter
})