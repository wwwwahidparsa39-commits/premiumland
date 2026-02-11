import bcrypt from "bcryptjs";
import { db } from "./db";
import { adminUsers } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedAdminUser() {
  try {
    const defaultUsername = "admin";
    const defaultPassword = "Wahid2026#$"; // Same as the old hardcoded password

    // Check if admin user already exists
    const [existingUser] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, defaultUsername))
      .limit(1);

    if (existingUser) {
      console.log("Admin user already exists, skipping seed");
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Create admin user
    await db.insert(adminUsers).values({
      username: defaultUsername,
      passwordHash,
    });

    console.log("✅ Default admin user created:");
    console.log(`   Username: ${defaultUsername}`);
    console.log(`   Password: ${defaultPassword}`);
    console.log("   ⚠️  Please change the password after first login!");
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}
