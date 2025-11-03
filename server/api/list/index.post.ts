import { z } from "zod";
import { randomUUID } from "crypto";
import { formatCustomList } from "~~/server/utils/formatResponse";

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });

  const body = await readValidatedBody(
    event,
    z.object({
      name: zName,
      visibility: z.enum(["public", "private"]).default("public"),
      manga: zUniqueUuidArray,
    }).parse,
  );

  const created = await prisma.customList.create({
    data: {
      id: randomUUID(),
      name: body.name,
      visibility: body.visibility,
      userId: user.id,
      manga: {
        connect: body.manga.map((id) => ({ id })),
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

  return {
    result: "ok",
    data: formatCustomList(created),
  };
});
