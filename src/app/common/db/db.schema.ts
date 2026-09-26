import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { ROLES } from "../constants/roles.js";

export const roleEnum = pgEnum(
  "role",
  Object.values(ROLES) as [string, ...string[]],
);

export const userTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 45 }).notNull(),
  lastName: varchar("last_name", { length: 45 }),
  email: varchar("email", { length: 322 }).unique().notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  password: text("password"),
  role: roleEnum("role").default(ROLES.CUSTOMER),

  verificationToken: varchar("verification_token", { length: 64 }),
  refreshToken: varchar("refresh_token"),
  resetPasswordToken: varchar("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  salt: text("salt").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
