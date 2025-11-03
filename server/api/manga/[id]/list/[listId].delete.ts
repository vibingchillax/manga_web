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
      listId: zUuid,
    }).parse,
  );

  const list = await prisma.customList.findUnique({
    where: { id: params.listId },
    select: { userId: true },
  });

  if (!list) {
    throw createError({ statusCode: 404, statusMessage: "List not found" });
  }

  if (list.userId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  await prisma.customList.update({
    where: {
      id: params.listId,
    },
    data: {
      manga: {
        disconnect: { id: params.id },
      },
    },
  });

  return {
    result: "ok",
  };
});
