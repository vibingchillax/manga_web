import { z } from "zod"
import { formatCoverArt } from "~~/server/utils/formatResponse"

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({ id: zUuid }).parse)

  const query = await getValidatedQuery(event, z.object({
    "includes[]": zArrayable(z.string()).optional()
  }).parse)

  const cover = await prisma.coverArt.findUnique({
    where: {
      id: params.id
    },
    include: {
      user: query["includes[]"]?.includes("user") ? {
        select: {
          id: true,
          username: true,
          roles: true
        }
      } : undefined,
      //manga
    }
  })

  if (!cover) throw createError({
    statusCode: 404,
    statusMessage: 'Cover not found'
  })

  return {
    result: 'ok',
    data: formatCoverArt(cover)
  }
})