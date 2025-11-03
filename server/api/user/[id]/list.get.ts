import { paginationSchema } from "~~/shared/utils/zodHelper";
import { z } from "zod";
import { UserRole } from "~~/shared/prisma/enums";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const query = await getValidatedQuery(event, paginationSchema.parse);

  const user = await getAuthenticatedUser(event);

  const seePrivate =
    user?.id === params.id || user?.roles.includes(UserRole.admin);

  const [lists, total] = await Promise.all([
    prisma.customList.findMany({
      take: query.limit ?? 10,
      skip: query.offset ?? 0,
      where: {
        userId: params.id,
        ...(seePrivate ? {} : { visibility: "public" }),
      },
    }),

    prisma.customList.count({
      where: {
        userId: params.id,
        ...(seePrivate ? {} : { visibility: "public" }),
      },
    }),
  ]);

  return {
    result: "ok",
    data: lists.map(formatCustomList),
    limit: query.limit ?? 10,
    offset: query.offset ?? 0,
    count: total,
  };
});
