import postgres from "postgres";

async function main() {
  const url = "postgresql://postgres:postgres@localhost:5432/crea8or";
  console.log("Resetting public schema in 'crea8or'...");
  
  try {
    const sql = postgres(url, { max: 1 });
    await sql.unsafe("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;");
    console.log("✓ Public schema reset cleanly.");
    await sql.end();
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

main();
