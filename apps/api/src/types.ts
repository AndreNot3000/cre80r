import type { organizations, users } from "@crea8or/db/schema";

export type AppVariables = {
  user: typeof users.$inferSelect | any;
  session: any;
  organization: typeof organizations.$inferSelect | any;
  role: string;
};

export type AppEnv = {
  Variables: AppVariables;
};
