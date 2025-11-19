import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
  node:
    process.env.NODE_ENV === "production"
      ? "http://elasticsearch:9200"
      : "http://localhost:9200",
  auth: {
    username: "elastic",
    password: useRuntimeConfig().esPassword,
  },
});
