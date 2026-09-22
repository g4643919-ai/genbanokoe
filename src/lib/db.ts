import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Ensure DATABASE_URL is set for SQLite in production/serverless environment
if (!process.env.DATABASE_URL) {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  process.env.DATABASE_URL = `file:${dbPath}`;
} else if (process.env.DATABASE_URL.startsWith("file:./")) {
  const relativePath = process.env.DATABASE_URL.replace("file:./", "");
  const dbPath = path.join(process.cwd(), "prisma", relativePath);
  process.env.DATABASE_URL = `file:${dbPath}`;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
