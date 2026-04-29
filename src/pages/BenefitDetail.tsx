import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRight, Globe, Copy, ExternalLink, Tag } from "lucide-react";
import { toast } from "sonner";

interface DiscountTier {
  label: string;
  value: string;
  promo_code?: string;
}

interface BenefitDetailData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  discount_badge: string;
  promo_code: string;
  target_url: string;
  expiry_date: string;
  hero_image_url: string | null;
  instructions: string | null;
  terms: string | null;
  brand_about: string | null;
  discount_tiers: DiscountTier[] | null;
  brand: { name: string; logo_url: string | null; website_url: string | null };
}

const BenefitDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [b, setB] = useState<BenefitDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTier, setActiveTier] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("benefits")
        .select(
          "id,slug,title,description,discount_badge,promo_code,target_url,expiry_date,hero_image_url,instructions,terms,brand_about,discount_tiers," +
            "brand:brands(name,logo_url,website_url)"
        )
        .eq("slug", slug)
        .maybeSingle();
      setB(data as any);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Header search="" onSearchChange={() => {}} />
        <div className="container mx-auto px-4 py-8 grid lg:grid-cols-[1fr_360px] gap-6">
          <Skeleton className="h-[480px] rounded-2xl" />
          <Skeleton className="h-[360px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!b) {
    return (
      <div className="min-h-screen bg-background">
        <Header search="" onSearchChange={() => {}} />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Cupón no encontrado</h1>
          <Link to="/" className="text-primary underline">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  const tiers: DiscountTier[] =
    Array.isArray(b.discount_tiers) && b.discount_tiers.length > 0
      ? b.discount_tiers
      : [{ label: "Descuento", value: b.discount_badge, promo_code: b.promo_code }];

  const currentTier = tiers[activeTier] ?? tiers[0];
  const code = currentTier.promo_code || b.promo_code;

  const handleClaim = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("¡Código copiado!", {
        description: `${code} — abriendo ${b.brand.name}…`,
      });
      window.open(b.target_url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("No se pudo copiar el código");
    }
  };

  const initials = b.brand.name.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-muted/30">
      <Header search="" onSearchChange={() => {}} />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-6">
        <nav className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Cupones</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-semibold">{b.brand.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-6 grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Columna principal */}
        <article className="bg-card rounded-2xl shadow-[var(--shadow-card)] overflow-hidden border border-border/60">
          {/* Hero */}
          <div className="aspect-[16/9] bg-muted relative">
            {b.hero_image_url ? (
              <img
                src={b.hero_image_url}
                alt={b.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/30 flex items-center justify-center">
                <span className="text-6xl font-black text-primary/40">{b.discount_badge}</span>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold">{b.brand.name}</h1>

            {b.description && (
              <p className="text-base md:text-lg text-foreground/85 leading-relaxed">
                {b.description}
              </p>
            )}

            {b.instructions && (
              <section>
                <h2 className="text-lg font-bold mb-3">Instrucciones de uso</h2>
                <div className="text-foreground/80 whitespace-pre-line leading-relaxed">
                  {b.instructions}
                </div>
              </section>
            )}

            <Accordion type="multiple" className="border-t border-border/60 pt-2">
              {b.terms && (
                <AccordionItem value="terms" className="border-border/60">
                  <AccordionTrigger className="text-base font-bold hover:no-underline">
                    Bases y Condiciones
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/75 whitespace-pre-line">
                    {b.terms}
                    <p className="mt-3 text-sm text-muted-foreground">
                      Válido hasta {new Date(b.expiry_date).toLocaleDateString("es-AR")}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              )}
              {b.brand_about && (
                <AccordionItem value="about" className="border-border/60">
                  <AccordionTrigger className="text-base font-bold hover:no-underline">
                    Sobre {b.brand.name}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/75 whitespace-pre-line">
                    {b.brand_about}
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
        </article>

        {/* Sidebar sticky con cupón */}
        <aside className="lg:sticky lg:top-6 self-start">
          <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] border border-border/60 overflow-hidden">
            <div className="p-5 flex items-center gap-4 border-b border-border/60">
              <div className="w-16 h-16 rounded-xl bg-white border border-border/60 flex items-center justify-center shrink-0 overflow-hidden">
                {b.brand.logo_url ? (
                  <img src={b.brand.logo_url} alt={b.brand.name} className="max-w-full max-h-full object-contain p-1" />
                ) : (
                  <span className="text-lg font-bold text-primary">{initials}</span>
                )}
              </div>
              <h2 className="font-bold text-lg leading-tight">{b.title}</h2>
            </div>

            {/* Tiers de descuento */}
            <div className="p-5 space-y-2">
              {tiers.length > 1 && (
                <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-1">
                  Elegí tu beneficio
                </p>
              )}
              {tiers.map((t, i) => {
                const active = i === activeTier;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveTier(i)}
                    className={`w-full text-left flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all ${
                      active
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "border-border hover:border-primary/40 bg-muted/40"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Tag className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-medium text-sm">{t.label}</span>
                    </span>
                    <span className={`font-bold ${active ? "text-primary" : "text-foreground"}`}>
                      {t.value}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="px-5 pb-5 space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 rounded-full px-3 py-1.5 w-fit">
                <Globe className="w-3.5 h-3.5" />
                Online
              </div>

              <Button
                onClick={handleClaim}
                size="lg"
                className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full h-12 text-base font-semibold"
              >
                Quiero este beneficio
              </Button>

              <div className="flex items-center justify-between gap-2 text-sm bg-muted/60 rounded-xl px-3 py-2 border border-dashed border-border">
                <span className="font-mono font-bold tracking-wider truncate">{code}</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Copy className="w-3.5 h-3.5" /> al hacer clic
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BenefitDetail;
