import * as z from 'zod'
import { formatGroup } from '~~/server/utils/formatResponse'
import { GroupRole, UserRole } from '~~/shared/prisma/enums'

const ScanlationGroupUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  leader: z.string().uuid().optional(),
  members: z.array(z.string().uuid()).optional(),
  website: z.string().url().optional(),
  ircServer: z.string().max(100).optional(),
  ircChannel: z.string().max(100).optional(),
  discord: z.string()
    .regex(/^((https?:\/\/)?(www\.)?(discord\.(gg|com)\/(invite\/)?[A-Za-z0-9-]+))$/, {
    })
    .max(200).optional(),
  contactEmail: z.string().email().optional(),
  description: z.string().max(500).optional(),
  twitter: z.string()
    .regex(
      /^(?:@)?(?:https?:\/\/(?:www\.)?twitter\.com\/)?([A-Za-z0-9_]{1,15})$/,
    )
    .transform(v => {
      const match = v.match(/([A-Za-z0-9_]{1,15})$/)
      return match ? match[1] : undefined
    }).optional(),
  mangaUpdates: z.string()
    .url()
    .regex(/^https?:\/\/(www\.)?mangaupdates\.com\//, {
    })
    .max(200).optional(),
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

  if (!(user.roles.includes(UserRole.admin)
    || user.id === currentGroup.members?.find(m => m.role === GroupRole.leader)?.userId)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden'
    })
  }

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
      where: { userId_groupId: { groupId: params.id, userId: leader } },
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

  const result = await prisma.scanlationGroup.findUnique({
    where: { id: params.id },
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
  })

  if (!result) {
    throw createError({
      statusCode: 409,
      statusMessage: "Updated successfully, but record not found"
    })
  }

  return formatGroup(result)
})
