import { z } from "zod";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const cacheKey = `user:${params.id}}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const user = await esGetById("users", params.id);

  if (!user)
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });

  const response = {
    result: "ok",
    data: user,
  };

  await setCache(cacheKey, response);

  return response;
});
