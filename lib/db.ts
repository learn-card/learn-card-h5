import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

const normalizedUrl = connectionString.includes('sslmode=')
  ? connectionString
  : `${connectionString}?sslmode=require`;

const globalForDb = globalThis as unknown as {
  __drizzleClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.__drizzleClient ??
  postgres(normalizedUrl, {
    max: 1,
  });

if (!globalForDb.__drizzleClient) {
  globalForDb.__drizzleClient = client;
}

export const db = drizzle(client);
export const sqlClient = client;
