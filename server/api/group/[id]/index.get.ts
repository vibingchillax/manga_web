import * as z from 'zod'

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({ id: z.string().uuid() }).parse)

  const query = await getValidatedQuery(event, z.object({
    'includes[]': z.union([z.string(), z.array(z.string())]).optional()
  }).safeParse)

  const group = await prisma.scanlationGroup.findUnique({
    where: {
      id: params.id
    },
    include: {
      members: query.data?.['includes[]']?.includes('member')
    }
  })

  return group
})