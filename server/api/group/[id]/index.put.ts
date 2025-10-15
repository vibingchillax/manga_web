import * as z from 'zod'

const ScanlationGroupUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  leader: z.string().uuid().optional(),
  members: z.array(z.string().uuid()).optional(),
  website: z.string().url().optional(),
  ircServer: z.string().max(100).optional(),
  ircChannel: z.string().max(100).optional(),
  discord: z.string().url().max(100).optional(),
  contactEmail: z.string().email().optional(),
  description: z.string().max(500).optional(),
  twitter: z.string().max(15).optional(),
  mangaUpdates: z.string().max(100).optional()
    .refine((url) => !url || url?.includes("mangaupdates.com")),
  focusedLanguages: z.array(z.string().min(2).max(6)).optional(),
  inactive: z.boolean().optional(),
  locked: z.boolean().optional(),
  publishDelay: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const params = await getValidatedRouterParams(event, z.object({
    id: z.string().uuid()
  }).parse)

  const parseResult = ScanlationGroupUpdateSchema.safeParse(await readBody(event))
  if (!parseResult.success) throw createError({
    statusCode: 400,
    statusMessage: 'Invalid request data',
    data: parseResult.error.flatten()
  })

  const data = parseResult.data

  const currentGroup = await prisma.scanlationGroup.findUnique({
    where: { id: params.id },
    include: { members: true }
  })
  if (!currentGroup) throw createError({ statusCode: 404, statusMessage: 'Group not found' })

  const { members, leader, ...scalarUpdate } = data
  await prisma.scanlationGroup.update({
    where: { id: params.id },
    data: {
      ...scalarUpdate,
      focusedLanguages: scalarUpdate.focusedLanguages ? { set: scalarUpdate.focusedLanguages } : undefined
    }
  })

  if (leader) {
    await prisma.scanlationGroupMember.updateMany({
      where: { groupId: params.id, role: 'leader' },
      data: { role: 'member' }
    })
    await prisma.scanlationGroupMember.upsert({
      where: { userId_groupId: { groupId: params.id, userId: leader }},
      update: { role: 'leader' },
      create: { groupId: params.id, userId: leader, role: 'leader' }
    })
  }

  if (members) {
    const currentMemberIds = currentGroup.members.map(m => m.userId)
    const toAdd = members.filter(u => !currentMemberIds.includes(u))
    const toRemove = currentMemberIds.filter(u => !members.includes(u) && u !== leader)

    if (toAdd.length) {
      await prisma.scanlationGroupMember.createMany({
        data: toAdd.map(userId => ({ groupId: params.id, userId, role: 'member' })),
        skipDuplicates: true
      })
    }

    if (toRemove.length) {
      await prisma.scanlationGroupMember.deleteMany({
        where: { groupId: params.id, userId: { in: toRemove } }
      })
    }
  }

  return prisma.scanlationGroup.findUnique({
    where: { id: params.id },
    include: { members: true }
  })
})
