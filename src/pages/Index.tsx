import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { useRecipeBank } from '@/hooks/useRecipeBank';
import { Recipe, CategoryType } from '@/types/recipe';

import { ScrollableHeader } from '@/components/ScrollableHeader';

import { MealTypesCarousel } from '@/components/MealTypesCarousel';
import { RecipeGridCard } from '@/components/RecipeGridCard';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRandomRecipesByCategory, convertToRecipe } = useRecipeBank();
  
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [selectedSupermarket, setSelectedSupermarket] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = [
    'desayuno', 'comida', 'cena', 
    'aperitivo', 'snack', 'merienda'
  ];

  // Get all recipes from database and convert to Recipe format
  const allRecipes = categories.flatMap(category => 
    getRandomRecipesByCategory(category, 20).map(item => convertToRecipe(item))
  );
  
  console.log('🔍 [Index] Total recipes loaded:', allRecipes.length);
  console.log('🔍 [Index] Selected meal types:', selectedMealTypes);
  console.log('🔍 [Index] Search query:', searchQuery);
  
  // Filter recipes based on selected filters
  const filteredRecipes = allRecipes.filter(recipe => {
    const matchesMealType = selectedMealTypes.length === 0 || selectedMealTypes.includes(recipe.category);
    const matchesSearch = searchQuery === '' || 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesMealType && matchesSearch;
  });

  console.log('🔍 [Index] Filtered recipes:', filteredRecipes.length);

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleMealTypeToggle = (type: string) => {
    setSelectedMealTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
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
          selectedTypes={selectedMealTypes}
          onTypeToggle={handleMealTypeToggle}
        />
        
        
        {/* Recipes Grid */}
        <div className="px-4 mt-2">
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