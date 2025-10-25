import * as z from 'zod'
import { formatGroup } from '~~/server/utils/formatResponse'

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
    focusedLanguage: z.string().min(2).max(6).optional(),
    'includes[]': z.union([z.string(), z.array(z.string())]).optional()
      .transform(val => {
        if (!val) return undefined
        return Array.isArray(val) ? val : [val]
      })
  }).safeParse)

  const filters = {
    id: query.data?.['ids[]'] ? { in: query.data['ids[]'] } : undefined,
    name: query.data?.name ? { contains: query.data.name } : undefined,
    focusedLanguages: query.data?.focusedLanguage
      ? { has: query.data.focusedLanguage }
      : undefined
  }

  const [groups, total] = await Promise.all([
    await prisma.scanlationGroup.findMany({
      take: query.data?.limit ?? 10,
      skip: query.data?.offset ?? 0,
      where: filters,
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
    }),

    await prisma.scanlationGroup.count({
      where: filters
    })])

  return {
    result: 'ok',
    data: groups.map(formatGroup),
    limit: query.data?.limit ?? 10,
    offset: query.data?.offset ?? 0,
    count: total
  }
})