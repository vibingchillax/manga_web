import path from "node:path"
import { defineConfig } from "prisma/config";
import "dotenv/config"

process.env.DATABASE_URL = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:${process.env.DB_PORT}/${process.env.DB_NAME}`

export default defineConfig({
  schema: path.join("prisma", "schema")
})