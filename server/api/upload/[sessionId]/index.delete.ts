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

  const files = await prisma.uploadSessionFile.findMany({
    where: {
      sessionId: params.sessionId,
    },
  });

  for (const file of files) {
    await kubo.pin.rm(file.cid);
  }

  await prisma.uploadSession.delete({
    where: {
      id: params.sessionId,
      userId: user.id,
    },
  });

  return {
    result: "ok",
  };
});
