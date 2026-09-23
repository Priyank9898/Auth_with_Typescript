import "dotenv/config";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { requireEnv } from "../app/utils/require-env.js";

const databaseUrl = requireEnv("DATABASE_URL");

// remote control for the DB
// Its an object with methods like .select(), .update(), .delete()
// *await db.select().from(users);  ---> The moment when the actual connection is made to DB
export const db: NodePgDatabase = drizzle(databaseUrl);
