import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma";

const seedAdmin = async () => {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD to seed the administrator.");
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters long.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const existingAdmin = await prisma.admin.findUnique({ where: { email } });
  const admin = existingAdmin
    ? await prisma.admin.update({
        where: { id: existingAdmin.id },
        data: { ...(name ? { name } : {}), passwordHash },
      })
    : await prisma.admin.create({
        data: { name: name || "Portfolio Admin", email, passwordHash },
      });

  console.log(
    `Administrator ${admin.email} ${existingAdmin ? "updated" : "created"}.`,
  );

  if (existingAdmin) {
    await prisma.session.deleteMany({ where: { adminId: admin.id } });
    console.log("Existing administrator sessions were revoked.");
  }
};

const main = async () => {
  try {
    await seedAdmin();
  } catch (error: unknown) {
    console.error("Administrator seed failed.", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

void main();
