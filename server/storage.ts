import { db } from "./db";
import { attendances, churches, users, type InsertAttendance, type Attendance, type Church, type User, type InsertUser } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createOrUpdateUser(user: InsertUser): Promise<User>;
  getChurches(): Promise<Church[]>;
  getAttendances(userId?: number): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance & { userId: number }): Promise<Attendance>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async createOrUpdateUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .onConflictDoUpdate({
        target: users.googleId,
        set: {
          email: insertUser.email,
          displayName: insertUser.displayName,
          picture: insertUser.picture,
        },
      })
      .returning();
    return user;
  }

  async getChurches(): Promise<Church[]> {
    return await db.select().from(churches).orderBy(churches.name);
  }

  async getAttendances(userId?: number): Promise<Attendance[]> {
    if (userId) {
      return await db.select().from(attendances).where(eq(attendances.userId, userId)).orderBy(desc(attendances.data));
    }
    return await db.select().from(attendances).orderBy(desc(attendances.data));
  }

  async createAttendance(insertAttendance: InsertAttendance & { userId: number }): Promise<Attendance> {
    const [attendance] = await db
      .insert(attendances)
      .values(insertAttendance)
      .onConflictDoUpdate({
        target: [attendances.igrejaId, attendances.data, attendances.userId],
        set: {
          adultos: insertAttendance.adultos,
          criancas: insertAttendance.criancas,
          convidados: insertAttendance.convidados,
          veiculos: insertAttendance.veiculos,
        },
      })
      .returning();
    return attendance;
  }
}

export const storage = new DatabaseStorage();
