import * as z from 'zod'
import { formatAuthor } from '~~/server/utils/formatResponse'
import { SortOrder } from '~~/shared/prisma/internal/prismaNamespace'

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, z.object({
    limit: z.coerce.number().min(0).max(100).optional(),
    offset: z.coerce.number().optional(),
    'ids[]': z.union([z.string().uuid(), z.array(z.string().uuid())]).optional()
      .transform(val => {
        if (!val) return undefined
        return Array.isArray(val) ? val : [val]
      }),
    name: z.string().min(1).max(200).optional(),
    order: z.record(z.string(), z.enum(['asc', 'desc']).default('asc')).optional(),
    'includes[]': z.union([z.string(), z.array(z.string())]).optional()
      .transform(val => {
        if (!val) return undefined
        return Array.isArray(val) ? val : [val]
      })
  }).safeParse)

  const filters = {
    id: query.data?.['ids[]'] ? { in: query.data['ids[]'] } : undefined,
    name: query.data?.name ? { contains: query.data.name } : undefined,
  }

  const orderBy = query.data?.order
    ? Object.entries(query.data.order).map(([field, direction]) => ({
        [field]: direction,
      }))
    : [{ name: 'asc' as SortOrder }]

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