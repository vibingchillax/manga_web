import { randomUUID } from 'crypto'
import * as z from 'zod'
import { formatGroup } from '~~/server/utils/formatResponse'

const ScanlationGroupCreateSchema = z.object({
  name: z.string().min(1).max(100),
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

  const body = ScanlationGroupCreateSchema.safeParse(await readBody(event))

  if (!body.success) throw createError({
    statusCode: 400,
    statusMessage: 'Invalid request data',
    data: body.error.flatten()
  })

  const data = body.data

  const group = await prisma.scanlationGroup.create({
    data: {
      id: randomUUID(),
      name: data.name,
      website: data.website,
      ircServer: data.ircServer,
      ircChannel: data.ircChannel,
      discord: data.discord,
      contactEmail: data.contactEmail,
      description: data.description,
      twitter: data.twitter,
      mangaUpdates: data.mangaUpdates,
      publishDelay: data.publishDelay,
    }
  })

  return formatGroup(group)
})