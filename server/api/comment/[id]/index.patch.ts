import { z } from "zod";
import { UserRole } from "~~/shared/prisma/enums";

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });

  if (user.roles.includes(UserRole.banned))
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

  const body = await readValidatedBody(
    event,
    z.object({
      comment: z.string().min(1),
    }).parse,
  );

  const comment = await prisma.comment.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!comment)
    throw createError({
      statusCode: 404,
      statusMessage: "Comment not found",
    });

  if (comment.userId !== user.id && !user.roles.includes(UserRole.admin))
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });

  await prisma.comment.update({
    where: {
      id: comment.id,
    },
    data: {
      body: body.comment,
    },
  });

  return {
    result: "ok",
  };
});
