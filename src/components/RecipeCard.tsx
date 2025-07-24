import { Heart, Plus } from 'lucide-react';
import { Recipe, CATEGORIES } from '@/types/recipe';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useEffect, useState, useRef } from 'react';
import { IngredientAvatars } from './IngredientAvatars';
import { Badge } from './ui/badge';

interface RecipeCardProps {
  recipe: Recipe;
  onAdd: (recipe: Recipe) => void;
  onClick: (recipe: Recipe) => void;
  mealType?: string;
}

export const RecipeCard = ({ recipe, onAdd, onClick, mealType }: RecipeCardProps) => {
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

  // Función para obtener el color del tag según el tipo de comida
  const getMealTypeColor = (meal: string) => {
    switch (meal) {
      case 'Desayuno':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Almuerzo':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cena':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Aperitivo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Snack':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Merienda':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
      className="flex gap-3 cursor-pointer mb-3 relative rounded-2xl bg-white mx-auto max-w-md"
      onClick={() => onClick(recipe)}
    >
      <div className="relative flex-shrink-0">
        <img 
          src={recipe.image} 
          alt={recipe.title}
          className="w-32 h-32 object-cover rounded-2xl"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400';
          }}
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-start pt-1 relative h-32">
        <h3 className="font-medium text-lg line-clamp-2 mb-0.5 leading-tight overflow-hidden mt-2">
          {recipe.title}
        </h3>
        {mealType && (
          <span className={`text-sm font-medium mb-2 block ${getMealTypeColor(mealType).replace('bg-', 'text-').replace('-100', '-600').replace('border-', '')}`}>
            {mealType}
          </span>
        )}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1.5">
          <span>{recipe.calories} kcal</span>
          <span>·</span>
          <span>{recipe.time} min</span>
        </div>
      </div>
      
    </div>
  );
};