import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Hero } from "./Hero";
import { cn } from "@/lib/utils";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  benefit_id: string | null;
  benefit?: { slug: string | null } | null;
}

const AUTOPLAY_MS = 5000;

export const HeroCarousel = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("banners")
        .select("id,title,subtitle,image_url,link_url,benefit_id,benefit:benefits(slug)")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      setBanners((data as any) ?? []);
      setLoaded(true);
    };
    load();
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % banners.length), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!loaded) return null;
  if (banners.length === 0) return <Hero />;

  const go = (dir: number) =>
    setIndex((i) => (i + dir + banners.length) % banners.length);

  const hrefFor = (b: Banner) => {
    if (b.benefit?.slug) return `/c/${b.benefit.slug}`;
    return b.link_url || "#";
  };

  return (
    <section className="container mx-auto px-4 pt-6">
      <div className="relative rounded-3xl overflow-hidden group">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {banners.map((b) => {
            const href = hrefFor(b);
            const isInternal = href.startsWith("/");
            const Inner = (
              <div className="relative w-full aspect-[21/9] md:aspect-[24/8]">
                <img
                  src={b.image_url}
                  alt={b.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                <div className="relative h-full flex items-center p-6 md:p-12 text-white max-w-2xl">
                  <div>
                    <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                      <Sparkles className="w-3.5 h-3.5" /> Downtown Greenville
                    </span>
                    <h2 className="text-2xl md:text-4xl font-bold leading-tight mb-2">
                      {b.title}
                    </h2>
                    {b.subtitle && (
                      <p className="text-white/90 text-sm md:text-base">{b.subtitle}</p>
                    )}
                  </div>
                </div>
              </div>
            );
            return (
              <div key={b.id} className="shrink-0 w-full">
                {isInternal ? (
                  <Link to={href} className="block">{Inner}</Link>
                ) : href !== "#" ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="block">{Inner}</a>
                ) : (
                  <div>{Inner}</div>
                )}
              </div>
            );
          })}
        </div>

        {banners.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-foreground flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-foreground flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Ir al banner ${i + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
