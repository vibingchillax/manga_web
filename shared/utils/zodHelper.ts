import { z } from "zod";
import { EXTERNAL_SITES } from "./externalSites";

const externalSiteMap = Object.fromEntries(
  EXTERNAL_SITES.map((site) => [site.apiCode, site]),
);

export const zUuid = z.string().uuid();
export const zLang = z.string().min(2).max(6);
export const zTitle = z.string().min(1).max(200);
export const zVolume = z.string().min(1).max(15);
export const zChapter = z.string().min(1).max(15);

export const zName = z.string().min(0).max(200);

export const zLocalizedString = z.record(zLang, z.string().min(1));

export const zMangaStatus = z.enum([
  "ongoing",
  "completed",
  "hiatus",
  "cancelled",
]);
export const zPublicationDemographic = z.enum([
  "shounen",
  "shoujo",
  "josei",
  "seinen",
]);
export const zContentRating = z.enum([
  "safe",
  "suggestive",
  "erotica",
  "pornographic",
]);

export const zExternalSite = z
  .record(z.string())
  .refine(
    (links) => {
      return Object.keys(links).every((key) => key in externalSiteMap);
    },
    {
      message: "Invalid external site code in links",
    },
  )
  .superRefine((links, ctx) => {
    for (const [code, url] of Object.entries(links)) {
      const site = externalSiteMap[code];
      if (!site) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [code],
          message: `Unknown external site code: ${code}`,
        });
        continue;
      }

      try {
        new URL(url);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [code],
          message: `Invalid URL format for ${code}`,
        });
        continue;
      }

      if (["website", "raw", "engtl"].includes(code)) continue;

      if (site.matcher && !site.matcher.test(url)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [code],
          message: `URL for ${code} does not match expected domain (${site.name})`,
        });
      }
    }
  });

export const zLimit = z.coerce.number().min(0).max(100).default(10);
export const zOffset = z.coerce.number().min(0).default(0);

export const zArrayable = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([schema, z.array(schema)]).transform((val) => {
    if (!val) return undefined;
    return Array.isArray(val) ? val : [val];
  }) as z.ZodEffects<z.ZodUnion<[T, z.ZodArray<T>]>, z.infer<T>[] | undefined>;

export const zUniqueUuidArray = z
  .array(zUuid, { message: "Each must be a valid UUID" })
  .refine((arr) => new Set(arr).size === arr.length, {
    message: "Duplicate IDs are not allowed",
  });

export const zDateString = z.string().transform((val) => new Date(val));

export const zOrderDirection = z.enum(["asc", "desc"]);

export const paginationSchema = z.object({
  limit: zLimit,
  offset: zOffset,
});

export const baseQuerySchema = paginationSchema.extend({
  "ids[]": zArrayable(zUuid).optional(),
  "includes[]": zArrayable(z.string()).optional(),
});
