import { z } from "zod";
import { insertAttendanceSchema, attendances, insertChurchSchema, churches } from "./schema";

export { insertAttendanceSchema, attendances, insertChurchSchema, churches };

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
  auth: {
    me: {
      method: "GET" as const,
      path: "/api/auth/me" as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>().nullable(),
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/auth/logout" as const,
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
  },
  churches: {
    list: {
      method: "GET" as const,
      path: "/api/churches" as const,
      responses: {
        200: z.array(z.custom<typeof churches.$inferSelect>()),
      },
    },
  },
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
      input: insertAttendanceSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof attendances.$inferSelect>(),
        400: errorSchemas.validation,
        401: z.object({ message: z.string() }),
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
