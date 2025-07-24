import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '@/hooks/useRecipes';
import { useCart } from '@/hooks/useCart';
import { AirbnbHeader } from '@/components/AirbnbHeader';
import { CategoryCarousel } from '@/components/CategoryCarousel';

import { BottomNav } from '@/components/BottomNav';
import { Recipe, CategoryType } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRecipesByCategory } = useRecipes();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'explore' | 'cart' | 'recipes' | 'profile'>('explore');
  const categoryCarouselRef = useRef<{ resetSwipe: () => void }>(null);

  const categories: CategoryType[] = [
    'breakfast', 'lunch', 'dinner', 
    'appetizer', 'snacks', 'desserts', 'favorites'
  ];

  const handleAddRecipe = (recipe: Recipe) => {
    const selectedIngredients = recipe.ingredients.map(ing => ing.id);
    addToCart(recipe, recipe.servings, selectedIngredients);
    toast({
      title: "Receta añadida",
      description: `${recipe.title} añadida a favoritos`
    });
  };

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleViewAll = (category: CategoryType) => {
    navigate(`/category/${category}`);
  };

  const handleTabChange = (tab: 'explore' | 'cart' | 'recipes' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'profile') {
      navigate('/profile');
    } else if (tab === 'cart') {
      navigate('/cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24"
         onScroll={() => {
           console.log('Scroll en página principal');
           categoryCarouselRef.current?.resetSwipe();
         }}
         onTouchMove={() => {
           console.log('TouchMove en página principal');
           categoryCarouselRef.current?.resetSwipe();
         }}>
      <AirbnbHeader />
      
      <div style={{ paddingTop: '120px' }}>
        
        {/* All recipes mixed together */}
        <CategoryCarousel
          ref={categoryCarouselRef}
          category="trending"
          recipes={categories.flatMap(category => getRecipesByCategory(category, 10))}
          onAddRecipe={handleAddRecipe}
          onRecipeClick={handleRecipeClick}
          onViewAll={handleViewAll}
        />
      </div>

      <BottomNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default Index;
