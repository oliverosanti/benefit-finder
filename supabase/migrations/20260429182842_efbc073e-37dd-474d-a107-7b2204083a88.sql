
-- ============ ENUM de roles ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- ============ Tabla user_roles ============
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función security definer para chequear roles sin recursión
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ Tabla brands ============
CREATE TABLE public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands are viewable by everyone"
ON public.brands FOR SELECT
USING (true);

CREATE POLICY "Admins can insert brands"
ON public.brands FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update brands"
ON public.brands FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete brands"
ON public.brands FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============ Tabla categories ============
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'Tag',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Admins manage categories"
ON public.categories FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ Tabla benefits ============
CREATE TABLE public.benefits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  discount_badge TEXT NOT NULL,
  promo_code TEXT NOT NULL,
  target_url TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  expiry_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active benefits are viewable by everyone"
ON public.benefits FOR SELECT
USING (true);

CREATE POLICY "Admins manage benefits"
ON public.benefits FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ Trigger updated_at ============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_brands_updated BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_benefits_updated BEFORE UPDATE ON public.benefits
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ Storage bucket logos ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-logos', 'brand-logos', true);

CREATE POLICY "Brand logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-logos');

CREATE POLICY "Admins can upload brand logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'brand-logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update brand logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'brand-logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete brand logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'brand-logos' AND public.has_role(auth.uid(), 'admin'));
