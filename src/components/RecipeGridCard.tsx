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
    <>
      {isFirstCard ? (
        <div className="bg-[#C2FFF0] rounded-lg p-3 my-3">
          {/* Title and meal type tag */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg leading-tight text-[#00664D] flex-1 truncate pr-2" 
                style={{ maxWidth: 'calc(100% - 80px)' }}>
              {recipe.title}
            </h3>
            <div className="bg-[#47FFD1] text-[#00664D] px-3 py-1 rounded-full text-xs font-medium">
              {mealType}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex gap-3 items-center cursor-pointer" onClick={handleClick}>
            <div className="flex-shrink-0">
              <ImageLoader
                src={recipe.image} 
                alt={recipe.title}
                className="w-[120px] h-[120px] object-cover rounded-lg"
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
            
            <div className="flex-1 flex flex-col justify-center gap-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-normal text-[#00664D]">
                  {price} €
                </div>
                <div className="text-sm text-[#00664D]">
                  2 personas
                </div>
              </div>
              
              <div className="flex items-center text-sm text-[#00664D]">
                <span>{recipe.calories} kcal • {recipe.macros.protein}P • {recipe.macros.carbs}H • {recipe.macros.fat}G</span>
              </div>
              
              <div className="flex-shrink-0">
                <Lock className="w-5 h-5 text-[#00664D]" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="flex gap-3 items-center cursor-pointer relative w-full transition-transform duration-200 py-4 h-[120px]"
          onClick={handleClick}
        >
          <div className="flex-shrink-0">
            <ImageLoader
              src={recipe.image} 
              alt={recipe.title}
              className="w-[120px] h-[120px] object-cover rounded-lg"
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
          
          <div className="flex-1 flex flex-col justify-center relative h-[120px] gap-2">
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-2" style={{ maxWidth: '80px' }}>
                <h3 className="font-normal text-base leading-tight truncate text-left">
                  {recipe.title}
                </h3>
              </div>
              <div className="flex-shrink-0 ml-2">
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
      )}
      <div className="h-px bg-gray-200 mx-0"></div>
    </>
  );
};