// `pnpm db:seed` (prisma db seed): an admin account and a welcome message in #general.
// Safe to run again: existing records are left as they are. Reads MONGODB_URI and ADMIN_* from the environment.
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

const admin = {
  email: process.env.ADMIN_EMAIL || "admin@chat.local",
  password: process.env.ADMIN_PASSWORD || "Admin123!",
  name: process.env.ADMIN_NAME || "admin",
};

// Stored the way better-auth's email/password sign-up stores it: a user plus a "credential" account with the hash
async function seedAdmin() {
  const existing = await prisma.user.findUnique({ where: { email: admin.email } });
  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { role: "admin" } });
    return existing;
  }
  const user = await prisma.user.create({
    data: { name: admin.name, email: admin.email, emailVerified: true, role: "admin" },
  });
  await prisma.account.create({
    data: {
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: await hashPassword(admin.password),
    },
  });
  return user;
}

async function seedWelcomeMessage(user) {
  if ((await prisma.message.count({ where: { room: "general" } })) > 0) return;
  await prisma.message.create({
    data: { room: "general", user: user.name, userId: user.id, text: "Welcome to #general 👋" },
  });
}

try {
  const user = await seedAdmin();
  await seedWelcomeMessage(user);
  console.log(`Seeded admin ${admin.email}`);
} finally {
  await prisma.$disconnect();
}
