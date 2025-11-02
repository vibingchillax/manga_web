import { z } from "zod";
import { formatUser } from "~~/server/utils/formatResponse";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const user = await prisma.user.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
      username: true,
      roles: true,
      groupMemberships: {
        select: {
          groupId: true,
        },
      },
    },
  });

  if (!user)
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });

  return {
    result: "ok",
    data: formatUser(user),
  };
});
