DROP POLICY "Active banners viewable by everyone" ON public.banners;
CREATE POLICY "Active banners viewable by everyone"
ON public.banners
FOR SELECT
TO public
USING (is_active = true);

ALTER TABLE public.banners
ADD CONSTRAINT banners_benefit_id_fkey
FOREIGN KEY (benefit_id)
REFERENCES public.benefits(id)
ON DELETE SET NULL;