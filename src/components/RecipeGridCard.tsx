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
  
  const getMealTypeAbbreviation = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'desayuno':
        return 'Desay.';
      case 'comida':
        return 'Comid.';
      case 'aperitivo':
        return 'Aper.';
      case 'merienda':
        return 'Merien.';
      case 'postre':
        return 'Postr.';
      case 'cena':
        return 'Cena';
      case 'snack':
        return 'Snack';
      default:
        return type || 'Comid.';
    }
  };
  
  const price = generateConsistentPrice(recipe.id);
  const servings = 2;
  const pricePerServing = (parseFloat(price.replace(',', '.')) / servings).toFixed(2).replace('.', ',');

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
        
        <div className="flex-1 flex flex-col justify-center relative gap-1 min-w-0">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-normal text-base leading-tight truncate text-left pr-2 flex-1">
                {recipe.title}
              </h3>
              <span className="bg-muted px-2 py-1 rounded-full text-xs text-muted-foreground whitespace-nowrap ml-2">
                {getMealTypeAbbreviation(mealType || "Comida")}
              </span>
            </div>
            <div className="text-sm flex items-center gap-1">
              <span>{price} €</span>
              <span className="text-muted-foreground">({pricePerServing} €/ración)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};