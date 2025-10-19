import * as z from "zod"

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: "Not authenticated"
  })

  if (user.roles.includes('admin')) throw createError({
    statusCode: 403,
    statusMessage: "Forbidden"
  })
  
  const params = await getValidatedRouterParams(event, z.object({
    id: z.string().uuid()
  }).parse)

  await prisma.scanlationGroup.delete({
    where: {
      id: params.id
    }
  })

  return {
    result: "ok"
  }
})