import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, subDays, previousSunday, isSunday, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { 
  Church, Users, Baby, UserPlus, Car, Calendar, 
  Send, TrendingUp, BarChart3 
} from "lucide-react";

import { useAttendances, useCreateAttendance } from "@/hooks/use-attendances";
import { insertAttendanceSchema } from "@shared/routes";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Zod schema with coercion for form inputs
const formSchema = insertAttendanceSchema.extend({
  adultos: z.coerce.number().min(0, "Deve ser maior ou igual a 0"),
  criancas: z.coerce.number().min(0, "Deve ser maior ou igual a 0"),
  convidados: z.coerce.number().min(0, "Deve ser maior ou igual a 0"),
  veiculos: z.coerce.number().min(0, "Deve ser maior ou igual a 0"),
  data: z.string().min(1, "A data é obrigatória"),
  igreja: z.string().min(1, "A igreja é obrigatória"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const { toast } = useToast();
  const { data: attendances, isLoading: isLoadingData } = useAttendances();
  const { mutate: createAttendance, isPending: isCreating } = useCreateAttendance();

  // Initialize form with default values (today's date)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      igreja: "",
      adultos: 0,
      criancas: 0,
      convidados: 0,
      veiculos: 0,
      data: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const onSubmit = (values: FormValues) => {
    createAttendance(values, {
      onSuccess: () => {
        toast({
          title: "Sucesso!",
          description: "Frequência registrada com sucesso.",
          variant: "default",
        });
        // Reset numerical values but keep the church and date to ease multiple entries
        form.reset({
          ...values,
          adultos: 0,
          criancas: 0,
          convidados: 0,
          veiculos: 0,
        });
      },
      onError: (error) => {
        toast({
          title: "Erro ao salvar",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  // Process data for the last 10 Sundays chart
  const chartData = useMemo(() => {
    if (!attendances) return [];

    const today = startOfDay(new Date());
    const lastSunday = isSunday(today) ? today : previousSunday(today);

    // Generate array of 10 last Sundays, reversed so chronological (oldest to newest)
    const sundays = Array.from({ length: 10 })
      .map((_, i) => subDays(lastSunday, i * 7))
      .reverse();

    return sundays.map((sunday) => {
      // Create a string to match the string dates stored/returned
      const dateStr = format(sunday, "yyyy-MM-dd");
      
      const matchedRecords = attendances.filter(a => {
        // Drizzle might return an ISO string or a YYYY-MM-DD string
        // Safe check using substring
        const recordDateStr = typeof a.data === 'string' 
          ? a.data.substring(0, 10) 
          : new Date(a.data).toISOString().substring(0, 10);
        return recordDateStr === dateStr;
      });

      // Sum all people types
      const totalPessoas = matchedRecords.reduce((sum, record) => {
        return sum + record.adultos + record.criancas + record.convidados;
      }, 0);

      return {
        name: format(sunday, "dd/MM", { locale: ptBR }),
        fullDate: dateStr,
        total: totalPessoas,
      };
    });
  }, [attendances]);

  return (
    <div className="min-h-screen pb-16">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Church className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Frequência DJP
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Form Section */}
        <section>
          <Card className="shadow-lg border-border/50 overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-muted/30 border-b pb-6">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                Registrar Culto
              </CardTitle>
              <CardDescription className="text-base">
                Preencha os dados de frequência do culto de hoje.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="igreja"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-foreground/80 flex items-center gap-2">
                            <Church className="w-4 h-4 text-muted-foreground" />
                            Nome da Igreja / Congregação
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Sede, Congregação X..." 
                              className="h-12 rounded-xl bg-background border-2 focus-visible:ring-primary/20" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="data"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-foreground/80 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            Data do Culto
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              className="h-12 rounded-xl bg-background border-2 focus-visible:ring-primary/20" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                    <FormField
                      control={form.control}
                      name="adultos"
                      render={({ field }) => (
                        <FormItem className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                          <FormLabel className="font-semibold text-primary flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Adultos
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              className="h-14 text-xl font-bold text-center rounded-xl bg-background" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="criancas"
                      render={({ field }) => (
                        <FormItem className="bg-accent/5 p-4 rounded-2xl border border-accent/10">
                          <FormLabel className="font-semibold text-accent flex items-center gap-2">
                            <Baby className="w-5 h-5" />
                            Crianças
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              className="h-14 text-xl font-bold text-center rounded-xl bg-background" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="convidados"
                      render={({ field }) => (
                        <FormItem className="bg-orange-500/5 p-4 rounded-2xl border border-orange-500/10">
                          <FormLabel className="font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                            <UserPlus className="w-5 h-5" />
                            Convidados
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              className="h-14 text-xl font-bold text-center rounded-xl bg-background" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="veiculos"
                      render={({ field }) => (
                        <FormItem className="bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
                          <FormLabel className="font-semibold text-secondary-foreground flex items-center gap-2">
                            <Car className="w-5 h-5" />
                            Veículos
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              className="h-14 text-xl font-bold text-center rounded-xl bg-background" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={isCreating}
                      className="w-full sm:w-auto h-14 px-8 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {isCreating ? (
                        <span className="flex items-center gap-2">Salvando...</span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-5 h-5" />
                          Registrar Frequência
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </section>

        {/* Chart Section */}
        <section>
          <Card className="shadow-lg border-border/50 overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-muted/30 border-b pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  Evolução de Público
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Total de pessoas (Adultos + Crianças + Convidados) nos últimos 10 domingos.
                </CardDescription>
              </div>
              <div className="bg-background px-4 py-2 rounded-lg border shadow-sm flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <div className="text-sm">
                  <span className="text-muted-foreground block">Média do período</span>
                  <span className="font-bold text-foreground">
                    {chartData.length > 0 
                      ? Math.round(chartData.reduce((acc, curr) => acc + curr.total, 0) / chartData.length) 
                      : 0}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              {isLoadingData ? (
                <div className="w-full h-[400px] flex items-end gap-2 justify-between">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="w-full" style={{ height: `${Math.max(20, Math.random() * 100)}%` }} />
                  ))}
                </div>
              ) : (
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        allowDecimals={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                        formatter={(value: number) => [`${value} pessoas`, 'Total']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorTotal)" 
                        activeDot={{ r: 8, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

      </main>
    </div>
  );
}
