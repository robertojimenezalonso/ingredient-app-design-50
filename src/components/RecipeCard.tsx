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
      className="flex gap-3 cursor-pointer mb-3 relative border border-[#E5E5E5] rounded-2xl"
      onClick={() => onClick(recipe)}
    >
      <div className="relative flex-shrink-0">
        <img 
          src={recipe.image} 
          alt={recipe.title}
          className="w-32 h-32 object-cover rounded-l-2xl"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400';
          }}
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-start pt-1 relative h-32">
        <h3 className="font-medium text-lg line-clamp-2 mb-0.5 leading-tight overflow-hidden mt-2">
          {recipe.title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5 mt-2">
          <span>{recipe.calories} kcal</span>
          <span>·</span>
          <span>{recipe.time} min</span>
        </div>
      </div>
      
    </div>
  );
};