import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import * as schema from "./schema";

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL not set. Add it to .env");
    process.exit(1);
  }

  console.log("🌱 Starting database seed...\n");

  const client = createClient({ url: connectionString });
  const db = drizzle(client, { schema });

  try {
    // 1. Create store settings
    console.log("📋 Creating store settings...");
    await db
      .insert(schema.storeSettings)
      .values({
        id: 1,
        name: "PharmaCare Medical Store",
        gstin: "",
        drugLicenseNo: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        email: "",
        invoicePrefix: "INV",
        isInterStateDefault: false,
      })
      .onConflictDoNothing();
    console.log("   ✅ Store settings created\n");

    // 2. Create default admin user
    console.log("👤 Creating default admin user...");
    const passwordHash = await bcrypt.hash("admin123", 12);
    await db
      .insert(schema.users)
      .values({
        name: "Admin",
        email: "admin@pharmacy.com",
        passwordHash,
        role: "owner",
        isActive: true,
      })
      .onConflictDoNothing();
    console.log("   ✅ Admin user created");
    console.log("   📧 Email: admin@pharmacy.com");
    console.log("   🔑 Password: admin123\n");

    console.log("✨ Seed completed successfully!");
    console.log("   Run 'npm run dev' to start the application.\n");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

seed();
