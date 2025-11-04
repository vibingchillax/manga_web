import { MangaFollowStatus } from "~~/shared/prisma/enums";
import { z } from "zod";

const schema = z.object({
  status: z.nativeEnum(MangaFollowStatus),
});

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Not logged in",
    });

  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const body = await readValidatedBody(event, schema.parse);

  await prisma.mangaFollow.upsert({
    where: {
      userId_mangaId: {
        userId: user.id,
        mangaId: params.id,
      },
    },
    update: {
      status: body.status ?? "reading",
    },
    create: {
      userId: user.id,
      mangaId: params.id,
      status: body.status ?? "reading",
    },
  });

  return {
    status: "ok",
  };
});
