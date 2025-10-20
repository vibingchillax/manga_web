import { PrismaClient } from '#shared/prisma/client'
import { getDatabaseUrl } from '#shared/dbUrl'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma || new PrismaClient({
    datasourceUrl: getDatabaseUrl()
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma