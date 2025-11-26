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

  const body = await readValidatedBody(
    event,
    z.object({
      name: zName,
      visibility: z.enum(["public", "private"]).default("public"),
      manga: zUniqueUuidArray,
    }).parse,
  );

  const updated = await prisma.customList.update({
    where: {
      id: params.id,
    },
    data: {
      name: body.name,
      visibility: body.visibility,
      manga: {
        connect: body.manga.map((id) => ({ id })),
      },
      version: {
        increment: 1,
      },
    },
    include: {
      manga: {
        select: {
          id: true,
        },
      },
    },
  });

  const formatted = formatCustomList(updated);

  await esIndex("custom_lists", formatted.id, formatted);
  await deleteCache(`custom_list:${formatted.id}`);
  await deleteCache(`custom_list:user:${updated.userId}`);

  return {
    result: "ok",
    data: formatCustomList(updated),
  };
});
