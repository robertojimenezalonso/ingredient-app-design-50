import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipeBank } from '@/hooks/useRecipeBank';
import { Recipe } from '@/types/recipe';
import { RecipeGridCard } from '@/components/RecipeGridCard';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRandomRecipesByCategory, convertToRecipe } = useRecipeBank();
  
  const categories = [
    'desayuno', 'comida', 'cena', 
    'aperitivo', 'snack', 'merienda'
  ];

  // Get all recipes from database and convert to Recipe format
  const allRecipes = categories.flatMap(category => 
    getRandomRecipesByCategory(category, 20).map(item => convertToRecipe(item))
  );
  
  console.log('🔍 [Index] Total recipes loaded:', allRecipes.length);

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
              {allRecipes.slice(0, 6).map((recipe) => (
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