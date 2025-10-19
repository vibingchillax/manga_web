import * as z from 'zod'

const querySchema = z.object({
  limit: z.coerce.number().min(0).max(100).optional(),
  offset: z.coerce.number().optional(),
  'ids[]': z
    .union([z.string().uuid(), z.array(z.string().uuid())])
    .optional()
    .transform(val => {
      if (!val) return undefined
      return Array.isArray(val) ? val : [val]
    }),
  username: z.string().optional(),
  'order[username]': z.enum(['asc', 'desc']).optional()
})

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: "Not authenticated"
  })

  const query = await getValidatedQuery(event, querySchema.safeParse)

  const filters = {
    id: query.data?.['ids[]'] ? { in: query.data['ids[]'] } : undefined,
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
    data: users,
    limit: query.data?.limit ?? 10,
    offset: query.data?.offset ?? 0,
    count: total
  }
})