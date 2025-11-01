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

  const query = await getValidatedQuery(event, querySchema.parse)

  const ids = query['ids[]'] as string[] | undefined

  const filters = {
    id: ids ? { in: ids } : undefined,
    username: query.username
      ? { contains: query.username }
      : undefined
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      take: query.limit ?? 10,
      skip: query.offset ?? 0,
      where: filters,
      orderBy: query['order[username]']
        ? { username: query['order[username]'] }
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
    limit: query.limit ?? 10,
    offset: query.offset ?? 0,
    count: total
  }
})