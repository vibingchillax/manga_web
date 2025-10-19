import * as z from 'zod'

export default defineEventHandler(async (event) => {

  const params = await getValidatedRouterParams(event, z.object({ id: z.string().uuid() }).parse)

  const group = await prisma.scanlationGroup.findUnique({
    where: {
      id: params.id
    },
    include: {
      members: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
              roles: true
            }
          },
          role: true
        }
      }
    }
  })

  if (!group) throw createError({
    statusCode: 404,
    statusMessage: 'Group not found'
  })

  return {
    ...group,
    members: group?.members?.map(m => ({
      id: m.user.id,
      username: m.user.username,
      roles: m.user.roles,
      groupRole: m.role
    }))
  }
})