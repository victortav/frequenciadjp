import { db } from "./db";
import { attendances, type InsertAttendance, type Attendance } from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  getAttendances(): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
}

export class DatabaseStorage implements IStorage {
  async getAttendances(): Promise<Attendance[]> {
    return await db.select().from(attendances).orderBy(desc(attendances.data));
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const [attendance] = await db
      .insert(attendances)
      .values(insertAttendance)
      .returning();
    return attendance;
  }
}

export const storage = new DatabaseStorage();
