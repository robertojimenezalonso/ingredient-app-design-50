import { Plus, Clock } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { ImageLoader } from './ui/image-loader';

interface RecipeGridCardProps {
  recipe: Recipe;
  onAdd: (recipe: Recipe) => void;
  onClick?: (recipe: Recipe) => void;
}

export const RecipeGridCard = ({ recipe, onAdd, onClick }: RecipeGridCardProps) => {
  const truncateTitle = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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
      className="overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative aspect-square mb-3">
        <ImageLoader
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover rounded-xl"
          fallbackSrc="https://images.unsplash.com/photo-1546548970-71785318a17b?w=400"
        />
        <button 
          onClick={handleAddClick}
          className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <Plus className="h-4 w-4 text-foreground" />
        </button>
      </div>
      
      <div>
        <h3 className="text-sm leading-tight text-foreground line-clamp-2 mb-2">
          {truncateTitle(recipe.title)}
        </h3>
        
        {/* Nutrition info similar to RecipeCard */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{recipe.time}min</span>
          </div>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{recipe.calories} kcal</span>
        </div>
        
        {/* Macros similar to RecipeCard */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#DE6968]"></div>
            <span className="text-muted-foreground">{recipe.macros.protein}g</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#DE9A69]"></div>
            <span className="text-muted-foreground">{recipe.macros.carbs}g</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#6998DD]"></div>
            <span className="text-muted-foreground">{recipe.macros.fat}g</span>
          </div>
        </div>
      </div>
    </div>
  );
};