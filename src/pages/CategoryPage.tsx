import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { useCart } from '@/hooks/useCart';
import { SearchBar } from '@/components/SearchBar';
import { RecipeCard } from '@/components/RecipeCard';
import { BottomNav } from '@/components/BottomNav';
import { FloatingButton } from '@/components/FloatingButton';
import { Button } from '@/components/ui/button';
import { CategoryType, CATEGORIES, Recipe } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRecipesByCategory } = useRecipes();
  const { cart, addToCart, getTotalIngredients } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'recipes' | 'cart' | 'profile'>('recipes');

  const categoryKey = category as CategoryType;
  const recipes = getRecipesByCategory(categoryKey);
  const categoryTitle = CATEGORIES[categoryKey] || 'Categoría';

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddRecipe = (recipe: Recipe) => {
    const selectedIngredients = recipe.ingredients.map(ing => ing.id);
    addToCart(recipe, recipe.servings, selectedIngredients);
    toast({
      title: "Receta añadida",
      description: `${recipe.title} añadida al carrito`
    });
  };

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleTabChange = (tab: 'recipes' | 'cart' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'cart') {
      navigate('/cart');
    } else if (tab === 'profile') {
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/')}
          className="rounded-xl"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{categoryTitle}</h1>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onFilter={() => toast({ title: "Filtros", description: "Función próximamente" })}
      />
      
      <div className="grid grid-cols-2 gap-3 px-4">
        {filteredRecipes.map(recipe => (
          <div key={recipe.id} className="w-full">
            <RecipeCard
              recipe={recipe}
              onAdd={handleAddRecipe}
              onClick={handleRecipeClick}
            />
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <FloatingButton onClick={() => navigate('/cart')}>
          Ver carrito ({getTotalIngredients()})
        </FloatingButton>
      )}
    </div>
  );
};

export default CategoryPage;