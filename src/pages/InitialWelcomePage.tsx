
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SavedShoppingListCard } from '@/components/SavedShoppingListCard';
import { useAuth } from '@/hooks/useAuth';
import { useRecipeBank } from '@/hooks/useRecipeBank';
import { RecipeGridCard } from '@/components/RecipeGridCard';
import { Button } from '@/components/ui/button';

const InitialWelcomePage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { recipes, isLoading: recipesLoading } = useRecipeBank();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleAddRecipe = (recipeId: string) => {
    console.log('Adding recipe:', recipeId);
    // TODO: Add to cart/list functionality
  };

  const generateRandomPrice = () => {
    const price = (Math.random() * 15 + 5).toFixed(2);
    return `${price.replace('.', ',')} €`;
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
        <div className="grid grid-cols-3 gap-4">
          {recipes.slice(0, 20).map((recipe) => (
            <RecipeGridCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              image={recipe.image_url}
              price={generateRandomPrice()}
              onAdd={handleAddRecipe}
            />
          ))}
        </div>
      </div>

      {/* Saved Shopping List Card */}
      <div className="mt-8">
        <SavedShoppingListCard />
      </div>
    </div>
  );
};

export default InitialWelcomePage;
