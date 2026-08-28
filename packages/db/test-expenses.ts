import { db } from "./src/client";
import { expenses, projects, organizations, clients, invoices } from "./src/schema";
import { eq, and, sql } from "drizzle-orm";

async function runExpensesTestSuite() {
  console.log("🚀 Starting Section 6A: Studio Expenses & P&L Margins Test Suite...\n");

  // Ensure table exists via SQL if not already pushed
  try {
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "public"."expense_category" AS ENUM('crew_fees', 'gear_rentals', 'transport_logistics', 'studio_rental', 'post_production', 'props_styling', 'software_subscriptions', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS "expenses" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE cascade,
        "project_id" uuid REFERENCES "projects"("id") ON DELETE set null,
        "category" "expense_category" DEFAULT 'other' NOT NULL,
        "description" text NOT NULL,
        "vendor" text,
        "amount" numeric(12, 2) NOT NULL,
        "currency" "currency" DEFAULT 'NGN' NOT NULL,
        "receipt_url" text,
        "expense_date" timestamp DEFAULT now() NOT NULL,
        "payment_method" text DEFAULT 'bank_transfer',
        "is_reimbursable" boolean DEFAULT false NOT NULL,
        "is_paid" boolean DEFAULT true NOT NULL,
        "notes" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
  } catch (err) {
    console.log("Table check note:", err);
  }

  // 1. Setup test organization
  console.log("1. Setting up test organization...");
  let [testOrg] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, "test-studio-crm"));

  if (!testOrg) {
    [testOrg] = await db
      .insert(organizations)
      .values({
        name: "Test CRM Creative Studio",
        slug: "test-studio-crm",
        currency: "NGN",
      })
      .returning();
  }
  console.log(`✅ Test Organization ready: ${testOrg.name} (${testOrg.id})`);

  // 2. Setup test project
  console.log("\n2. Setting up test shoot project...");
  let [testProject] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.name, "Adeola & Tolu Wedding Shoot"), eq(projects.organizationId, testOrg.id)));

  if (!testProject) {
    [testProject] = await db
      .insert(projects)
      .values({
        organizationId: testOrg.id,
        name: "Adeola & Tolu Wedding Shoot",
        description: "Full-day wedding cinema & photography package",
        status: "editing",
      })
      .returning();
  }
  console.log(`✅ Test Project ready: ${testProject.name} (${testProject.id})`);

  // 3. Log categorized shoot expenses
  console.log("\n3. Logging categorized studio expenses...");
  const expensePayloads = [
    {
      organizationId: testOrg.id,
      projectId: testProject.id,
      category: "crew_fees" as const,
      description: "Assistant Camera & Second Shooter Day Rate (Kola Studios)",
      vendor: "Kola Studios",
      amount: "150000.00",
      paymentMethod: "bank_transfer",
      isPaid: true,
      notes: "Main reception coverage",
    },
    {
      organizationId: testOrg.id,
      projectId: testProject.id,
      category: "gear_rentals" as const,
      description: "Sony FX6 Camera Body + 24-70mm GM II 2-Day Rental",
      vendor: "Lagos Cine Rentals",
      amount: "120000.00",
      paymentMethod: "debit_card",
      isPaid: true,
      notes: "4K 120fps slow motion setup",
    },
    {
      organizationId: testOrg.id,
      projectId: testProject.id,
      category: "transport_logistics" as const,
      description: "Crew Van Fuel & Tolls to Epe Resort",
      vendor: "Total Energies Victoria Island",
      amount: "45000.00",
      paymentMethod: "cash",
      isPaid: true,
      isReimbursable: true,
    },
    {
      organizationId: testOrg.id,
      projectId: null,
      category: "software_subscriptions" as const,
      description: "Frame.io Pro + Adobe Creative Cloud Suite",
      vendor: "Adobe Inc",
      amount: "65000.00",
      paymentMethod: "debit_card",
      isPaid: true,
    },
  ];

  const insertedExpenses = await db.insert(expenses).values(expensePayloads).returning();
  console.log(`✅ ${insertedExpenses.length} categorized expenses logged successfully.`);
  for (const exp of insertedExpenses) {
    console.log(`   - [${exp.category.toUpperCase()}] ${exp.description}: ₦${Number(exp.amount).toLocaleString()}`);
  }

  // 4. Query P&L Aggregations
  console.log("\n4. Calculating Net Profit Margins & Cost Centers...");
  const totalExpensesResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(amount), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(expenses)
    .where(eq(expenses.organizationId, testOrg.id));

  console.log(`✅ Total Studio Expenses: ₦${Number(totalExpensesResult[0]?.total || 0).toLocaleString()} across ${totalExpensesResult[0]?.count} transactions`);

  // Project-specific expenses
  const projectExpensesResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(amount), 0)`,
    })
    .from(expenses)
    .where(and(eq(expenses.organizationId, testOrg.id), eq(expenses.projectId, testProject.id)));

  const projectGrossRevenue = 1500000; // e.g. ₦1,500,000 package
  const projectCost = Number(projectExpensesResult[0]?.total || 0);
  const projectNetProfit = projectGrossRevenue - projectCost;
  const projectMarginPct = Math.round((projectNetProfit / projectGrossRevenue) * 100);

  console.log(`✅ Project P&L Summary for "${testProject.name}":`);
  console.log(`   Gross Revenue: ₦${projectGrossRevenue.toLocaleString()}`);
  console.log(`   Shoot Expenses: ₦${projectCost.toLocaleString()}`);
  console.log(`   Net Profit: ₦${projectNetProfit.toLocaleString()}`);
  console.log(`   Net Profit Margin: ${projectMarginPct}%`);

  // 5. Update an expense
  console.log("\n5. Testing expense update...");
  const firstExp = insertedExpenses[0]!;
  const [updatedExp] = await db
    .update(expenses)
    .set({
      amount: "165000.00",
      notes: "Updated with overtime hours for reception extension",
      updatedAt: new Date(),
    })
    .where(eq(expenses.id, firstExp.id))
    .returning();

  console.log(`✅ Expense updated: ${updatedExp.description} now ₦${Number(updatedExp.amount).toLocaleString()}`);

  // 6. Cleanup test records
  console.log("\n6. Cleaning up test expenses...");
  for (const exp of insertedExpenses) {
    await db.delete(expenses).where(eq(expenses.id, exp.id));
  }
  console.log("✅ Cleanup complete.");

  console.log("\n✨ All Card 6.1 Studio Expenses & P&L Margins Tests Passed Successfully!\n");
}

runExpensesTestSuite().catch((err) => {
  console.error("❌ Expenses Test Suite Error:", err);
  process.exit(1);
});
