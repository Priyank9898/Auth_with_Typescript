import "dotenv/config";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { requireEnv } from "../utils/require-env.js";

const databaseUrl = requireEnv("DATABASE_URL");
export const db: NodePgDatabase = drizzle(databaseUrl);
