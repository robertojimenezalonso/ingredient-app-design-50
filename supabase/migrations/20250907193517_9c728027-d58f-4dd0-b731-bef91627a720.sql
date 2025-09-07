-- Verificar y crear políticas de almacenamiento permanente para imágenes

-- Crear políticas para el bucket recipe-images para acceso público permanente
CREATE POLICY "Public can view all images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'recipe-images');

CREATE POLICY "Authenticated users can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'recipe-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update their images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'recipe-images' AND auth.uid() IS NOT NULL);

-- Asegurar que el bucket es público y persistente
UPDATE storage.buckets 
SET public = true 
WHERE id = 'recipe-images';