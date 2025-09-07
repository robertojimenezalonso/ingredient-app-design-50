import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipeBank } from '@/hooks/useRecipeBank';
import { Recipe } from '@/types/recipe';
import { RecipeGridCard } from '@/components/RecipeGridCard';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useImagePreloader } from '@/hooks/useImagePreloader';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { convertToRecipe, recipes, isLoading } = useRecipeBank();
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);

  // Precargar las primeras imágenes para una carga más rápida
  useImagePreloader(
    allRecipes.slice(0, 5).map(recipe => recipe.image), 
    true // Alta prioridad
  );

  useEffect(() => {
    if (!isLoading && recipes.length > 0) {
      console.log('🍳 [Index] Raw recipes from database:', recipes);
      
      // Convert all recipes to Recipe format
      const convertedRecipes = recipes.map(recipe => {
        console.log('🔄 [Index] Converting recipe:', recipe.title, 'Image URL:', recipe.image_url);
        return convertToRecipe(recipe);
      });
      
      // Try to find tortilla recipe and put it first
      const tortillaIndex = convertedRecipes.findIndex(recipe => 
        recipe.title.toLowerCase().includes('tortilla') || 
        recipe.title.toLowerCase().includes('champiñones') ||
        recipe.title.toLowerCase().includes('espinacas')
      );
      
      let sortedRecipes = [...convertedRecipes];
      if (tortillaIndex > -1) {
        const tortillaRecipe = sortedRecipes.splice(tortillaIndex, 1)[0];
        sortedRecipes.unshift(tortillaRecipe);
        console.log('🥚 [Index] Found tortilla recipe and moved to first:', tortillaRecipe.title);
      }
      
      console.log('📋 [Index] Final recipes with images:', sortedRecipes.map(r => ({ title: r.title, image: r.image })));
      setAllRecipes(sortedRecipes);
    }
  }, [recipes, isLoading, convertToRecipe]);

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleAddRecipe = (recipe: Recipe) => {
    toast({
      title: "Receta añadida",
      description: `${recipe.title} añadida a favoritos`
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando recetas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Recetas Disponibles
            </h1>
            <p className="text-muted-foreground mb-8">
              Explora todas las recetas del banco de datos ({allRecipes.length} recetas)
            </p>
          </div>
          
          {/* Display all recipes */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {allRecipes.map((recipe) => (
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