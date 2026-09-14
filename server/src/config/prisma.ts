import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export default prisma;

// # For Prisma 7 - MUST use --config flag
// npx prisma generate --config prisma.config.ts