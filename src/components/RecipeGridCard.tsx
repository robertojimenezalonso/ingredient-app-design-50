import { Plus, Lock } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { ImageLoader } from './ui/image-loader';
import { Button } from './ui/button';

interface RecipeGridCardProps {
  recipe: Recipe;
  onAdd: (recipe: Recipe) => void;
  onClick?: (recipe: Recipe) => void;
  mealType?: string;
  isFirstCard?: boolean;
}

export const RecipeGridCard = ({ recipe, onAdd, onClick, mealType, isFirstCard }: RecipeGridCardProps) => {
  // Generate consistent price based on recipe ID to avoid constant changes
  const generateConsistentPrice = (id: string): string => {
    const hash = id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const price = (hash % 8 + 4).toFixed(2); // Price between 4.00 - 11.99
    return price.replace('.', ',');
  };
  
  const price = generateConsistentPrice(recipe.id);

  const handleClick = () => {
    if (onClick) {
      onClick(recipe);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd(recipe);
  };

  return (
    <div className="pb-4 last:pb-0">
      <div 
        className="flex gap-3 items-center cursor-pointer relative w-full transition-transform duration-200"
        onClick={handleClick}
      >
        <div className="flex-shrink-0">
          <ImageLoader
            src={recipe.image} 
            alt={recipe.title}
            className="w-[85px] h-[85px] object-cover"
            category={recipe.category}
            priority={true}
            placeholder={
              <div className="text-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                <div className="text-xs opacity-70">Cargando...</div>
              </div>
            }
          />
        </div>
        
        <div className="flex-1 flex flex-col justify-center relative gap-2">
          <div className="flex items-center relative">
            <div className="flex-1 pr-2.5 max-w-[180px]">
              <h3 className="font-normal text-base leading-tight truncate text-left">
                {recipe.title}
              </h3>
            </div>
            <div className="absolute right-0 flex items-center">
              <div className="text-base font-normal whitespace-nowrap">
                {price} €
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-start">
            <div className="text-sm text-muted-foreground">
              2 raciones • {mealType || "Comida"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};