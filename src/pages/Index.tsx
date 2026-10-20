import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CategoryCarousel, CategoryData } from "@/components/CategoryCarousel";
import { BenefitCard, BenefitCardData } from "@/components/BenefitCard";
import { CompactBenefitCard } from "@/components/CompactBenefitCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Tag } from "lucide-react";
import * as Icons from "lucide-react";
import { useWebMCP } from "use-webmcp-tool";
import { runWebMCPTool } from "@/lib/webmcp-telemetry";

type BenefitWithCategory = BenefitCardData & {
  is_featured: boolean;
  category_id: string | null;
};

const discountScore = (benefit: BenefitCardData) => {
  const badge = benefit.discount_badge.toLowerCase();
  if (badge.includes("gratis")) return 100;
  const deal = badge.match(/(\d+)\s*x\s*(\d+)/);
  if (deal) {
    const take = Number(deal[1]);
    const pay = Number(deal[2]);
    if (take > 0 && take > pay) return ((take - pay) / take) * 100;
  }
  const percentage = badge.match(/(\d+(?:[.,]\d+)?)\s*%/);
  return percentage ? Number(percentage[1].replace(",", ".")) : 0;
};

const categoryIcon = (name?: string) => {
  const Icon = ((Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name ?? ""] ?? Tag);
  return <Icon className="h-5 w-5" />;
};

const Index = () => {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [benefits, setBenefits] = useState<BenefitWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: cats }, { data: bens }] = await Promise.all([
        supabase.from("categories").select("id,name,icon,sort_order").order("sort_order").order("name"),
        supabase
          .from("benefits")
          .select(
            "id,slug,title,description,discount_badge,promo_code,target_url,expiry_date,is_featured,category_id," +
              "brand:brands(name,logo_url),category:categories(name)"
          )
          .gt("expiry_date", new Date().toISOString())
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);
      setCategories((cats as CategoryData[]) ?? []);
      setBenefits((bens as unknown as BenefitWithCategory[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return benefits.filter((b) => {
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

  const featured = filtered
    .filter((b) => b.is_featured)
    .sort((a, b) => discountScore(b) - discountScore(a));

  const regularBenefits = !search && !selectedCat
    ? filtered.filter((benefit) => !benefit.is_featured)
    : filtered;

  const groupedBenefits = categories
    .map((category) => ({
      category,
      benefits: regularBenefits.filter((benefit) => benefit.category_id === category.id),
    }))
    .filter((group) => group.benefits.length > 0);

  const uncategorized = regularBenefits.filter((benefit) => !benefit.category_id);

  useWebMCP({
    name: "list_visible_benefits",
    description: "List the coupons currently shown on the home page, respecting the active search and category.",
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: () =>
      runWebMCPTool("list_visible_benefits", () => {
        if (loading) return "Benefits are still loading.";
        return filtered.length === 0
          ? "No benefits shown."
          : filtered.map((b) => `${b.slug || b.id}: ${b.brand?.name ?? ""} — ${b.title} (${b.discount_badge})`).join("\n");
      }),
  });

  useWebMCP({
    name: "search_benefits",
    description: "Type a search into the home page search box to filter the coupons shown.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Search text; empty string clears the search." } },
      required: ["query"],
    },
    execute: ({ query }: { query: string }) =>
      runWebMCPTool("search_benefits", () => {
        if (typeof query !== "string") throw new Error("query must be a string.");
        setSearch(query);
        return query ? "Search updated." : "Search cleared.";
      }),
  });

  useWebMCP({
    name: "filter_by_category",
    description: "Show only coupons of one category (by name), or all categories with an empty name.",
    inputSchema: {
      type: "object",
      properties: { category: { type: "string", description: "Category name as shown on the page; empty for all." } },
      required: ["category"],
    },
    execute: ({ category }: { category: string }) =>
      runWebMCPTool("filter_by_category", () => {
        if (typeof category !== "string") throw new Error("category must be a string.");
        if (!category) { setSelectedCat(null); return "Showing all categories."; }
        const match = categories.filter((c) => c.name.toLowerCase() === category.toLowerCase());
        if (match.length !== 1) throw new Error(`Unknown category; expected one of: ${categories.map((c) => c.name).join(", ")}.`);
        setSelectedCat(match[0].id);
        return "Category filter updated.";
      }),
  });

  return (
    <div className="min-h-screen bg-background">
      <Header search={search} onSearchChange={setSearch} />
      <HeroCarousel />
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

      <section id="descuentos" className="container mx-auto px-4 py-8">
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-2xl md:text-3xl font-bold">
            {search ? `Resultados para "${search}"` : selectedCat ? "Beneficios de la categoría" : "Beneficios por categoría"}
          </h2>
          <span className="text-sm text-muted-foreground">{regularBenefits.length} beneficios</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        ) : regularBenefits.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No encontramos beneficios con esos criterios.
          </div>
        ) : (
          <div className="space-y-9">
            {groupedBenefits.map(({ category, benefits: categoryBenefits }) => (
              <section key={category.id} aria-labelledby={`category-${category.id}`}>
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    {categoryIcon(category.icon)}
                  </span>
                  <h3 id={`category-${category.id}`} className="text-xl font-bold">{category.name}</h3>
                  <span className="text-xs text-muted-foreground">{categoryBenefits.length}</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {categoryBenefits.map((benefit) => <CompactBenefitCard key={benefit.id} benefit={benefit} />)}
                </div>
              </section>
            ))}
            {uncategorized.length > 0 && (
              <section aria-labelledby="category-other">
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground"><Tag className="h-5 w-5" /></span>
                  <h3 id="category-other" className="text-xl font-bold">Otros</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {uncategorized.map((benefit) => <CompactBenefitCard key={benefit.id} benefit={benefit} />)}
                </div>
              </section>
            )}
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
