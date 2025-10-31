import { formatGroup } from '~~/server/utils/formatResponse'

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, baseQuerySchema.extend({
    name: zName.optional(),
    focusedLanguage: zLang.optional() //why mangadex only allows to search 1 i have no idea
  }).safeParse)

  const ids = query.data?.['ids[]'] as string[] | undefined

  const filters = {
    id: ids ? { in: ids } : undefined,
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