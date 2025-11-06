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

  const body = await readValidatedBody(
    event,
    z.object({
      vote: z.number().min(-1).max(1),
    }).parse,
  );

  const comment = await prisma.comment.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
    },
  });

  if (!comment)
    throw createError({
      statusCode: 404,
      statusMessage: "Comment not found",
    });

  await prisma.commentVote.upsert({
    where: {
      userId_commentId: {
        userId: user.id,
        commentId: params.id,
      },
    },
    update: {
      vote: body.vote,
    },
    create: {
      userId: user.id,
      commentId: params.id,
      vote: body.vote,
    },
  });

  return {
    result: "ok",
  };
});
