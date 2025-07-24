import { Heart, Plus, Trash2 } from 'lucide-react';
import { Recipe, CATEGORIES } from '@/types/recipe';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useEffect, useState, useRef } from 'react';
import { IngredientAvatars } from './IngredientAvatars';
import { Badge } from './ui/badge';

interface RecipeCardProps {
  recipe: Recipe;
  onAdd: (recipe: Recipe) => void;
  onClick: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
  onSwipeStateChange?: (recipeId: string, isSwiped: boolean) => void;
  shouldResetSwipe?: boolean;
  mealType?: string;
}

export const RecipeCard = ({ recipe, onAdd, onClick, onDelete, onSwipeStateChange, shouldResetSwipe, mealType }: RecipeCardProps) => {
  const { config } = useUserConfig();
  const [useTotalAbbreviation, setUseTotalAbbreviation] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isSwiped, setIsSwiped] = useState(false);
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

  // Reset swipe when shouldResetSwipe changes
  useEffect(() => {
    if (shouldResetSwipe && isSwiped) {
      setSwipeX(0);
      setIsSwiped(false);
      setIsSwipeActive(false);
    }
  }, [shouldResetSwipe, isSwiped]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Evitar que el evento se propague al contenedor padre
    const touch = e.touches[0];
    containerRef.current?.setAttribute('data-start-x', touch.clientX.toString());
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Evitar que el evento se propague al contenedor padre
    const touch = e.touches[0];
    const startX = parseFloat(containerRef.current?.getAttribute('data-start-x') || '0');
    const currentX = touch.clientX;
    const deltaX = currentX - startX;
    
    if (isSwiped) {
      // Si ya está swipeada, permitir swipe hacia la izquierda para volver
      if (deltaX < 0 && deltaX >= -80) {
        setSwipeX(80 + deltaX);
        setIsSwipeActive(true);
      }
    } else {
      // Swipe inicial hacia la derecha
      if (deltaX > 0 && deltaX <= 80) {
        setSwipeX(deltaX);
        setIsSwipeActive(true);
        // Notificar que esta card está siendo swipeada
        onSwipeStateChange?.(recipe.id, true);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isSwiped) {
      // Si está swipeada y el swipe actual es menor a 20, volver a la posición original
      if (swipeX < 20) {
        setSwipeX(0);
        setIsSwiped(false);
        setIsSwipeActive(false);
        onSwipeStateChange?.(recipe.id, false);
      } else {
        // Mantener en posición swipeada
        setSwipeX(80);
        setIsSwipeActive(true);
      }
    } else {
      // Swipe inicial
      if (swipeX > 40) {
        // Mantener la card en posición swipeada
        setSwipeX(80);
        setIsSwiped(true);
        setIsSwipeActive(true);
        onSwipeStateChange?.(recipe.id, true);
      } else {
        // Volver a la posición original
        setSwipeX(0);
        setIsSwipeActive(false);
        onSwipeStateChange?.(recipe.id, false);
      }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se ejecute onClick del card
    setIsDeleted(true);
    setTimeout(() => {
      onDelete?.(recipe);
    }, 200);
  };

  if (isDeleted) {
    return null;
  }

  return (
    <div className={`relative overflow-visible h-32 ${isSwipeActive || isSwiped ? 'z-50' : 'z-10'}`} style={{ touchAction: 'none' }}>
      {/* Delete background */}
      <div 
        className={`absolute inset-0 bg-red-500 flex items-center justify-end pr-6 rounded-2xl transition-opacity duration-200 ${
          isSwipeActive || isSwiped ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button 
          onClick={handleDelete}
          className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-colors"
        >
          <Trash2 className="h-5 w-5 text-white" />
        </button>
      </div>
      
      {/* Main card */}
      <div 
        ref={containerRef}
        className="flex gap-3 cursor-pointer mb-3 relative rounded-2xl bg-white mx-auto max-w-md last:mb-4 transition-transform duration-200"
        style={{ transform: `translateX(${swipeX}px)`, touchAction: 'none' }}
        onClick={() => !isSwipeActive && !isSwiped && onClick(recipe)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
    </div>
  );
};