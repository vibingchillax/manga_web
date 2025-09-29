import { randomUUID } from 'crypto'

type Body = {
  groups: string[]
  manga: string
}

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)
  if (!user) throw createError({
    statusCode: 401,
    statusMessage: "Not authenticated"
  })
  const body: Body = await readBody(event)
  
  if (!body.manga || !body.groups) throw createError({
    statusCode: 400,
    statusMessage: 'No manga or groups in body'
  })

  const session = await prisma.uploadSession.create({
    data: {
      id: randomUUID(),
      mangaId: body.manga,
      userId: user.id,
      groups: {
        create: body.groups.map((gid) => ({
          group: {
            connect: { id: gid }
          }
        }))
      }
    }
  })

  return session
})