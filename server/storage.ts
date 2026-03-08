import { db } from "./db";
import { attendances, churches, type InsertAttendance, type Attendance, type Church } from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  getChurches(): Promise<Church[]>;
  getAttendances(): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
}

export class DatabaseStorage implements IStorage {
  async getChurches(): Promise<Church[]> {
    return await db.select().from(churches).orderBy(churches.name);
  }

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
