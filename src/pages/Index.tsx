import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { useRecipeIngredients } from '@/hooks/useRecipeIngredients';
import { useCart } from '@/hooks/useCart';
import { AirbnbHeader } from '@/components/AirbnbHeader';
import { CategoryCarousel } from '@/components/CategoryCarousel';
import { IngredientsView } from '@/components/IngredientsView';
import { FloatingButton } from '@/components/FloatingButton';
import { useDateTabs } from '@/hooks/useDateTabs';
import { BottomNav } from '@/components/BottomNav';
import { Recipe, CategoryType } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRecipesByCategory } = useRecipes();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'explore' | 'cart' | 'recipes' | 'profile'>('explore');
  const [selectedFilter, setSelectedFilter] = useState<'receta' | 'ingredientes'>('receta');
  const { showTabs, activeTab: activeTabDate, mealPlan, sectionRefs, scrollToDate } = useDateTabs();
  
  const categories: CategoryType[] = [
    'breakfast', 'lunch', 'dinner', 
    'appetizer', 'snacks', 'desserts', 'favorites'
  ];

  // Get all recipes for ingredient management
  const allRecipes = categories.flatMap(category => getRecipesByCategory(category, 10));
  const { getGroupedIngredients } = useRecipeIngredients(allRecipes);
  
  // Calculate selected ingredients count with memoization
  const selectedIngredientsCount = useMemo(() => {
    return getGroupedIngredients().filter(ingredient => ingredient.isSelected).length;
  }, [getGroupedIngredients]);

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

  const handleSearchInSupermarket = () => {
    toast({
      title: "Buscar en supermercado",
      description: "Función próximamente disponible"
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <AirbnbHeader 
        showTabs={showTabs}
        activeTab={activeTabDate}
        mealPlan={mealPlan}
        onTabChange={scrollToDate}
        onFilterChange={setSelectedFilter}
      />
      
      <div style={{ paddingTop: '120px' }}>
        {selectedFilter === 'receta' ? (
          /* All recipes mixed together */
          <CategoryCarousel
            category="trending"
            recipes={categories.flatMap(category => getRecipesByCategory(category, 10))}
            onAddRecipe={handleAddRecipe}
            onRecipeClick={handleRecipeClick}
            onViewAll={handleViewAll}
            sectionRefs={sectionRefs}
          />
        ) : (
          <IngredientsView recipes={categories.flatMap(category => getRecipesByCategory(category, 10))} />
        )}
      </div>

      {/* Floating Button - Always visible */}
      <div className="fixed bottom-4 left-4 right-4 z-40" style={{ bottom: '80px' }}>
        <button 
          onClick={handleSearchInSupermarket}
          className="w-full bg-black text-white py-4 px-6 rounded-2xl font-medium text-base shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 mb-4"
        >
          <Search className="h-5 w-5" />
          Buscar súper · Lista ({selectedIngredientsCount})
        </button>
      </div>

      <BottomNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default Index;
