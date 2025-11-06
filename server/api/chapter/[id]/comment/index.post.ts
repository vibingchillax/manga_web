import { z } from "zod";
import { randomUUID } from "crypto";
import { CommentTargetType, UserRole } from "~~/shared/prisma/enums";
import { formatComment } from "~~/server/utils/formatResponse";

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);

  if (!user)
    throw createError({
      statusCode: 404,
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

  const comment = await prisma.comment.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      body: body.comment,
      target: {
        create: {
          targetType: CommentTargetType.chapter,
          targetId: params.id,
        },
      },
    },
  });

  return {
    result: "ok",
    data: formatComment(comment),
  };
});
