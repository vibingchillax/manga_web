import path from "node:path";
import { defineConfig, env } from "prisma/config";
import { getDatabaseUrl } from "./shared/dbUrl";
import "dotenv/config";

process.env.DATABASE_URL = getDatabaseUrl();

export default defineConfig({
  schema: path.join("prisma", "schema"),
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
