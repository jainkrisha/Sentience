/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: process.env.NEXT_PUBLIC_DRIZZLE_DB_URL || "postgresql://neondb_owner:npg_12zielKrNETp@ep-square-paper-anjjrldb-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    }
  }