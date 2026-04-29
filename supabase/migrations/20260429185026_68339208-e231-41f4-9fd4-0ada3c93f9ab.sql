
ALTER TABLE public.benefits
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS instructions text,
  ADD COLUMN IF NOT EXISTS terms text,
  ADD COLUMN IF NOT EXISTS brand_about text,
  ADD COLUMN IF NOT EXISTS discount_tiers jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Backfill slugs for existing benefits using brand name + short id
UPDATE public.benefits b
SET slug = lower(regexp_replace(coalesce(br.name,'cupon'), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(b.id::text, 1, 6)
FROM public.brands br
WHERE b.brand_id = br.id AND b.slug IS NULL;

CREATE INDEX IF NOT EXISTS benefits_slug_idx ON public.benefits(slug);
