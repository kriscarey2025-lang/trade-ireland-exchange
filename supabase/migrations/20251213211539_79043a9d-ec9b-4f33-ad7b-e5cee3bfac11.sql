-- Allow advertisers to upload ad images
CREATE POLICY "Advertisers can upload ad images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'ad-images' 
  AND EXISTS (
    SELECT 1 FROM public.advertisers 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Allow advertisers to update their own ad images
CREATE POLICY "Advertisers can update ad images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'ad-images' 
  AND EXISTS (
    SELECT 1 FROM public.advertisers 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Allow advertisers to delete their own ad images
CREATE POLICY "Advertisers can delete ad images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'ad-images' 
  AND EXISTS (
    SELECT 1 FROM public.advertisers 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);