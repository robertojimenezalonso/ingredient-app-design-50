
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SavedShoppingListCard } from '@/components/SavedShoppingListCard';
import { useAuth } from '@/hooks/useAuth';
import { useRecipeBank } from '@/hooks/useRecipeBank';
import { RecipeGridCard } from '@/components/RecipeGridCard';
import { RecipeDrawer } from '@/components/RecipeDrawer';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';

const InitialWelcomePage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { recipes, isLoading: recipesLoading } = useRecipeBank();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleAddRecipe = (recipe: Recipe) => {
    console.log('Adding recipe:', recipe.id);
    // TODO: Add to cart/list functionality
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRecipe(null);
  };


  if (loading || recipesLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Recipe Grid */}
      <div className="px-4 pt-6">
        <div className="grid grid-cols-1 gap-4">
          {recipes.slice(0, 20).map((recipe) => (
            <RecipeGridCard
              key={recipe.id}
              recipe={{
                ...recipe,
                image: recipe.image_url,
                macros: {
                  protein: Math.floor(Math.random() * 30) + 10,
                  carbs: Math.floor(Math.random() * 50) + 20,
                  fat: Math.floor(Math.random() * 20) + 5
                },
                time: Math.floor(Math.random() * 45) + 15,
                servings: 2,
                ingredients: [],
                instructions: [],
                nutrition: {
                  calories: recipe.calories || 300,
                  protein: Math.floor(Math.random() * 30) + 10,
                  carbs: Math.floor(Math.random() * 50) + 20,
                  fat: Math.floor(Math.random() * 20) + 5,
                  fiber: Math.floor(Math.random() * 10) + 2,
                  sugar: Math.floor(Math.random() * 15) + 5
                }
              }}
              onAdd={handleAddRecipe}
              onClick={handleRecipeClick}
            />
          ))}
        </div>
      </div>

      {/* Saved Shopping List Card */}
      <div className="mt-8">
        <SavedShoppingListCard />
      </div>

      <RecipeDrawer
        recipe={selectedRecipe}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onAdd={handleAddRecipe}
      />
    </div>
  );
};

export default InitialWelcomePage;
