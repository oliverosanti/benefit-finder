import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BenefitCardData {
  id: string;
  slug?: string;
  title: string;
  description: string | null;
  discount_badge: string;
  promo_code: string;
  target_url: string;
  expiry_date: string;
  brand: { name: string; logo_url: string | null };
  category?: { name: string } | null;
}

export const BenefitCard = ({ benefit }: { benefit: BenefitCardData }) => {
  const initials = benefit.brand.name.slice(0, 2).toUpperCase();
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(benefit.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
  const href = benefit.slug ? `/c/${benefit.slug}` : `/c/${benefit.id}`;

  return (
    <Link
      to={href}
      className={cn(
        "group relative w-full text-left bg-card rounded-2xl overflow-hidden block",
        "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
        "transition-[transform,box-shadow] duration-300 hover:-translate-y-1",
        "border border-border/60 flex flex-col"
      )}
      aria-label={`Ver beneficio de ${benefit.brand.name}`}
    >
      <span className="absolute top-3 right-3 z-10 bg-accent text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-[var(--shadow-badge)]">
        {benefit.discount_badge}
      </span>

      <div className="bg-white aspect-[16/10] flex items-center justify-center p-6 border-b border-border/40">
        {benefit.brand.logo_url ? (
          <img
            src={benefit.brand.logo_url}
            alt={benefit.brand.name}
            className="max-h-20 max-w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-[hsl(180_70%_42%)] text-primary-foreground flex items-center justify-center text-2xl font-bold">
            {initials}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
          {benefit.brand.name}
        </p>
        <h3 className="font-semibold text-foreground line-clamp-2 leading-snug mb-2">
          {benefit.title}
        </h3>
        {benefit.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {benefit.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/60">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {daysLeft > 0 ? `${daysLeft} días` : "Hoy"}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
            Ver beneficio
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};
