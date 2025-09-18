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
    <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
      <div 
        className="flex gap-3 items-center cursor-pointer relative w-full transition-transform duration-200"
        onClick={handleClick}
      >
        <div className="flex-shrink-0">
          <ImageLoader
            src={recipe.image} 
            alt={recipe.title}
            className="w-[100px] h-[100px] object-cover rounded-lg"
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
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-2">
              <h3 className="font-normal text-base leading-tight truncate text-left pr-8">
                {recipe.title}
              </h3>
            </div>
            <div className="absolute top-0 right-0">
              <Lock className="w-5 h-5 text-primary" fill="currentColor" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm font-normal text-muted-foreground">
              {price} €
            </div>
            <div className="text-sm text-muted-foreground">
              2 personas • {mealType || "Comida"}
            </div>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <span>{recipe.calories} kcal • {recipe.macros.protein}P • {recipe.macros.carbs}H • {recipe.macros.fat}G</span>
          </div>
        </div>
      </div>
    </div>
  );
};