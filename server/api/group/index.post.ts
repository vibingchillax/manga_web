import { randomUUID } from 'crypto'
import { z } from 'zod'
import { formatGroup } from '~~/server/utils/formatResponse'

export const ScanlationGroupSchema = z.object({
  name: zName, 
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
  publishDelay: z.coerce.string().optional()
})

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const body = await readValidatedBody(event, ScanlationGroupSchema.parse)

  const group = await prisma.scanlationGroup.create({
    data: {
      id: randomUUID(),
      ...body
    }
  })

  return formatGroup(group)
})