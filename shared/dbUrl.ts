export const getDatabaseUrl = () =>
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.NODE_ENV === "production" ? "db" : "localhost"}:5432/${process.env.DB_NAME}`;
//man... prisma schema files cant read .env variable interpolation
