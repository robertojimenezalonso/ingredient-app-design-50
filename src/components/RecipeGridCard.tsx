import { Plus } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { ImageLoader } from './ui/image-loader';

interface RecipeGridCardProps {
  recipe: Recipe;
  onAdd: (recipe: Recipe) => void;
  onClick?: (recipe: Recipe) => void;
}

export const RecipeGridCard = ({ recipe, onAdd, onClick }: RecipeGridCardProps) => {
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
    <div 
      className="flex gap-3 items-center cursor-pointer relative rounded-xl bg-white w-full transition-transform duration-200 h-[150px] shadow-[0_4px_20px_rgba(0,0,0,0.1)] border p-2 mb-3"
      style={{ borderColor: '#F8F8FC' }}
      onClick={handleClick}
    >
      <div className="relative flex-shrink-0">
        <ImageLoader
          src={recipe.image} 
          alt={recipe.title}
          className="w-[104px] h-[104px] object-cover rounded-lg"
          category={recipe.category}
          placeholder={
            <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
          }
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-start relative h-[150px] pt-2 pr-2">
        <div className="flex items-start gap-2 mb-2 relative">
          <h3 className="font-medium text-base leading-tight mt-1 w-[140px] truncate whitespace-nowrap overflow-hidden">
            {recipe.title}
          </h3>
        </div>
        
        {/* Precio debajo del título */}
        <div className="mb-3">
          <span className="font-medium text-sm text-black">
            {(() => {
              const basePrice = Math.random() * 15 + 10;
              const discountPrice = basePrice * 0.85;
              return discountPrice.toFixed(2).replace('.', ',') + ' €';
            })()}
            <span className="text-xs font-normal text-gray-500 ml-1">precio medio por porción</span>
          </span>
        </div>
        
        <div className="flex-1 flex flex-col justify-between">
          <div>
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
    </div>
  );
};