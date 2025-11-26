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
  const cacheKey = `custom_list:${params.id}`;
  const cached: any = await getCache(cacheKey);

  if (cached) {
    const isOwner =
      user?.id ===
      cached.data.relationships?.find((r: any) => r.type === "user")?.id;
    const isAdmin = user?.roles?.includes(UserRole.admin);

    if (
      cached.data.attributes.visibility === "private" &&
      !(isOwner || isAdmin)
    ) {
      throw createError({ statusCode: 404, statusMessage: "List not found" });
    }

    return cached;
  }

  const list: any = await esSearch("custom_lists", params.id);

  if (!list) {
    throw createError({
      statusCode: 404,
      statusMessage: "List not found",
    });
  }

  const isOwner =
    user?.id === list.relationships?.find((r: any) => r.type === "user")?.id;
  const isAdmin = user?.roles.includes(UserRole.admin);

  if (list.visibility === "private" && !(isOwner || isAdmin)) {
    throw createError({
      statusCode: 404,
      statusMessage: "List not found",
    });
  }

  const response = {
    result: "ok",
    data: list,
  };

  await setCache(cacheKey, response);

  return response;
});
