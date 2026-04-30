import { Link } from "react-router-dom";
import { ArrowLeft, LogOut, Tag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BrandsManager } from "@/components/admin/BrandsManager";
import { BenefitsManager } from "@/components/admin/BenefitsManager";
import { BannersManager } from "@/components/admin/BannersManager";
import { useAuth } from "@/hooks/useAuth";

const Admin = () => {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-header text-header-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2 text-sm hover:text-primary">
              <ArrowLeft className="w-4 h-4" /> Sitio
            </Link>
            <span className="text-header-foreground/40">|</span>
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              <h1 className="font-bold">Panel de Administración</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-header-foreground/70 hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-header-foreground hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-1" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="benefits">
          <TabsList className="mb-6">
            <TabsTrigger value="benefits">Beneficios</TabsTrigger>
            <TabsTrigger value="brands">Marcas</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
          </TabsList>
          <TabsContent value="benefits"><BenefitsManager /></TabsContent>
          <TabsContent value="brands"><BrandsManager /></TabsContent>
          <TabsContent value="banners"><BannersManager /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
