import { z } from "zod";

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });

  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const list = await prisma.customList.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!list)
    throw createError({
      statusCode: 404,
      statusMessage: "List not found",
    });

  if (!(list.userId === user.id) && list.visibility === "private")
    throw createError({
      statusCode: 404,
      statusMessage: "List not found",
    });

  await prisma.listFollow.upsert({
    where: {
      userId_listId: {
        userId: user.id,
        listId: params.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      listId: params.id,
    },
  });

  return {
    result: "ok",
  };
});
