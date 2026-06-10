import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
	id: int().primaryKey({ autoIncrement: true }),
	email: text().notNull(),
	date: text("date").notNull().default(sql`(current_date)`),
	isVerified: int("is_verified", { mode: "boolean" }).default(false),
	register_time: text("timestamp").notNull().default(sql`(current_timestamp)`),
});

export const otpTable = sqliteTable("otp_table", {
	id: int().primaryKey({ autoIncrement: true }),
	email: text().notNull(),
	otp: text().notNull(),
	expiry_time: text("expiry_time").notNull(),
});
