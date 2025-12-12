-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true);

-- Allow authenticated users to upload their own service images
CREATE POLICY "Users can upload service images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view service images (public bucket)
CREATE POLICY "Service images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');

-- Allow users to update their own images
CREATE POLICY "Users can update their own service images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own service images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);