import { z } from "zod"

export const zUuid = z.string().uuid()
export const zLang = z.string().min(2).max(6)
export const zTitle = z.string().min(1).max(200)
export const zVolume = z.string().min(1).max(99999)

export const zName = z.string().min(1).max(200)

export const zLimit = z.coerce.number().min(0).max(100).optional()
export const zOffset = z.coerce.number().min(0).optional()

export const zArrayable = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([schema, z.array(schema)])
    .optional()
    .transform(val => {
      if (!val) return undefined
      return Array.isArray(val) ? val : [val]
    })

export const zArrayRequired = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([schema, z.array(schema)])
    .transform(val => (Array.isArray(val) ? val : val ? [val] : []))

export const zUniqueUuidArray = z
  .array(zUuid, { message: "Each must be a valid UUID" })
  .refine((arr) => new Set(arr).size === arr.length, {
    message: "Duplicate IDs are not allowed",
  })

export const zDateString = z
  .string()
  .transform((val) => new Date(val))

export const zOrderDirection = z.enum(["asc", "desc"])

export const baseQuerySchema = z.object({
  limit: zLimit,
  offset: zOffset,
  "ids[]": zArrayable(zUuid),
  "includes[]": zArrayable(z.string()),
})