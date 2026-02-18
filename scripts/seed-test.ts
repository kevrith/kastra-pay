import "dotenv/config";
import pg from "pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Use pooler URL (works from local machines)
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log("Connected to Neon database\n");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const adminResult = await client.query(
    `INSERT INTO users (id, email, name, "passwordHash", role, "isActive", "emailVerified", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, 'SUPER_ADMIN', true, NOW(), NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET "updatedAt" = NOW()
     RETURNING id, email`,
    ["admin@kastrapay.com", "Super Admin", adminPassword]
  );
  console.log("Admin user:", adminResult.rows[0].email);

  // Create merchant user
  const merchantPassword = await bcrypt.hash("merchant123", 10);
  const merchantUserResult = await client.query(
    `INSERT INTO users (id, email, name, "passwordHash", role, "isActive", "emailVerified", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, 'MERCHANT', true, NOW(), NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET "updatedAt" = NOW()
     RETURNING id, email`,
    ["merchant@test.com", "Test Merchant Owner", merchantPassword]
  );
  const merchantUserId = merchantUserResult.rows[0].id;
  console.log("Merchant user:", merchantUserResult.rows[0].email);

  // Create merchant
  const merchantResult = await client.query(
    `INSERT INTO merchants (id, "userId", "businessName", slug, "businessEmail", "businessPhone", description, status, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'ACTIVE', NOW(), NOW())
     ON CONFLICT ("userId") DO UPDATE SET status = 'ACTIVE', "updatedAt" = NOW()
     RETURNING id, "businessName"`,
    [merchantUserId, "Test Store", "test-store", "merchant@test.com", "+254712345678", "Test merchant for payment testing"]
  );
  const merchantId = merchantResult.rows[0].id;
  console.log("Merchant:", merchantResult.rows[0].businessName, "| ID:", merchantId);

  // Check for existing API key
  const existingKey = await client.query(
    `SELECT id, "keyPrefix" FROM api_keys WHERE "merchantId" = $1 LIMIT 1`,
    [merchantId]
  );

  if (existingKey.rows.length === 0) {
    const rawKey = `kp_live_test${crypto.randomBytes(16).toString("hex")}`;
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
    const keyPrefix = rawKey.slice(0, 12);

    await client.query(
      `INSERT INTO api_keys (id, "merchantId", name, "keyHash", "keyPrefix", "isActive", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW())`,
      [merchantId, "Test Key", keyHash, keyPrefix]
    );

    console.log("\n========================================");
    console.log("API Key (save this, shown only once):");
    console.log(rawKey);
    console.log("========================================");
  } else {
    console.log("API key already exists (prefix:", existingKey.rows[0].keyPrefix + ")");
  }

  console.log("\n--- Test Credentials ---");
  console.log("Admin:       admin@kastrapay.com / admin123");
  console.log("Merchant:    merchant@test.com / merchant123");
  console.log("Merchant ID:", merchantId);
}

main()
  .catch(console.error)
  .finally(async () => {
    await client.end();
    process.exit(0);
  });
