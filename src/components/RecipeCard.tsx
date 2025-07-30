import { Heart, Plus, Trash2, RefreshCw, Coffee, Utensils, Moon, Apple, Flame } from 'lucide-react';
import { Recipe, CATEGORIES } from '@/types/recipe';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IngredientAvatars } from './IngredientAvatars';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ImageLoader } from './ui/image-loader';

interface RecipeCardProps {
  recipe: Recipe;
  onAdd: (recipe: Recipe) => void;
  onClick: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
  onSubstitute?: (recipe: Recipe) => void;
  onSwipeStateChange?: (recipeId: string, isSwiped: boolean) => void;
  shouldResetSwipe?: boolean;
  mealType?: string;
}

export const RecipeCard = ({ recipe, onAdd, onClick, onDelete, onSubstitute, onSwipeStateChange, shouldResetSwipe, mealType }: RecipeCardProps) => {
  const { config } = useUserConfig();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [useTotalAbbreviation, setUseTotalAbbreviation] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isSwiped, setIsSwiped] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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

  // Función para obtener el icono según el tipo de comida
  const getMealTypeIcon = (meal: string) => {
    switch (meal) {
      case 'Desayuno':
        return Coffee;
      case 'Almuerzo':
        return Utensils;
      case 'Cena':
        return Moon;
      case 'Aperitivo':
        return Apple;
      case 'Snack':
        return Apple;
      case 'Merienda':
        return Apple;
      default:
        return Utensils;
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
    console.log('RecipeCard useEffect - shouldResetSwipe:', shouldResetSwipe, 'isSwiped:', isSwiped, 'recipe:', recipe.title);
    if (shouldResetSwipe && (isSwiped || isSwipeActive)) {
      console.log('Reseteando estado interno de RecipeCard:', recipe.title);
      setSwipeX(0);
      setIsSwiped(false);
      setIsSwipeActive(false);
      setSwipeDirection(null);
      onSwipeStateChange?.(recipe.id, false);
    }
  }, [shouldResetSwipe, isSwiped, isSwipeActive, recipe.id, recipe.title, onSwipeStateChange]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    containerRef.current?.setAttribute('data-start-x', touch.clientX.toString());
    containerRef.current?.setAttribute('data-start-y', touch.clientY.toString());
    containerRef.current?.setAttribute('data-is-swiping', 'false');
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = parseFloat(containerRef.current?.getAttribute('data-start-x') || '0');
    const startY = parseFloat(containerRef.current?.getAttribute('data-start-y') || '0');
    const currentX = touch.clientX;
    const currentY = touch.clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    const isSwipingHorizontal = containerRef.current?.getAttribute('data-is-swiping') === 'true';
    
    // Determinar si es un swipe horizontal solo si no se ha determinado aún
    if (!isSwipingHorizontal && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        // Es un swipe horizontal
        containerRef.current?.setAttribute('data-is-swiping', 'true');
        e.preventDefault();
        e.stopPropagation();
      } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // Es scroll vertical, no hacer nada más
        return;
      }
    }
    
    // Solo procesar swipe horizontal si se determinó que es swipe
    if (isSwipingHorizontal || containerRef.current?.getAttribute('data-is-swiping') === 'true') {
      e.preventDefault();
      e.stopPropagation();
      
      if (isSwiped) {
        // Si ya está swipeada, permitir swipe hacia el centro para volver
        if (swipeDirection === 'right' && deltaX < 0 && deltaX >= -80) {
          setSwipeX(80 + deltaX);
          setIsSwipeActive(true);
        } else if (swipeDirection === 'left' && deltaX > 0 && deltaX <= 80) {
          setSwipeX(-80 + deltaX);
          setIsSwipeActive(true);
        }
      } else {
        // Swipe inicial hacia la derecha (eliminar)
        if (deltaX > 0 && deltaX <= 80) {
          setSwipeX(deltaX);
          setSwipeDirection('right');
          setIsSwipeActive(true);
          onSwipeStateChange?.(recipe.id, true);
        }
        // Swipe inicial hacia la izquierda (cambiar)
        else if (deltaX < 0 && deltaX >= -80) {
          setSwipeX(deltaX);
          setSwipeDirection('left');
          setIsSwipeActive(true);
          onSwipeStateChange?.(recipe.id, true);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (isSwiped) {
      // Si está swipeada y el swipe actual es cerca del centro, volver a la posición original
      if ((swipeDirection === 'right' && swipeX < 20) || (swipeDirection === 'left' && swipeX > -20)) {
        setSwipeX(0);
        setIsSwiped(false);
        setIsSwipeActive(false);
        setSwipeDirection(null);
        onSwipeStateChange?.(recipe.id, false);
      } else {
        // Mantener en posición swipeada
        if (swipeDirection === 'right') {
          setSwipeX(80);
        } else if (swipeDirection === 'left') {
          setSwipeX(-80);
        }
        setIsSwipeActive(true);
      }
    } else {
      // Swipe inicial hacia la derecha
      if (swipeX > 40) {
        setSwipeX(80);
        setIsSwiped(true);
        setIsSwipeActive(true);
        setSwipeDirection('right');
        onSwipeStateChange?.(recipe.id, true);
      }
      // Swipe inicial hacia la izquierda
      else if (swipeX < -40) {
        setSwipeX(-80);
        setIsSwiped(true);
        setIsSwipeActive(true);
        setSwipeDirection('left');
        onSwipeStateChange?.(recipe.id, true);
      }
      // Volver a la posición original
      else {
        setSwipeX(0);
        setIsSwipeActive(false);
        setSwipeDirection(null);
        onSwipeStateChange?.(recipe.id, false);
      }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se ejecute onClick del card
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleted(true);
    setShowDeleteDialog(false);
    toast({
      title: "Receta eliminada",
      description: `${recipe.title} ha sido eliminada de tu lista`,
    });
    setTimeout(() => {
      onDelete?.(recipe);
    }, 200);
  };

  const handleSubstitute = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navegar a la página de cambio de receta
    navigate(`/cambioReceta?originalId=${recipe.id}&originalTitle=${encodeURIComponent(recipe.title)}&category=${recipe.category || 'pasta'}`);
  };

  if (isDeleted) {
    return null;
  }

  return (
    <div className={`relative overflow-visible h-[120px] ${isSwipeActive || isSwiped ? 'z-20' : 'z-10'}`}>
      {/* Delete background (swipe right) */}
      <div 
        className={`absolute inset-0 bg-red-500 rounded-2xl transition-opacity duration-200 ${
          (isSwipeActive || isSwiped) && swipeDirection === 'right' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div 
          className="absolute left-0 top-0 w-20 h-full flex flex-col items-center justify-center text-white cursor-pointer"
          onClick={handleDelete}
        >
          <Trash2 className="h-6 w-6 mb-1" />
          <span className="text-xs font-medium">Eliminar</span>
        </div>
      </div>

      {/* Change background (swipe left) */}
      <div 
        className={`absolute inset-0 bg-blue-500 rounded-2xl transition-opacity duration-200 ${
          (isSwipeActive || isSwiped) && swipeDirection === 'left' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div 
          className="absolute right-0 top-0 w-20 h-full flex flex-col items-center justify-center text-white cursor-pointer"
          onClick={handleSubstitute}
        >
          <RefreshCw className="h-6 w-6 mb-1" />
          <span className="text-xs font-medium">Cambiar</span>
        </div>
      </div>
      
      {/* Main card */}
      <div 
        ref={containerRef}
        data-recipe-card="true"
        className="flex gap-3 items-center cursor-pointer relative rounded-xl bg-white w-full transition-transform duration-200 h-[120px] shadow-[0_4px_20px_rgba(0,0,0,0.1)] border p-2 mb-3"
        style={{ borderColor: '#F8F8FC' }}
        onClick={() => onClick(recipe)}
      >
      <div className="relative flex-shrink-0">
        <ImageLoader
          src={recipe.image} 
          alt={recipe.title}
          className="w-[104px] h-[104px] object-cover rounded-lg"
          fallbackSrc="https://images.unsplash.com/photo-1546548970-71785318a17b?w=400"
          placeholder={
            <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
          }
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-start relative h-[120px] pt-3">
        <div className="flex items-start gap-2 mb-2 relative">
          <h3 className="font-medium text-base leading-tight mt-2 w-[140px] truncate whitespace-nowrap overflow-hidden">
            {recipe.title}
          </h3>
          {mealType && (
            <Badge variant="secondary" className="text-black text-xs font-normal px-2 py-1 absolute right-2 top-1 min-w-fit z-50" style={{ backgroundColor: '#F6F6F6' }}>
              {mealType.length > 4 ? mealType.slice(0, 4) + '.' : mealType}
            </Badge>
          )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Qué quieres hacer con esta receta?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar "{recipe.title}" o prefieres sustituirla por una nueva receta?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2">
            <AlertDialogAction 
              onClick={handleSubstitute}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Sustituir por nueva receta
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Eliminar definitivamente
            </AlertDialogAction>
            <AlertDialogCancel className="w-full">
              Cancelar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
