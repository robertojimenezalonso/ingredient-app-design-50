import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { Recipe, CategoryType } from '@/types/recipe';
import { ScrollableHeader } from '@/components/ScrollableHeader';
import { MealTypesCarousel } from '@/components/MealTypesCarousel';
import { DietsCarousel } from '@/components/DietsCarousel';
import { RecipeGridCard } from '@/components/RecipeGridCard';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRecipesByCategory } = useRecipes();
  
  const [selectedMealType, setSelectedMealType] = useState<string>('all');
  const [selectedDiet, setSelectedDiet] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories: CategoryType[] = [
    'breakfast', 'lunch', 'dinner', 
    'appetizer', 'snacks', 'desserts'
  ];

  // Get all recipes
  const allRecipes = categories.flatMap(category => getRecipesByCategory(category, 20));
  
  // Filter recipes based on selected filters
  const filteredRecipes = allRecipes.filter(recipe => {
    const matchesMealType = selectedMealType === 'all' || recipe.category === selectedMealType;
    const matchesSearch = searchQuery === '' || 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesMealType && matchesSearch;
  });

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
      <ScrollableHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="pt-32 pb-20">
        {/* Meal Types Carousel */}
        <MealTypesCarousel 
          selectedType={selectedMealType}
          onTypeChange={setSelectedMealType}
        />
        
        {/* Diets Carousel */}
        <DietsCarousel 
          selectedDiet={selectedDiet}
          onDietChange={setSelectedDiet}
        />
        
        {/* Recipes Grid */}
        <div className="px-4 mt-6">
          <div className="grid grid-cols-1 gap-4">
            {filteredRecipes.map((recipe) => (
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
  );
};

export default Index;