import { isbot } from "isbot";

export async function incrementView(
  type: "manga" | "chapter",
  id: string,
  userId?: string,
  ip?: string,
  userAgent?: string,
) {
  if (process.env.NODE_ENV !== "production") return;

  if (userAgent && isbot(userAgent)) return;
  const viewer = userId ?? ip;
  if (!viewer) return;

  const throttleKey = `${type}:${id}:throttle:${viewer}`;
  const alreadyCounted = await redis.get(throttleKey);
  if (alreadyCounted) return;

  const key = `${type}:${id}:views`;
  await redis.incr(key);
  await redis.set(throttleKey, "1", "EX", 3600);
}

export async function flushViews() {
  if (process.env.NODE_ENV !== "production") return;
  console.log("Flusing view count...");
  const keys = await redis.keys("*:views");

  for (const key of keys) {
    const count = await redis.get(key);
    if (!count) continue;

    const [type, id] = key.split(":");
    const increment = parseInt(count);

    if (type === "manga") {
      await prisma.manga.update({
        where: {
          id: id,
        },
        data: {
          viewCount: {
            increment: increment,
          },
        },
      });
    } else if (type === "chapter") {
      await prisma.uploadedChapter.update({
        where: {
          id: id,
        },
        data: {
          viewCount: {
            increment: increment,
          },
        },
      });
    }

    await redis.del(key);
  }
}
