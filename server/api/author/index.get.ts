import { formatAuthor } from '~~/server/utils/formatResponse'
import { SortOrder } from '~~/shared/prisma/internal/prismaNamespace'

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, baseQuerySchema.extend({
    name: zName.optional(),
    'order[name]': zOrderDirection.optional()
  }).safeParse)

  const ids = query.data?.['ids[]'] as string[] | undefined

  const filters = {
    id: ids ? { in: ids } : undefined,
    name: query.data?.name ? { contains: query.data.name } : undefined,
  }

  const orderBy = query.data?.['order[name]']
      ? { name: query.data['order[name]'] as SortOrder }
      : undefined

  const [authors, total] = await Promise.all([
    await prisma.author.findMany({
      take: query.data?.limit ?? 10,
      skip: query.data?.offset ?? 0,
      where: filters,
      orderBy: orderBy,
      // include: {
      //   manga: true
      // }
    }),

    await prisma.author.count({
      where: filters
    })])

  return {
    result: 'ok',
    data: authors.map(formatAuthor),
    limit: query.data?.limit ?? 10,
    offset: query.data?.offset ?? 0,
    count: total
  }
})