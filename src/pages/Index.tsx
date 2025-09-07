import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipeBank } from '@/hooks/useRecipeBank';
import { Recipe } from '@/types/recipe';
import { RecipeGridCard } from '@/components/RecipeGridCard';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRandomRecipesByCategory, convertToRecipe } = useRecipeBank();
  const [featuredRecipe, setFeaturedRecipe] = useState<Recipe | null>(null);
  
  const categories = [
    'desayuno', 'comida', 'cena', 
    'aperitivo', 'snack', 'merienda'
  ];

  // Fetch the featured tortilla recipe
  useEffect(() => {
    const fetchFeaturedRecipe = async () => {
      const { data, error } = await supabase
        .from('recipe_bank')
        .select('*')
        .eq('id', '93012452-060e-45ad-b094-6173bd97afdb')
        .single();
      
      if (data && !error) {
        // Transform the Supabase data to RecipeBankItem format
        const transformedData = {
          ...data,
          ingredients: data.ingredients as Array<{name: string, amount: string, unit: string}>,
          macronutrients: data.macronutrients as {
            protein: number;
            fat: number;
            carbs: number;
          },
          micronutrients: data.micronutrients as Record<string, string>
        };
        
        setFeaturedRecipe(convertToRecipe(transformedData));
      }
    };
    
    fetchFeaturedRecipe();
  }, [convertToRecipe]);

  // Get all recipes from database and convert to Recipe format
  const allRecipes = categories.flatMap(category => 
    getRandomRecipesByCategory(category, 20).map(item => convertToRecipe(item))
  );
  
  // Combine featured recipe with others, ensuring featured is first
  const displayRecipes = featuredRecipe 
    ? [featuredRecipe, ...allRecipes.filter(r => r.id !== featuredRecipe.id)]
    : allRecipes;
  
  console.log('🔍 [Index] Total recipes loaded:', displayRecipes.length, 'Featured recipe:', featuredRecipe?.title);

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };


  const handleAddRecipe = (recipe: Recipe) => {
    toast({
      title: "Receta añadida",
      description: `${recipe.title} añadida a favoritos`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Recetas Disponibles
            </h1>
            <p className="text-muted-foreground mb-8">
              Explora las recetas del banco de datos
            </p>
          </div>
          
          {/* Display recipes */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {displayRecipes.slice(0, 6).map((recipe) => (
                <RecipeGridCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => handleRecipeClick(recipe)}
                  onAdd={() => handleAddRecipe(recipe)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;