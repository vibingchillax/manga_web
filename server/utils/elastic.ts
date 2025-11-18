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

async function testConnection() {
  const health = await esClient.cluster.health({});
  console.log("ES Cluster Health:", health);
}

testConnection();
