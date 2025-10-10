import * as z from 'zod'

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, z.object({
    limit: z.number().min(0).max(100).optional(),
    offset: z.number().optional(),
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

  const groups = await prisma.scanlationGroup.findMany({
    take: query.data?.limit ?? 10,
    skip: query.data?.offset ?? 0,
    where: {
      id: query.data?.['ids[]'] ? { in: query.data['ids[]'] } : undefined,
      name: query.data?.name ? { contains: query.data.name } : undefined,
      focusedLanguages: query.data?.focusedLanguage ? { has: query.data.focusedLanguage } : undefined
    },
    include: {
      members: query.data?.['includes[]']?.includes('member')
    }
  })

  return groups
})