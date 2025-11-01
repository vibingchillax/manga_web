import { randomUUID } from "crypto"
import { z } from 'zod'

const commitSchema = z.object({
  chapterDraft: z.object({
    volume: z.string().optional().nullable(),
    chapter: z.string().optional().nullable(),
    title: z.string().optional().nullable(),
    translatedLanguage: zLang,
    publishAt: zDateString
  }),
  pageOrder: z.array(zUuid)
}) 

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const params = await getValidatedRouterParams(event, z.object({
    sessionId: zUuid
  }).parse)

  const body = await readValidatedBody(event, commitSchema.parse)

  const session = await prisma.uploadSession.findUnique({
    where: {
      id: params.sessionId,
      userId: user.id
    },
    include: {
      files: true
    }
  })

  if (!session) throw createError({
    statusCode: 400,
    statusMessage: 'No upload session with that id'
  })

  if (!(session.files.length > 0)) throw createError({
    statusCode: 400,
    statusMessage: 'No files uploaded yet'
  })

  const orderedFiles = body.pageOrder.map(idOrName => {
    const file = session.files.find(f => f.id === idOrName || f.originalFileName === idOrName)
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
        originalUrl: useAppConfig().kuboGatewayUrl,
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
      id: session.id,
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

  return { //formatUploadedChapter(chapter)
    id: chapter.id,
    type: "chapter",
    attributes: {
      title: chapter.title,
      volume: chapter.volume,
      chapter: chapter.chapter,
      pages: chapter.pages,
      translatedLanguage: chapter.translatedLanguage,
      uploader: chapter.uploader,
      version: chapter.version,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
      publishAt: chapter.publishAt,
      readableAt: chapter.readableAt,
    },
    relationships: [
      {
        id: chapter.mangaId,
        type: "manga"
      }
    ]
  }
})