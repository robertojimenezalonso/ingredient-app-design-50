import { Heart } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { useUserConfig } from '@/contexts/UserConfigContext';

interface DiscountRecipeCardProps {
  recipe: Recipe;
  onAdd: (recipe: Recipe) => void;
  onClick: (recipe: Recipe) => void;
}

export const DiscountRecipeCard = ({ recipe, onAdd, onClick }: DiscountRecipeCardProps) => {
  const { config } = useUserConfig();
  
  // Generate random price between 8-25€
  const rawPrice = Math.random() * 17 + 8;
  const servings = config.servingsPerRecipe || 1;
  
  // Calculate prices per serving
  const originalPricePerServing = (rawPrice / servings).toFixed(2).replace('.', ',');
  const discountedPricePerServing = (rawPrice * 0.8 / servings).toFixed(2).replace('.', ',');

  return (
    <div 
      className="w-[103px] flex-shrink-0 cursor-pointer"
      onClick={() => onClick(recipe)}
    >
      <div className="relative mb-2">
        <img 
          src={recipe.image} 
          alt={recipe.title}
          className="w-full h-[103px] object-cover rounded-[20px]"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400';
          }}
        />
        <button 
          className="absolute top-2 right-2 p-1 hover:scale-110 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(recipe);
          }}
        >
          <Heart className="h-5 w-5 text-white drop-shadow-lg" />
        </button>
      </div>
      
      <div className="pl-0">
        <h3 className="font-medium text-base line-clamp-2 mb-1.5 leading-tight">
          {recipe.title}
        </h3>
        <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
          <span className="line-through mr-2">{originalPricePerServing} €</span>
          <span className="font-bold text-foreground">{discountedPricePerServing} €/r</span>
        </div>
      </div>
    </div>
  );
};