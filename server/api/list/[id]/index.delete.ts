import { z } from "zod";
import { UserRole } from "~~/shared/prisma/enums";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const user = await getAuthenticatedUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });

  const list = await prisma.customList.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!list)
    return {
      result: "ok",
    };

  if (!(user.roles.includes(UserRole.admin) || user.id === list?.userId))
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });

  await prisma.customList.delete({
    where: {
      id: params.id,
    },
  });

  await esDelete("custom_lists", params.id);
  await deleteCache(`custom_list:${user.id}`);
  await deleteCache(`custom_list:user:${user.id}:*`);

  return {
    result: "ok",
  };
});
