import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema/index";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/crea8or";

// For migrations (not pooled)
export const migrationClient = postgres(connectionString, { max: 1 });

// For queries (pooled)
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

export type Database = typeof db;
