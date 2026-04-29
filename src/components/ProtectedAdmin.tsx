import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Acceso restringido</h1>
          <p className="text-muted-foreground">Tu usuario no tiene rol de administrador.</p>
          <p className="text-xs text-muted-foreground mt-4">User ID: {user.id}</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};
