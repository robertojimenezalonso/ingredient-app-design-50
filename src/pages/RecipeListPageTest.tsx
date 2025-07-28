import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { useGlobalIngredients } from '@/hooks/useGlobalIngredients';
import { useCart } from '@/hooks/useCart';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { FloatingButton } from '@/components/FloatingButton';
import { Recipe, CategoryType } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

const RecipeListPageTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { getRecipesByCategory } = useRecipes();
  const { addToCart } = useCart();
  const { config } = useUserConfig();
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);

  // Generar 7 días de fechas empezando desde hoy
  const generateWeekDates = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Empieza en lunes
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const weekDates = generateWeekDates();
  const mealTypes = ['Desayuno', 'Almuerzo', 'Cena'];

  // Load AI recipes from localStorage when component mounts
  useEffect(() => {
    console.log('RecipeListPageTest: Component mounted, checking localStorage...');
    const savedAiRecipes = localStorage.getItem('aiGeneratedRecipes');
    
    if (savedAiRecipes) {
      try {
        const parsedRecipes = JSON.parse(savedAiRecipes);
        console.log('RecipeListPageTest: Successfully parsed AI recipes:', parsedRecipes.length, 'recipes');
        setAiRecipes(parsedRecipes);
      } catch (error) {
        console.error('RecipeListPageTest: Error parsing AI recipes from localStorage:', error);
      }
    }
  }, []);

  // Handle recipe replacement when coming from change mode
  useEffect(() => {
    const replaceRecipe = location.state?.replaceRecipe;
    if (replaceRecipe) {
      const { originalId, newRecipe } = replaceRecipe;
      
      // Update AI recipes in state
      setAiRecipes(prevRecipes => 
        prevRecipes.map(recipe => 
          recipe.id === originalId ? newRecipe : recipe
        )
      );
      
      // Update localStorage
      const savedAiRecipes = localStorage.getItem('aiGeneratedRecipes');
      if (savedAiRecipes) {
        try {
          const parsedRecipes = JSON.parse(savedAiRecipes);
          const updatedRecipes = parsedRecipes.map((recipe: Recipe) => 
            recipe.id === originalId ? newRecipe : recipe
          );
          localStorage.setItem('aiGeneratedRecipes', JSON.stringify(updatedRecipes));
        } catch (error) {
          console.error('Error updating recipes in localStorage:', error);
        }
      }
      
      // Clear the state to prevent repeated replacements
      navigate('/milista-test', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const { 
    getSelectedIngredientsCount,
    initializeIngredients,
    selectedIngredientIds
  } = useGlobalIngredients();
  
  // Initialize ingredients when recipes load
  useEffect(() => {
    if (aiRecipes.length > 0) {
      initializeIngredients(aiRecipes);
    }
  }, [aiRecipes.length, initializeIngredients]);
  
  // Calculate selected ingredients count
  const [selectedIngredientsCount, setSelectedIngredientsCount] = useState(0);
  
  // Update count when selection changes
  useEffect(() => {
    const count = getSelectedIngredientsCount(aiRecipes);
    setSelectedIngredientsCount(count);
  }, [selectedIngredientIds.join(','), aiRecipes, getSelectedIngredientsCount]);

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleSearchOffers = () => {
    navigate('/search-offers');
  };

  const handleBack = () => {
    navigate('/milista');
  };

  // Función para obtener una receta para una celda específica
  const getRecipeForCell = (dayIndex: number, mealIndex: number) => {
    const recipeIndex = (dayIndex * 3 + mealIndex) % aiRecipes.length;
    return aiRecipes[recipeIndex] || null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver a Mi Lista</span>
          </button>
          <h1 className="text-lg font-semibold">Planificación Semanal</h1>
          <div /> {/* Spacer */}
        </div>
      </div>

      {/* Grid Container */}
      <div className="p-4">
        <div className="grid gap-2 max-w-full overflow-x-auto" style={{ gridTemplateColumns: 'auto 1fr 1fr 1fr' }}>
          {/* Header Row */}
          <div className="bg-muted p-3 rounded-lg">
          </div>
          {mealTypes.map((mealType) => (
            <div key={mealType} className="bg-primary/10 p-3 rounded-lg text-center">
              <span className="text-sm font-semibold text-primary">{mealType}</span>
            </div>
          ))}

          {/* Data Rows */}
          {weekDates.map((date, dayIndex) => (
            <React.Fragment key={dayIndex}>
              {/* Date Cell */}
              <div className="bg-muted p-2 rounded-lg flex flex-col justify-center">
                <div className="text-xs font-medium text-muted-foreground">
                  {format(date, 'EEE', { locale: es })}
                </div>
                <div className="text-sm font-semibold">
                  {format(date, 'd')}
                </div>
              </div>
              
              {/* Meal Cells */}
              {mealTypes.map((_, mealIndex) => {
                const recipe = getRecipeForCell(dayIndex, mealIndex);
                return (
                  <div key={mealIndex} className="bg-card border rounded-lg p-2 hover:shadow-md transition-shadow">
                    {recipe ? (
                      <button
                        onClick={() => handleRecipeClick(recipe)}
                        className="w-full text-left space-y-2"
                      >
                        <div className="aspect-square rounded-md overflow-hidden bg-muted">
                          <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-medium line-clamp-2 leading-tight">
                            {recipe.title}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{recipe.time} min</span>
                            <span>•</span>
                            <span>{recipe.servings} pers.</span>
                          </div>
                        </div>
                      </button>
                    ) : (
                      <div className="w-full space-y-2">
                        <div className="aspect-square rounded-md overflow-hidden bg-muted">
                          <img
                            src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=60"
                            alt="Receta placeholder"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-medium line-clamp-2 leading-tight">
                            Receta Saludable
                          </h4>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <FloatingButton 
        onClick={handleSearchOffers}
        selectedCount={selectedIngredientsCount}
        recipeCount={aiRecipes.length}
      >
        Buscar mejor oferta
      </FloatingButton>
    </div>
  );
};

export default RecipeListPageTest;