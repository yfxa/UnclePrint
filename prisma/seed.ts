import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@print3d.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";

  const hashed = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "admin" },
    create: {
      email: adminEmail,
      name: "Admin",
      password: hashed,
      role: "admin",
    },
  });

  console.log(`✓ Admin user: ${admin.email} (password: ${adminPassword})`);
  console.log("  Change this password immediately in production!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
