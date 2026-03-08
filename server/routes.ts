import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.attendances.list.path, async (req, res) => {
    const data = await storage.getAttendances();
    res.json(data);
  });

  app.post(api.attendances.create.path, async (req, res) => {
    try {
      // Coerce numeric strings to numbers and date strings to dates as needed
      const bodySchema = api.attendances.create.input.extend({
        adultos: z.coerce.number(),
        criancas: z.coerce.number(),
        convidados: z.coerce.number(),
        veiculos: z.coerce.number(),
      });
      const input = bodySchema.parse(req.body);
      const data = await storage.createAttendance(input);
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
