import { Sparkles } from "lucide-react";

export const Hero = () => (
  <section className="container mx-auto px-4 pt-6">
    <div
      className="relative rounded-3xl overflow-hidden p-8 md:p-14 text-white"
      style={{ backgroundImage: "var(--gradient-hero)" }}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 right-20 w-32 h-32 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-accent/40 blur-3xl" />
      </div>
      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Beneficios destacados del mes
        </span>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-3">
          ¡Aprovechá los <em className="not-italic text-accent">beneficios</em> destacados!
        </h1>
        <p className="text-white/90 text-base md:text-lg">
          Descuentos exclusivos en tus marcas favoritas. Copiá tu cupón y empezá a ahorrar.
        </p>
      </div>
    </div>
  </section>
);
