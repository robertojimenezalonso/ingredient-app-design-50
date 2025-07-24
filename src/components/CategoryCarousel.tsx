import { ChevronRight } from 'lucide-react';
import { Recipe, CategoryType, CATEGORIES } from '@/types/recipe';
import { RecipeCard } from './RecipeCard';
import { Card, CardContent } from './ui/card';

interface CategoryCarouselProps {
  category: CategoryType;
  recipes: Recipe[];
  onAddRecipe: (recipe: Recipe) => void;
  onRecipeClick: (recipe: Recipe) => void;
  onViewAll: (category: CategoryType) => void;
}

export const CategoryCarousel = ({ 
  category, 
  recipes, 
  onAddRecipe, 
  onRecipeClick, 
  onViewAll 
}: CategoryCarouselProps) => {
  if (recipes.length === 0) return null;

  return (
    <div className="mb-4 -mt-4">

      <div className="flex items-center gap-1 px-4 mb-2">
        <h2 className="text-lg font-semibold">Las recetas</h2>
      </div>
      
      <div className="px-4">
        {recipes.slice(0, 6).map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onAdd={onAddRecipe}
            onClick={onRecipeClick}
          />
        ))}
      </div>
    </div>
  );
};