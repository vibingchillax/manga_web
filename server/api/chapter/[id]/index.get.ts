import { z } from "zod";
import type { SafeUser } from "~~/server/utils/formatResponse";
import { formatUploadedChapter } from "~~/server/utils/formatResponse";
import type {
  Manga,
  ScanlationGroup,
  UploadedChapter,
  UploadedChapterGroup,
  User,
} from "~~/shared/prisma/client";

export type ChapterQueryResult = UploadedChapter & {
  manga?: Manga;
  user?: User | null;
  groups?: (UploadedChapterGroup & {
    group?: ScanlationGroup;
  })[];
};

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const query = await getValidatedQuery(
    event,
    z.object({
      "includes[]": zArrayable(z.string()).optional(),
    }).parse,
  );

  const result = await prisma.uploadedChapter.findUnique({
    where: {
      id: params.id,
    },
    include: {
      manga: query["includes[]"]?.includes("manga"),
      user: query["includes[]"]?.includes("user")
        ? {
            select: {
              id: true,
              username: true,
              roles: true,
            },
          }
        : undefined,
      groups: query["includes[]"]?.includes("scanlation_group")
        ? {
            include: {
              group: true,
            },
          }
        : undefined,
    },
  });

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: "Chapter not found",
    });
  }

  const chapter = result as ChapterQueryResult;

  const user = await getAuthenticatedUser(event);

  await incrementView(
    "chapter",
    chapter.id,
    user?.id,
    event.context.clientIp,
    event.context.userAgent,
  );

  const flattenedGroups: ScanlationGroup[] =
    chapter.groups?.map((g) => g.group!).filter(Boolean) ?? [];

  return {
    result: "ok",
    data: formatUploadedChapter({
      ...chapter,
      user: chapter.user
        ? ({
            id: chapter.user.id,
            username: chapter.user.username,
            roles: chapter.user.roles,
          } satisfies SafeUser)
        : undefined,
      groups: flattenedGroups,
    }),
  };
});
