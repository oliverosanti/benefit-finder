import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryCarousel, CategoryData } from "@/components/CategoryCarousel";
import { BenefitCard, BenefitCardData } from "@/components/BenefitCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

const Index = () => {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [benefits, setBenefits] = useState<BenefitCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: cats }, { data: bens }] = await Promise.all([
        supabase.from("categories").select("id,name,icon").order("sort_order"),
        supabase
          .from("benefits")
          .select(
            "id,title,description,discount_badge,promo_code,target_url,expiry_date,is_featured,category_id," +
              "brand:brands(name,logo_url),category:categories(name)"
          )
          .gt("expiry_date", new Date().toISOString())
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);
      setCategories((cats as CategoryData[]) ?? []);
      setBenefits((bens as any) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return benefits.filter((b: any) => {
      if (selectedCat && b.category_id !== selectedCat) return false;
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.brand?.name?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.discount_badge.toLowerCase().includes(q)
      );
    });
  }, [benefits, search, selectedCat]);

  const featured = filtered.filter((b: any) => b.is_featured);

  return (
    <div className="min-h-screen bg-background">
      <Header search={search} onSearchChange={setSearch} />
      <Hero />
      <CategoryCarousel categories={categories} selected={selectedCat} onSelect={setSelectedCat} />

      {/* Destacados */}
      {!loading && featured.length > 0 && !search && !selectedCat && (
        <section id="destacados" className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-2xl md:text-3xl font-bold">Beneficios destacados</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {featured.slice(0, 4).map((b) => (
              <BenefitCard key={b.id} benefit={b} />
            ))}
          </div>
        </section>
      )}

      {/* Todos */}
      <section id="descuentos" className="container mx-auto px-4 py-8">
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-2xl md:text-3xl font-bold">
            {search ? `Resultados para "${search}"` : selectedCat ? "Filtrado" : "Todos los descuentos"}
          </h2>
          <span className="text-sm text-muted-foreground">{filtered.length} beneficios</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No encontramos beneficios con esos criterios.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((b) => (
              <BenefitCard key={b.id} benefit={b} />
            ))}
          </div>
        )}
      </section>

      <footer className="bg-header text-header-foreground/80 mt-16">
        <div className="container mx-auto px-4 py-8 text-sm text-center">
          © {new Date().getFullYear()} Cupones & Beneficios. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Index;
