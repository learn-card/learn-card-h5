import { defineConfig } from 'drizzle-kit'

envGuard('POSTGRES_URL')

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
})

function envGuard(key: string) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable ${key}`)
  }
}
