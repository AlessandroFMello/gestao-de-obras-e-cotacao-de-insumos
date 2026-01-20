import 'dotenv/config';
import { PrismaClient } from '../../../prisma/generated/client.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';

let prismaClient: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaClient) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        'DATABASE_URL environment variable is required. ' +
          'Set it in .env file or pass it as an environment variable.'
      );
    }

    // Prisma 7.2+ requires adapter (MariaDB adapter works with MySQL)
    // Parse connection string and create pool manually
    const url = new URL(connectionString.replace('mysql://', 'http://'));

    const poolConfig: mariadb.PoolConfig = {
      host: url.hostname || 'localhost',
      port: parseInt(url.port || '3306'),
      user: url.username || 'root',
      password: url.password || '',
      database: url.pathname.replace('/', '') || '',
      connectionLimit: 20,
      acquireTimeout: 60000, // 60 seconds
      idleTimeout: 300000, // 5 minutes
    };

    const adapter = new PrismaMariaDb(poolConfig as any);

    prismaClient = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return prismaClient;
}

export async function disconnectPrisma(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = null;
  }
}
