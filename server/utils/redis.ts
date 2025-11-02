import Redis from "ioredis";

export const redis = new Redis({
  host: process.env.NODE_ENV === "production" ? "redis" : "localhost",
  port: 6379,
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});
