import { z } from 'zod'
import { formatUser } from '~~/server/utils/formatResponse'

const querySchema = baseQuerySchema.extend({
  username: zName.optional(),
  'order[username]': zOrderDirection.optional()
})

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: "Not authenticated"
  })

  const query = await getValidatedQuery(event, querySchema.safeParse)

  const ids = query.data?.['ids[]'] as string[] | undefined

  const filters = {
    id: ids ? { in: ids } : undefined,
    username: query.data?.username
      ? { contains: query.data.username }
      : undefined
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      take: query.data?.limit ?? 10,
      skip: query.data?.offset ?? 0,
      where: filters,
      orderBy: query.data?.['order[username]']
        ? { username: query.data['order[username]'] }
        : undefined,
      select: {
        id: true,
        username: true,
        roles: true
      }
    }),
    prisma.user.count({ where: filters })
  ])

  return {
    result: "ok",
    data: users.map(formatUser),
    limit: query.data?.limit ?? 10,
    offset: query.data?.offset ?? 0,
    count: total
  }
})