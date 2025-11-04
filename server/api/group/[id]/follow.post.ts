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

  const group = await prisma.scanlationGroup.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!group)
    throw createError({
      statusCode: 404,
      statusMessage: "Group not found",
    });

  await prisma.groupFollow.upsert({
    where: {
      userId_groupId: {
        userId: user.id,
        groupId: params.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      groupId: params.id,
    },
  });

  return {
    result: "ok",
  };
});
