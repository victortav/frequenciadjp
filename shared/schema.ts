import { pgTable, text, serial, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const churches = pgTable("churches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  googleId: text("google_id").notNull().unique(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  picture: text("picture"),
});

export const attendances = pgTable("attendances", {
  id: serial("id").primaryKey(),
  igrejaId: integer("igreja_id").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  adultos: integer("adultos").notNull(),
  criancas: integer("criancas").notNull(),
  convidados: integer("convidados").notNull(),
  veiculos: integer("veiculos").notNull(),
  data: date("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChurchSchema = createInsertSchema(churches).omit({
  id: true
});

export const insertAttendanceSchema = createInsertSchema(attendances).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Church = typeof churches.$inferSelect;
export type InsertChurch = z.infer<typeof insertChurchSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendances.$inferSelect;
