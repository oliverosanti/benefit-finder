import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { BenefitCardData } from "@/components/BenefitCard";

export const CompactBenefitCard = ({ benefit }: { benefit: BenefitCardData }) => {
  const initials = benefit.brand.name.slice(0, 2).toUpperCase();
  const href = benefit.slug ? `/c/${benefit.slug}` : `/c/${benefit.id}`;

  return (
    <Link
      to={href}
      className="group grid min-h-28 grid-cols-[72px_1fr] overflow-hidden rounded-lg border border-border/70 bg-card shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
      aria-label={`Ver beneficio de ${benefit.brand.name}`}
    >
      <div className="flex items-center justify-center border-r border-border/60 bg-muted/40 p-3">
        {benefit.brand.logo_url ? (
          <img src={benefit.brand.logo_url} alt={benefit.brand.name} className="max-h-12 max-w-12 object-contain" loading="lazy" />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            {initials}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-col p-3">
        <div className="mb-1 flex items-start justify-between gap-2">
          <p className="truncate text-[11px] font-semibold uppercase text-primary">{benefit.brand.name}</p>
          <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
            {benefit.discount_badge}
          </span>
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{benefit.title}</h3>
        <span className="mt-auto inline-flex items-center justify-end gap-1 pt-2 text-[11px] font-semibold text-primary">
          Ver <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
};