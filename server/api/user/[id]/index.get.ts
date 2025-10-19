import * as z from 'zod'

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({
    id: z.string().uuid()
  }).parse)

  const user = await prisma.user.findUnique({
    where: {
      id: params.id
    },
    select: {
      id: true,
      username: true,
      roles: true,
      ScanlationGroupMember: {
        select: {
          groupId: true
        }
      }
    },
  })

  if (!user) throw createError({
    statusCode: 404,
    statusMessage: "User not found"
  })

  const { ScanlationGroupMember, ...rest } = user

  return {
    result: "ok",
    data: {
      ...rest,
      groups: user.ScanlationGroupMember.map(g => g.groupId)
    }
  }

})