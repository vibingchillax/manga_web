import { z } from 'zod'
import { formatGroup } from '~~/server/utils/formatResponse'
import { GroupRole, UserRole } from '~~/shared/prisma/enums'
import { ScanlationGroupSchema } from '../index.post'

const ScanlationGroupUpdateSchema = ScanlationGroupSchema.extend({
  leader: zUuid.optional(),
  members: z.array(zUuid).optional(),
  focusedLanguages: z.array(zLang).optional(),
  inactive: z.boolean().optional(),
  locked: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const params = await getValidatedRouterParams(event, z.object({
    id: zUuid
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
