-- Create shopping lists table
CREATE TABLE public.shopping_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Mi Lista',
  dates TEXT[] NOT NULL DEFAULT '{}',
  servings INTEGER NOT NULL DEFAULT 2,
  meals TEXT[] NOT NULL DEFAULT '{}',
  estimated_price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create list recipes table
CREATE TABLE public.list_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  recipe_data JSONB NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_recipes ENABLE ROW LEVEL SECURITY;

-- Create policies for shopping_lists
CREATE POLICY "Users can view their own lists" 
ON public.shopping_lists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lists" 
ON public.shopping_lists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists" 
ON public.shopping_lists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists" 
ON public.shopping_lists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for list_recipes
CREATE POLICY "Users can view recipes from their lists" 
ON public.list_recipes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.shopping_lists 
    WHERE id = list_recipes.list_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can add recipes to their lists" 
ON public.list_recipes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shopping_lists 
    WHERE id = list_recipes.list_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update recipes in their lists" 
ON public.list_recipes 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.shopping_lists 
    WHERE id = list_recipes.list_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete recipes from their lists" 
ON public.list_recipes 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.shopping_lists 
    WHERE id = list_recipes.list_id 
    AND user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shopping_lists_updated_at
BEFORE UPDATE ON public.shopping_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_shopping_lists_user_id ON public.shopping_lists(user_id);
CREATE INDEX idx_shopping_lists_created_at ON public.shopping_lists(created_at DESC);
CREATE INDEX idx_list_recipes_list_id ON public.list_recipes(list_id);
CREATE INDEX idx_list_recipes_position ON public.list_recipes(list_id, position);