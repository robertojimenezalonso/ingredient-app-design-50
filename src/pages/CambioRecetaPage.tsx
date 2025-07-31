import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { ImageLoader } from '@/components/ui/image-loader';
import { Button } from '@/components/ui/button';
import { useRecipes } from '@/hooks/useRecipes';
import { useRecipeBank } from '@/hooks/useRecipeBank';
import { useToast } from '@/hooks/use-toast';

export const CambioRecetaPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { getRecipesByCategory } = useRecipes();
  const { getRecipesByCategory: getBankRecipesByCategory, convertToRecipe } = useRecipeBank();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  
  const originalRecipeId = searchParams.get('originalId');
  const originalRecipeTitle = searchParams.get('originalTitle');
  const category = searchParams.get('category') || 'pasta';

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoading(true);
        
        // Mapear categorías a las del recipe bank
        const categoryMap: { [key: string]: string } = {
          'breakfast': 'desayuno',
          'lunch': 'comida', 
          'dinner': 'cena',
          'snacks': 'snack',
          'appetizer': 'aperitivo',
          'desserts': 'postre'
        };
        
        // Obtener recetas normales de la misma categoría
        const normalRecipes = getRecipesByCategory(category as any)
          .filter(recipe => recipe.id !== originalRecipeId);
        
        // Obtener recetas del banco si es necesario
        const bankCategory = categoryMap[category] || category.toLowerCase();
        const bankRecipes = getBankRecipesByCategory(bankCategory)
          .filter(bankRecipe => bankRecipe.id !== originalRecipeId)
          .map(bankRecipe => convertToRecipe(bankRecipe, 2)); // Convertir a formato Recipe
        
        // Combinar ambas fuentes
        const allRecipes = [...normalRecipes, ...bankRecipes];
        
        // Si tenemos menos de 10, permitir repeticiones del banco
        let finalRecipes = allRecipes.slice(0, 10);
        
        if (finalRecipes.length < 10 && bankRecipes.length > 0) {
          const needed = 10 - finalRecipes.length;
          const additionalRecipes = [];
          
          // Repetir recetas del banco hasta completar 10
          for (let i = 0; i < needed; i++) {
            const recipeIndex = i % bankRecipes.length;
            const duplicatedRecipe = {
              ...bankRecipes[recipeIndex],
              id: `${bankRecipes[recipeIndex].id}-duplicate-${i}` // ID único para evitar problemas de keys
            };
            additionalRecipes.push(duplicatedRecipe);
          }
          
          finalRecipes = [...finalRecipes, ...additionalRecipes];
        }
        
        setRecipes(finalRecipes);
      } catch (error) {
        console.error('Error loading recipes:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las recetas alternativas",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, [category, originalRecipeId, getRecipesByCategory, getBankRecipesByCategory, convertToRecipe, toast]);

  const handleRecipeSelect = (selectedRecipe: Recipe) => {
    // Navegar a los detalles de la receta con parámetros especiales
    navigate(`/recipe/${selectedRecipe.id}?mode=change&originalId=${originalRecipeId}&originalTitle=${encodeURIComponent(originalRecipeTitle || '')}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Cambiar Receta</h1>
          </div>
        </div>
        
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Cambiar Receta</h1>
            <p className="text-sm text-muted-foreground">
              Sustituir: {originalRecipeTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-card rounded-2xl overflow-hidden border cursor-pointer transition-transform hover:scale-105 active:scale-95"
              onClick={() => handleRecipeSelect(recipe)}
            >
              <div className="aspect-square relative">
                <ImageLoader
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                  fallbackSrc="https://images.unsplash.com/photo-1546548970-71785318a17b?w=400"
                  placeholder={
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  }
                />
              </div>
              
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 mb-2 leading-tight">
                  {recipe.title}
                </h3>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{recipe.calories} kcal</span>
                  <span>·</span>
                  <span>{recipe.time} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {recipes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No se encontraron recetas alternativas
            </p>
          </div>
        )}
      </div>
    </div>
  );
};