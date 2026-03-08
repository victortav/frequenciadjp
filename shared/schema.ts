import { pgTable, text, serial, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const attendances = pgTable("attendances", {
  id: serial("id").primaryKey(),
  igreja: text("igreja").notNull(),
  adultos: integer("adultos").notNull(),
  criancas: integer("criancas").notNull(),
  convidados: integer("convidados").notNull(),
  veiculos: integer("veiculos").notNull(),
  data: date("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAttendanceSchema = createInsertSchema(attendances).omit({
  id: true,
  createdAt: true
});

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendances.$inferSelect;
