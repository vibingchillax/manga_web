import { z } from "zod";
import { UserRole } from "~~/shared/prisma/enums";

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });

  if (!user.roles.includes(UserRole.admin))
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });

  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  try {
    await prisma.author.delete({
      where: {
        id: params.id,
      },
    });

    await esDelete("authors", params.id);

    await deleteCache(`author:${params.id}:*`);
    await deleteCache(`author:list:*`);
  } catch {}

  return {
    result: "ok",
  };
});
