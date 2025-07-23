import { Heart, Plus } from 'lucide-react';
import { Recipe, CATEGORIES } from '@/types/recipe';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useEffect, useState, useRef } from 'react';
import { IngredientAvatars } from './IngredientAvatars';

interface RecipeCardProps {
  recipe: Recipe;
  onAdd: (recipe: Recipe) => void;
  onClick: (recipe: Recipe) => void;
}

export const RecipeCard = ({ recipe, onAdd, onClick }: RecipeCardProps) => {
  const { config } = useUserConfig();
  const [useTotalAbbreviation, setUseTotalAbbreviation] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate random price between 8-25€
  const rawPrice = Math.random() * 17 + 8;
  const servings = config.servingsPerRecipe || 1;
  
  // Calculate prices based on servings
  const pricePerServing = (rawPrice / servings).toFixed(2).replace('.', ',');
  const totalPrice = rawPrice.toFixed(2).replace('.', ',');

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const textWidth = textRef.current.scrollWidth;
      const containerWidth = containerRef.current.clientWidth;
      const availableSpace = containerWidth - textWidth;
      setUseTotalAbbreviation(availableSpace < 4);
    }
  }, [pricePerServing, totalPrice]);

  return (
    <div 
      className="flex gap-3 cursor-pointer mb-3 relative"
      onClick={() => onClick(recipe)}
    >
      <div className="relative flex-shrink-0">
        <img 
          src={recipe.image} 
          alt={recipe.title}
          className="w-40 h-40 object-cover rounded-[22px]"
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
      
      <div className="flex-1 flex flex-col justify-start pt-1 relative min-h-40">
        <h3 className="font-medium text-lg line-clamp-2 mb-0.5 leading-tight overflow-hidden">
          {recipe.title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
          <span>{CATEGORIES[recipe.category as keyof typeof CATEGORIES] || recipe.category}</span>
          <span>·</span>
          <span>{recipe.calories} kcal</span>
        </div>
        <div ref={containerRef} className="flex flex-col">
          <span ref={textRef} className="text-base">{pricePerServing} € ración</span>
          <span className="text-xs text-muted-foreground">{totalPrice} € total</span>
        </div>
        <div className="mt-3 mb-2 flex items-center justify-between">
          <IngredientAvatars recipe={recipe} />
          <button 
            className="bg-muted text-muted-foreground p-2 rounded-full hover:scale-110 transition-transform flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onClick(recipe);
            }}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
      
    </div>
  );
};