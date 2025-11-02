import { z } from "zod";
import { formatGroup } from "~~/server/utils/formatResponse";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({ id: zUuid }).parse,
  );

  const group = await prisma.scanlationGroup.findUnique({
    where: {
      id: params.id,
    },
    include: {
      members: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
              roles: true,
            },
          },
          role: true,
        },
      },
    },
  });

  if (!group)
    throw createError({
      statusCode: 404,
      statusMessage: "Group not found",
    });

  return {
    result: "ok",
    data: formatGroup(group),
  };
});
