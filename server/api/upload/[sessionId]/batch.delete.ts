import { z } from "zod";

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Not logged in",
    });

  const params = await getValidatedRouterParams(
    event,
    z.object({
      sessionId: zUuid,
    }).parse,
  );

  const body = await readValidatedBody(event, z.array(zUuid).parse);

  await prisma.uploadSessionFile.deleteMany({
    where: {
      id: { in: body },
      sessionId: params.sessionId,
    },
  });

  return {
    result: "ok",
  };
});
