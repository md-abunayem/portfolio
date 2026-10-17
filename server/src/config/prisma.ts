import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";
import { env } from "./env";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});
const prisma = new PrismaClient({ adapter });

export default prisma;

// # For Prisma 7 - MUST use --config flag
// npx prisma generate --config prisma.config.ts