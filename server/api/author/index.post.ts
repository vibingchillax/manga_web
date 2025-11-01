import { randomUUID } from 'crypto'
import { z } from 'zod'
import { formatAuthor } from '~~/server/utils/formatResponse'
import { makeDomainRegex } from '~~/server/utils/strings'

export const AuthorDataSchema = z.object({
  name: zName,
  biography: z.record(zLang, z.string().max(300)).optional(),
  twitter: z
    .string()
    .regex(/^https?:\/\/(www\.)?twitter\.com(\/[A-Za-z0-9_]{1,15})?\/?$/, {
      message: "Invalid Twitter URL"
    })
    .optional(),
  pixiv: z
    .string()
    .regex(makeDomainRegex("pixiv\\.net"), { message: "Invalid Pixiv URL" })
    .optional(),
  melonBook: z
    .string()
    .regex(makeDomainRegex("melonbooks\\.co\\.jp"), { message: "Invalid MelonBooks URL" })
    .optional(),
  fanBox: z
    .string()
    .regex(makeDomainRegex("fanbox\\.cc"), { message: "Invalid FanBox URL" })
    .optional(),
  booth: z
    .string()
    .regex(makeDomainRegex("booth\\.pm"), { message: "Invalid Booth URL" })
    .optional(),
  nicoVideo: z
    .string()
    .regex(makeDomainRegex("nicovideo\\.jp"), { message: "Invalid NicoVideo URL" })
    .optional(),
  skeb: z
    .string()
    .regex(makeDomainRegex("skeb\\.jp"), { message: "Invalid Skeb URL" })
    .optional(),
  fantia: z
    .string()
    .regex(makeDomainRegex("fantia\\.jp"), { message: "Invalid Fantia URL" })
    .optional(),
  tumblr: z
    .string()
    .regex(makeDomainRegex("tumblr\\.com"), { message: "Invalid Tumblr URL" })
    .optional(),
  youtube: z
    .string()
    .regex(/^https?:\/\/(www\.)?youtube\.com(\/|$)/, { message: "Invalid YouTube URL" })
    .optional(),
  weibo: z
    .string()
    .regex(makeDomainRegex("weibo\\.(com|cn)"), { message: "Invalid Weibo URL" })
    .optional(),
  naver: z
    .string()
    .regex(makeDomainRegex("naver\\.com"), { message: "Invalid Naver URL" })
    .optional(),
  website: z.string().url().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const body = await readValidatedBody(event, AuthorDataSchema.parse)

  const author = await prisma.author.create({
    data: {
      id: randomUUID(),
      ...body
    }
  })

  return formatAuthor(author)
})