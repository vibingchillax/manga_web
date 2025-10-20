import path from "node:path"
import { defineConfig } from "prisma/config";
import { getDatabaseUrl } from "./shared/dbUrl"
import "dotenv/config"

process.env.DATABASE_URL = getDatabaseUrl()

export default defineConfig({
  schema: path.join("prisma", "schema"),
})