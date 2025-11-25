import Redis from "ioredis";

export const redis = new Redis({
  host: process.env.NODE_ENV === "production" ? "redis" : "localhost",
  port: 6379,
});

export async function getCache<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);
  if (!cached) return null;
  try {
    return JSON.parse(cached) as T;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: any) {
  await redis.set(key, JSON.stringify(value));
}

export async function deleteCache(pattern: string) {
  const keys = await redis.keys(pattern)
  if (keys.length) await redis.del(...keys)
}

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});
