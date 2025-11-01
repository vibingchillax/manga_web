import * as z from 'zod'
import { UserRole } from '~~/shared/prisma/enums'
import { PrismaClientKnownRequestError } from '~~/shared/prisma/internal/prismaNamespace'

const ChapterUpdateSchema = z.object({
  title: zTitle.optional(),
  volume: zVolume.optional(),
  chapter: z.string().max(10).optional(),
  translatedLanguage: zLang,
  groups: z.array(zUuid).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not authenticated'
  })

  if (!user.roles.includes(UserRole.admin)) throw createError({
    statusCode: 403,
    statusMessage: "Forbidden"
  })

  const params = await getValidatedRouterParams(event, z.object({
    id: z.string().uuid()
  }).parse)

  const body = await readValidatedBody(event, ChapterUpdateSchema.parse)

  try {
    const chapter = await prisma.uploadedChapter.update({
      where: {
        id: params.id
      },
      data: {
        title: body.title,
        volume: body.volume,
        chapter: body.chapter,
        translatedLanguage: body.translatedLanguage,
        groups: body.groups
          ? {
            set: body.groups.map(id => ({ chapterId_groupId: { groupId: id, chapterId: params.id } }))
          } : undefined
      }
    })

    return {
      result: "ok",
      data: formatUploadedChapter(chapter)
    }

  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Chapter not found',
      })
    }
    throw err
  }
})