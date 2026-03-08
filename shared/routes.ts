import { z } from "zod";
import { insertAttendanceSchema, attendances } from "./schema";

export { insertAttendanceSchema, attendances };

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  attendances: {
    list: {
      method: "GET" as const,
      path: "/api/attendances" as const,
      responses: {
        200: z.array(z.custom<typeof attendances.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/attendances" as const,
      input: insertAttendanceSchema,
      responses: {
        201: z.custom<typeof attendances.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
