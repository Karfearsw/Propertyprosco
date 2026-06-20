import 'server-only'
import { PrismaClient } from '@prisma/client'
import { requireDatabaseUrl } from '@/lib/env'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

void requireDatabaseUrl()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error'] : [] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
