import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SiGoogle } from "react-icons/si";
import { Church } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-2xl">
              <Church className="w-12 h-12 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">Frequência DJP</CardTitle>
            <CardDescription className="text-base">
              Acesse sua conta para registrar a frequência dos cultos.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Button 
            className="w-full h-14 text-lg font-bold rounded-xl gap-3 shadow-lg hover:shadow-xl transition-all"
            onClick={() => window.location.href = "/api/auth/google"}
          >
            <SiGoogle className="w-6 h-6" />
            Entrar com Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
