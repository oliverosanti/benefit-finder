import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryData {
  id: string;
  name: string;
  icon: string;
}

interface Props {
  categories: CategoryData[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export const CategoryCarousel = ({ categories, selected, onSelect }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const renderIcon = (name: string) => {
    const Icon = (Icons as any)[name] ?? Icons.Tag;
    return <Icon className="w-7 h-7" />;
  };

  return (
    <section id="categorias" className="container mx-auto px-4 py-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Explorá por categoría</h2>
          <p className="text-muted-foreground text-sm mt-1">Filtrá los beneficios por rubro</p>
        </div>
        <div className="hidden md:flex gap-2">
          <button onClick={() => scrollBy(-1)} className="w-10 h-10 rounded-full bg-card border border-border hover:bg-secondary transition-colors flex items-center justify-center" aria-label="Anterior">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => scrollBy(1)} className="w-10 h-10 rounded-full bg-card border border-border hover:bg-secondary transition-colors flex items-center justify-center" aria-label="Siguiente">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        <CategoryPill
          icon={<Icons.LayoutGrid className="w-7 h-7" />}
          label="Todos"
          active={selected === null}
          onClick={() => onSelect(null)}
        />
        {categories.map((c) => (
          <CategoryPill
            key={c.id}
            icon={renderIcon(c.icon)}
            label={c.name}
            active={selected === c.id}
            onClick={() => onSelect(selected === c.id ? null : c.id)}
          />
        ))}
      </div>
    </section>
  );
};

const CategoryPill = ({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "shrink-0 flex flex-col items-center gap-2 w-24 group",
      "transition-transform hover:-translate-y-0.5"
    )}
  >
    <span
      className={cn(
        "w-20 h-20 rounded-full flex items-center justify-center transition-all border-2",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-card-hover)]"
          : "bg-card text-foreground border-border group-hover:border-primary group-hover:text-primary"
      )}
    >
      {icon}
    </span>
    <span
      className={cn(
        "text-xs font-medium text-center line-clamp-2 leading-tight",
        active ? "text-primary font-semibold" : "text-foreground"
      )}
    >
      {label}
    </span>
  </button>
);
