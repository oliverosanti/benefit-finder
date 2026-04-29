
-- Fix function search_path
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Restrict has_role execution: only authenticated users (used in RLS) need it
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- Replace broad SELECT on storage.objects with a narrower one (no listing of all files,
-- but signed URLs / direct file URLs still work because the bucket is public).
DROP POLICY IF EXISTS "Brand logos are publicly accessible" ON storage.objects;

CREATE POLICY "Admins can list brand logos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'brand-logos' AND public.has_role(auth.uid(), 'admin'));
