import { z } from "zod";
import { formatCustomList } from "~~/server/utils/formatResponse";
import { UserRole } from "~~/shared/prisma/enums";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const user = await getAuthenticatedUser(event);

  const list = await prisma.customList.findUnique({
    where: {
      id: params.id,
    },
    include: {
      manga: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!list)
    throw createError({
      statusCode: 404,
      statusMessage: "List not found",
    });

  if (
    list.visibility === "private" &&
    !(user?.id === list.userId || user?.roles.includes(UserRole.admin))
  ) {
    throw createError({
      statusCode: 404,
      statusMessage: "List not found",
    });
  }

  return {
    result: "ok",
    data: formatCustomList(list),
  };
});
