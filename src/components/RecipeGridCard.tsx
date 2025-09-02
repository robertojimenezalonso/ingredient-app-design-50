import { Plus } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { ImageLoader } from './ui/image-loader';

interface RecipeGridCardProps {
  recipe: Recipe;
  onAdd: (recipe: Recipe) => void;
  onClick?: (recipe: Recipe) => void;
}

export const RecipeGridCard = ({ recipe, onAdd, onClick }: RecipeGridCardProps) => {
  // Generate random price between 3-12 euros
  const price = (Math.random() * 9 + 3).toFixed(2).replace('.', ',');

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
            className="w-[112px] h-[112px] object-cover rounded-lg"
            category={recipe.category}
            placeholder={
              <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            }
          />
        </div>
        
        <div className="flex-1 flex flex-col justify-start relative h-[120px] pt-3">
          <div className="flex items-start justify-between mb-2 relative mr-3">
            <h3 className="font-normal text-base leading-tight mt-2 w-[140px] truncate whitespace-nowrap overflow-hidden">
              {recipe.title}
            </h3>
            <span className="font-normal text-base leading-tight mt-2 ml-2">{price} €</span>
          </div>
          <div className="mb-1.5">
            <div className="flex items-center gap-1 mb-2">
              <img src="/lovable-uploads/d923963b-f4fc-4381-8216-90ad753ef245.png" alt="calories" className="h-4 w-4" />
              <span className="text-sm font-normal" style={{ color: '#6C6C6C' }}>{recipe.calories} kcal</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <img src="/lovable-uploads/967d027e-2a1d-40b3-b300-c73dbb88963a.png" alt="protein" className="h-4 w-4" />
                <span className="text-sm font-normal" style={{ color: '#6C6C6C' }}>{recipe.macros.protein}g</span>
              </div>
              <div className="flex items-center gap-1">
                <img src="/lovable-uploads/26934026-f2f8-4901-a7ba-e4e0c8ac36e1.png" alt="carbs" className="h-4 w-4" />
                <span className="text-sm font-normal" style={{ color: '#6C6C6C' }}>{recipe.macros.carbs}g</span>
              </div>
              <div className="flex items-center gap-1">
                <img src="/lovable-uploads/7f516dd8-5753-49bd-9b5d-aa5c0bfeedd1.png" alt="fat" className="h-4 w-4" />
                <span className="text-sm font-normal" style={{ color: '#6C6C6C' }}>{recipe.macros.fat}g</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-px bg-gray-200 mx-0"></div>
    </>
  );
};