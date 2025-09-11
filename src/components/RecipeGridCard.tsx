import { Plus } from 'lucide-react';
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
          <div className="flex items-start relative">
            <h3 className="font-normal text-base leading-tight flex-1 line-clamp-2 pr-4 text-left" style={{ marginRight: "60px" }}>
              {recipe.title}
            </h3>
            <span className="font-normal text-base leading-tight whitespace-nowrap absolute right-0 top-0">{price} €</span>
          </div>
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
      <div className="h-px bg-gray-200 mx-0"></div>
    </>
  );
};