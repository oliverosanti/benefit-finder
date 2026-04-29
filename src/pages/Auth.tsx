import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Tag, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const schema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
});

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (mode: "signin" | "signup") => {
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Cuenta creada", { description: "Ya podés iniciar sesión." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenido");
        navigate("/admin");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <Card className="p-8 rounded-2xl shadow-[var(--shadow-card-hover)]">
          <div className="text-center mb-6">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-primary text-primary-foreground items-center justify-center mb-3">
              <Tag className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">Acceso administrador</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestioná marcas y beneficios</p>
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="signin">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
            </TabsList>

            {(["signin", "signup"] as const).map((m) => (
              <TabsContent key={m} value={m} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`email-${m}`}>Email</Label>
                  <Input id={`email-${m}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vos@ejemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`pwd-${m}`}>Contraseña</Label>
                  <Input id={`pwd-${m}`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <Button onClick={() => handle(m)} disabled={loading} className="w-full" size="lg">
                  {loading ? "Procesando…" : m === "signin" ? "Entrar" : "Crear cuenta"}
                </Button>
              </TabsContent>
            ))}
          </Tabs>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            Para ser admin, creá tu cuenta y luego un administrador te asigna el rol.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
