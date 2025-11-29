export default defineTask({
  meta: {
    name: "redis:evict",
    description: "Evict all redis caches",
  },
  async run() {
    await redis.flushall();
    return {
      result: "ok",
    };
  },
});
