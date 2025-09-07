-- Create table for supermarket ingredients
CREATE TABLE public.supermarket_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supermarket TEXT NOT NULL,
  section_department TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  unit_type TEXT NOT NULL,
  price DECIMAL NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.supermarket_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies for supermarket ingredients
CREATE POLICY "Supermarket ingredients are viewable by everyone" 
ON public.supermarket_ingredients 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert ingredients" 
ON public.supermarket_ingredients 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update ingredients" 
ON public.supermarket_ingredients 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete ingredients" 
ON public.supermarket_ingredients 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_supermarket_ingredients_updated_at
BEFORE UPDATE ON public.supermarket_ingredients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();