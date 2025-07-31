-- Create table for storing pre-generated recipes
CREATE TABLE public.recipe_bank (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('desayuno', 'comida', 'cena', 'snack', 'aperitivo', 'merienda')),
  image_url TEXT NOT NULL,
  preparation_time INTEGER NOT NULL, -- in minutes
  calories INTEGER NOT NULL,
  servings INTEGER NOT NULL DEFAULT 1,
  ingredients JSONB NOT NULL, -- array of {name, amount, unit}
  instructions TEXT[] NOT NULL,
  macronutrients JSONB NOT NULL, -- {protein, fat, carbs} in grams
  micronutrients JSONB, -- {vitamins, minerals} with values
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.recipe_bank ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (recipes are public)
CREATE POLICY "Recipe bank is publicly readable" 
ON public.recipe_bank 
FOR SELECT 
USING (true);

-- Create policy for inserting recipes (only for authenticated users who can manage the bank)
CREATE POLICY "Only authenticated users can insert recipes" 
ON public.recipe_bank 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_recipe_bank_updated_at
BEFORE UPDATE ON public.recipe_bank
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for category filtering
CREATE INDEX idx_recipe_bank_category ON public.recipe_bank(category);

-- Create index for title search
CREATE INDEX idx_recipe_bank_title ON public.recipe_bank USING gin(to_tsvector('spanish', title));