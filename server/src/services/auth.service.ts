import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { hashSessionToken } from "../utils/sessionToken";
import { ApiError } from "../utils/ApiError";

const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;

const safeAdmin = (admin: { id: string; name: string; email: string }) => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
});

export const createAdminSession = async (email: string, password: string) => {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  await prisma.session.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionDurationMs);
  await prisma.session.create({
    data: {
      tokenHash: hashSessionToken(token),
      adminId: admin.id,
      expiresAt,
    },
  });

  return { admin: safeAdmin(admin), token, expiresAt };
};

export const revokeSession = async (token?: string) => {
  if (!token) return;
  await prisma.session.deleteMany({
    where: { tokenHash: hashSessionToken(token) },
  });
};

export const revokeAllSessions = (adminId: string) =>
  prisma.session.deleteMany({ where: { adminId } });

export const changeAdminPassword = async (
  adminId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin || !(await bcrypt.compare(currentPassword, admin.passwordHash))) {
    throw new ApiError(401, "Current password is incorrect.");
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionDurationMs);
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction(async (transaction) => {
    await transaction.admin.update({
      where: { id: admin.id },
      data: { passwordHash },
    });
    await transaction.session.deleteMany({ where: { adminId } });
    await transaction.session.create({
      data: {
        tokenHash: hashSessionToken(token),
        adminId,
        expiresAt,
      },
    });
  });

  return { admin: safeAdmin(admin), token, expiresAt };
};
