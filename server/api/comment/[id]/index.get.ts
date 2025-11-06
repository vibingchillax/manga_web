import { z } from "zod";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const comment = await prisma.comment.findUnique({
    where: {
      id: params.id,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          roles: true,
        },
      },
      votes: { select: { vote: true } },
      _count: { select: { replies: true } },
    },
  });

  if (!comment)
    throw createError({
      statusCode: 404,
      statusMessage: "Comment not found",
    });

  return {
    result: "ok",
    data: formatComment(comment),
  };
});
