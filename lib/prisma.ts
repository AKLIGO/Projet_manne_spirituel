import { PrismaClient } from '../generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma v7 : PrismaMariaDb accepte un objet de configuration directement
export const prisma = globalForPrisma.prisma ?? (() => {
  const adapter = new PrismaMariaDb({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'akligo',
    database: 'manne_spirituelle_db',
    connectionLimit: 5,
  })
  return new PrismaClient({ adapter })
})()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
