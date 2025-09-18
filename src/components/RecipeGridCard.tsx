import { Plus, Lock } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { ImageLoader } from './ui/image-loader';
import { Button } from './ui/button';

interface RecipeGridCardProps {
  recipe: Recipe;
  onAdd: (recipe: Recipe) => void;
  onClick?: (recipe: Recipe) => void;
}

export const RecipeGridCard = ({ recipe, onAdd, onClick }: RecipeGridCardProps) => {
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
    <>
      <div 
        className="flex gap-3 items-center cursor-pointer relative w-full transition-transform duration-200 h-[120px] py-4"
        onClick={handleClick}
      >
        <div className="flex-shrink-0">
          <ImageLoader
            src={recipe.image} 
            alt={recipe.title}
            className="w-[120px] h-[120px] object-cover rounded-lg"
            category={recipe.category}
            priority={true} // Prioridad alta para imágenes de recetas
            placeholder={
              <div className="text-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                <div className="text-xs opacity-70">Cargando...</div>
              </div>
            }
          />
        </div>
        
        <div className="flex-1 flex flex-col justify-center relative h-[120px] gap-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <h3 className="font-normal text-base leading-tight line-clamp-2 text-left">
                {recipe.title}
              </h3>
              <div className="text-sm font-normal text-muted-foreground mt-1">
                {price} €
              </div>
            </div>
            {/* Lock icon on the right */}
            <div className="flex-shrink-0 ml-2">
              <Lock className="w-5 h-5 text-primary" fill="currentColor" />
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{recipe.calories} kcal</span>
            <span>P {recipe.macros.protein}g</span>
            <span>H {recipe.macros.carbs}g</span>
            <span>G {recipe.macros.fat}g</span>
          </div>
        </div>
      </div>
      <div className="h-px bg-gray-200 mx-0"></div>
    </>
  );
};