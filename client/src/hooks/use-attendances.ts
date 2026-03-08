import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertAttendance, type Attendance, churches } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useChurches() {
  return useQuery({
    queryKey: [api.churches.list.path],
    queryFn: async () => {
      const res = await fetch(api.churches.list.path, { credentials: "include" });
      if (!res.ok) throw new Error('Falha ao carregar igrejas');
      const data = await res.json();
      return parseWithLogging(api.churches.list.responses[200], data, "churches.list");
    },
  });
}

export function useAttendances() {
  return useQuery({
    queryKey: [api.attendances.list.path],
    queryFn: async () => {
      const res = await fetch(api.attendances.list.path, { credentials: "include" });
      if (!res.ok) throw new Error('Falha ao carregar frequências');
      const data = await res.json();
      return parseWithLogging(api.attendances.list.responses[200], data, "attendances.list");
    },
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertAttendance) => {
      // The schema expects numbers, make sure to coerce if needed before validating
      const validated = api.attendances.create.input.parse(data);
      
      const res = await fetch(api.attendances.create.path, {
        method: api.attendances.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || 'Erro de validação');
        }
        throw new Error('Falha ao registrar frequência');
      }
      
      const responseData = await res.json();
      return parseWithLogging(api.attendances.create.responses[201], responseData, "attendances.create");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.attendances.list.path] });
    },
  });
}
