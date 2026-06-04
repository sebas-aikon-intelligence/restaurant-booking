-- Allow public to view organizations by slug (for public booking pages)
CREATE POLICY "Public can view organizations by slug"
    ON public.organizations FOR SELECT
    USING (slug IS NOT NULL);
