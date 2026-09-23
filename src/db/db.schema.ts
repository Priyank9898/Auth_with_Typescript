// Tables will be defined here
import {
  integer,
  pgTable,
  varchar,
  uuid,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  firstName: varchar("first_name", { length: 45 }).notNull(),
  lastName: varchar("last_name", { length: 45 }),

  email: varchar("email", { length: 322 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),

  password: text("password"),
  salt: text("salt").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
