
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SavedShoppingListCard } from '@/components/SavedShoppingListCard';
import { useAuth } from '@/hooks/useAuth';
import { useRecipeBank } from '@/hooks/useRecipeBank';
import { RecipeGridCard } from '@/components/RecipeGridCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const InitialWelcomePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const { recipes, isLoading: recipesLoading } = useRecipeBank();
  
  const supermarketName = searchParams.get('supermarket');

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
    <div className="min-h-screen bg-gray-100 overflow-y-auto">
      <div className="flex flex-col min-h-screen pb-24">
        {/* Supermarket Header */}
        {supermarketName && (
          <div className="bg-primary text-primary-foreground px-4 py-3">
            <h1 className="text-lg font-semibold text-center">
              {supermarketName}
            </h1>
          </div>
        )}
        
        {/* Recipe Grid */}
        <div className="px-4 pt-6">
          <Card className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#C3C3C3] mb-4">
            <CardHeader className="pb-3 px-4">
              <CardTitle className="text-2xl font-semibold text-neutral-950">Recetas Disponibles</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
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
            </CardContent>
          </Card>
        </div>

        {/* Saved Shopping List Card */}
        <div className="px-4">
          <Card className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#C3C3C3]">
            <CardContent className="p-4">
              <SavedShoppingListCard />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InitialWelcomePage;
