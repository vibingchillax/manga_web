import * as z from 'zod'
import { formatUploadedChapter, SafeUser } from '~~/server/utils/formatResponse'
import { ScanlationGroup, UploadedChapter, UploadedChapterGroup, User } from '~~/shared/prisma/client'

export type ChapterQueryResult = UploadedChapter & {
  user?: User | null
  groups?: (UploadedChapterGroup & {
    group?: ScanlationGroup
  })[]
}

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({
    id: zUuid
  }).parse)

  const query = await getValidatedQuery(event, z.object({
    'includes[]': zArrayable(z.string()).optional()
  }).safeParse)

  if (query.data?.['includes[]']?.includes("manga")) {
  }

  const result = await prisma.uploadedChapter.findUnique({ 
    where: {
      id: params.id
    },
    include: {
      user: query.data?.['includes[]']?.includes("user") ? {
        select: {
          id: true,
          username: true,
          roles: true,
        }
      } : undefined,
      groups: query.data?.['includes[]']?.includes("scanlation_group") ? {
        include: {
          group: true
        }
      } : undefined
    }
  })

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: "Chapter not found"
    })
  }

  const chapter = result as ChapterQueryResult

  const flattenedGroups: ScanlationGroup[] =
    chapter.groups?.map((g) => g.group!).filter(Boolean) ?? []


  return formatUploadedChapter({
    ...chapter,
    user: chapter.user
      ? {
        id: chapter.user.id,
        username: chapter.user.username,
        roles: chapter.user.roles,
      } satisfies SafeUser
      : undefined,
    groups: flattenedGroups
  })
})