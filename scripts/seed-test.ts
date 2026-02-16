import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding test data...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@kastrapay.com" },
    update: {},
    create: {
      email: "admin@kastrapay.com",
      name: "Super Admin",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
      isActive: true,
      emailVerified: new Date(),
    },
  });
  console.log("Admin user:", admin.email);

  // Create merchant user
  const merchantPassword = await bcrypt.hash("merchant123", 10);
  const merchantUser = await prisma.user.upsert({
    where: { email: "merchant@test.com" },
    update: {},
    create: {
      email: "merchant@test.com",
      name: "Test Merchant Owner",
      passwordHash: merchantPassword,
      role: "MERCHANT",
      isActive: true,
      emailVerified: new Date(),
    },
  });
  console.log("Merchant user:", merchantUser.email);

  // Create merchant
  const merchant = await prisma.merchant.upsert({
    where: { userId: merchantUser.id },
    update: { status: "ACTIVE" },
    create: {
      userId: merchantUser.id,
      businessName: "Test Store",
      slug: "test-store",
      businessEmail: "merchant@test.com",
      businessPhone: "+254712345678",
      description: "Test merchant for payment testing",
      status: "ACTIVE",
    },
  });
  console.log("Merchant:", merchant.businessName, "ID:", merchant.id);

  // Create API key for the merchant
  const rawKey = `kp_live_test${crypto.randomBytes(16).toString("hex")}`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 12);

  const existingKey = await prisma.apiKey.findFirst({
    where: { merchantId: merchant.id },
  });

  if (!existingKey) {
    await prisma.apiKey.create({
      data: {
        merchantId: merchant.id,
        name: "Test Key",
        keyHash,
        keyPrefix,
        isActive: true,
      },
    });
    console.log("\nAPI Key (save this, shown only once):");
    console.log(rawKey);
  } else {
    console.log("API key already exists for this merchant");
    console.log("Key prefix:", existingKey.keyPrefix);
  }

  console.log("\n--- Test Credentials ---");
  console.log("Admin:    admin@kastrapay.com / admin123");
  console.log("Merchant: merchant@test.com / merchant123");
  console.log("Merchant ID:", merchant.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
