import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "dotenv";

declare global {
  var prisma: PrismaClient | undefined;
  var prismaPool: Pool | undefined;
}

if (process.env.NODE_ENV !== "production") {
  config({ path: ".env" });
  config({ path: ".env.local", override: true });
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const pool = global.prismaPool ?? new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = global.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
  global.prismaPool = pool;
}
