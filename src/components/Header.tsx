import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, HelpCircle, LogIn, Menu, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
}

export const Header = ({ search, onSearchChange }: HeaderProps) => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-header text-header-foreground sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 py-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Tag className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:inline">
              Cupones<span className="text-primary">&Beneficios</span>
            </span>
          </Link>

          <div className="flex-1 max-w-xl relative hidden md:block">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="¿Qué estás buscando?"
              className="pl-11 h-11 rounded-full bg-white text-foreground border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" className="text-header-foreground hover:bg-white/10 hidden sm:inline-flex">
              <HelpCircle className="w-4 h-4 mr-1" /> Ayuda
            </Button>
            <Button variant="ghost" size="sm" className="text-header-foreground hover:bg-white/10 hidden sm:inline-flex">
              <Heart className="w-4 h-4 mr-1" /> Favoritos
            </Button>
            {user ? (
              <>
                {isAdmin && (
                  <Button variant="default" size="sm" onClick={() => navigate("/admin")}>
                    Panel Admin
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-header-foreground hover:bg-white/10" onClick={signOut}>
                  Salir
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-header-foreground hover:bg-white/10"
                onClick={() => navigate("/auth")}
                aria-label="Admin login"
                title="Acceso administrador"
              >
                <LogIn className="w-4 h-4" />
              </Button>
            )}
          </nav>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3 relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="¿Qué estás buscando?"
            className="pl-11 h-11 rounded-full bg-white text-foreground border-0"
          />
        </div>

        {/* Sub nav */}
        <nav className="flex items-center gap-6 pb-3 text-sm font-medium overflow-x-auto scrollbar-hide">
          <Link to="/" className="whitespace-nowrap hover:text-primary transition-colors">Home</Link>
          <a href="#descuentos" className="whitespace-nowrap hover:text-primary transition-colors">Descuentos</a>
          <a href="#categorias" className="whitespace-nowrap hover:text-primary transition-colors">Categorías</a>
          <a href="#destacados" className="whitespace-nowrap hover:text-primary transition-colors">Destacados</a>
        </nav>
      </div>
    </header>
  );
};
