import { ChevronRight } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { DiscountRecipeCard } from './DiscountRecipeCard';
interface DiscountCarouselProps {
  recipes: Recipe[];
  onAddRecipe: (recipe: Recipe) => void;
  onRecipeClick: (recipe: Recipe) => void;
}
export const DiscountCarousel = ({
  recipes,
  onAddRecipe,
  onRecipeClick
}: DiscountCarouselProps) => {
  if (recipes.length === 0) return null;
  return <div className="mb-4 mt-8">
      <div className="flex items-center gap-1 px-4 mb-2">
        <h2 className="text-lg font-semibold">Vistas recientemente</h2>
        <ChevronRight className="h-5 w-5 text-black" />
      </div>
      
      <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
        {recipes.slice(0, 6).map(recipe => <DiscountRecipeCard key={recipe.id} recipe={recipe} onAdd={onAddRecipe} onClick={onRecipeClick} />)}
      </div>
    </div>;
};