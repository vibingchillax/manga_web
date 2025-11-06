export default defineEventHandler(async (event) => {
  const [result, total] = await Promise.all([
    prisma.tag.findMany(),
    prisma.tag.count(),
  ]);

  return {
    result: "ok",
    data: result.map((r) => ({
      id: r.id,
      type: "tag",
      attributes: {
        name: r.name,
        description: r.description,
        group: r.group,
        version: r.version,
      },
    })),
    limit: total,
    offset: 0,
    total: total,
  };
});
