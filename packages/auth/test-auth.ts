import { auth } from "./src/index";
import { db } from "@crea8or/db/client";
import { users, accounts, sessions } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";

async function runTests() {
  console.log("🚀 Starting Better Auth Test Suite...\n");

  const testEmail = `test_${Date.now()}@crea8or.io`;
  const testPassword = "Password123!";
  const testName = "Test Photographer";

  // Clean up any existing test user if needed
  console.log(`1. Testing Sign Up for: ${testEmail}...`);
  try {
    const signupRes = await auth.api.signUpEmail({
      body: {
        email: testEmail,
        password: testPassword,
        name: testName,
      },
    });
    console.log("✅ Sign Up Response:", signupRes);

    // Verify DB records
    const dbUser = await db.select().from(users).where(eq(users.email, testEmail));
    console.log("👤 DB Users Record count:", dbUser.length);
    if (dbUser.length > 0) {
      console.log("   User ID:", dbUser[0].id, "| Name:", dbUser[0].name);
      
      const dbAccounts = await db.select().from(accounts).where(eq(accounts.userId, dbUser[0].id));
      console.log("🔑 DB Accounts Record count:", dbAccounts.length);
      if (dbAccounts.length > 0) {
        console.log("   Account Provider:", dbAccounts[0].providerId, "| ID:", dbAccounts[0].id);
      } else {
        console.error("❌ ERROR: Account record was NOT created!");
      }
    } else {
      console.error("❌ ERROR: User record was NOT created in database!");
    }
  } catch (err: any) {
    console.error("❌ Sign up threw error:", err?.message || err);
  }

  console.log("\n2. Testing Duplicate Sign Up (should fail)...");
  try {
    const dupRes = await auth.api.signUpEmail({
      body: {
        email: testEmail,
        password: testPassword,
        name: "Duplicate User",
      },
    });
    console.error("❌ ERROR: Duplicate sign up succeeded when it should have failed!", dupRes);
  } catch (err: any) {
    console.log("✅ Duplicate signup correctly rejected with error:", err?.message || err);
  }

  console.log("\n3. Testing Sign In with correct credentials...");
  try {
    const signinRes = await auth.api.signInEmail({
      body: {
        email: testEmail,
        password: testPassword,
      },
    });
    console.log("✅ Sign In Success:", signinRes?.user?.email, "| Session Token exists:", !!signinRes?.token || !!signinRes?.session?.token);
  } catch (err: any) {
    console.error("❌ Sign in failed:", err?.message || err);
  }

  console.log("\n4. Testing Sign In with WRONG password (should fail)...");
  try {
    const wrongRes = await auth.api.signInEmail({
      body: {
        email: testEmail,
        password: "WrongPassword999!",
      },
    });
    console.error("❌ ERROR: Sign in with wrong password succeeded!", wrongRes);
  } catch (err: any) {
    console.log("✅ Wrong password correctly rejected with error:", err?.message || err);
  }

  console.log("\n✨ Better Auth Tests Finished!");
  process.exit(0);
}

runTests().catch((e) => {
  console.error("Fatal test error:", e);
  process.exit(1);
});
