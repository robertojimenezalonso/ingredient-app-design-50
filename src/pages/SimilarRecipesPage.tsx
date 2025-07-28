import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Recipe } from '@/types/recipe';
import { useRecipes } from '@/hooks/useRecipes';
import { useAIRecipes } from '@/hooks/useAIRecipes';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationState {
  originalRecipe: Recipe;
  onReplace: (newRecipe: Recipe) => void;
}

export const SimilarRecipesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recipes } = useRecipes();
  const { generateMultipleRecipes } = useAIRecipes();
  const [similarRecipes, setSimilarRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const state = location.state as LocationState;
  const originalRecipe = state?.originalRecipe;

  useEffect(() => {
    if (!originalRecipe) {
      navigate('/milista');
      return;
    }

    const generateSimilarRecipes = async () => {
      setIsLoading(true);
      
      // Get some existing similar recipes from the same category
      const existingSimilar = recipes
        .filter(recipe => 
          recipe.category === originalRecipe.category && 
          recipe.id !== originalRecipe.id
        )
        .slice(0, 5);

      // Generate additional AI recipes if needed
      const request = {
        people: 2,
        days: ['1'],
        meals: [originalRecipe.category],
        restrictions: [`Genera recetas similares a "${originalRecipe.title}" pero diferentes`]
      };

      try {
        const aiRecipes = await generateMultipleRecipes(request, 5, false);
        const allSimilar = [...existingSimilar, ...aiRecipes].slice(0, 10);
        setSimilarRecipes(allSimilar);
      } catch (error) {
        setSimilarRecipes(existingSimilar);
      }
      
      setIsLoading(false);
    };

    generateSimilarRecipes();
  }, [originalRecipe, recipes, generateMultipleRecipes, navigate]);

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleChooseRecipe = () => {
    if (selectedRecipe && state?.onReplace) {
      state.onReplace(selectedRecipe);
      toast({
        title: "Receta cambiada",
        description: `${originalRecipe?.title} ha sido sustituida por ${selectedRecipe.title}`,
      });
      navigate('/milista');
    }
  };

  const handleBack = () => {
    navigate('/milista');
  };

  if (!originalRecipe) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border z-10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Recetas similares</h1>
            <p className="text-sm text-muted-foreground">Sustituir: {originalRecipe.title}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {similarRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className={`relative ${selectedRecipe?.id === recipe.id ? 'ring-2 ring-primary rounded-2xl' : ''}`}
              >
                <RecipeCard
                  recipe={recipe}
                  onAdd={() => {}}
                  onClick={() => handleRecipeSelect(recipe)}
                />
                {selectedRecipe?.id === recipe.id && (
                  <div className="absolute inset-0 bg-primary/10 rounded-2xl pointer-events-none" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Choose Button */}
      {selectedRecipe && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-8 pt-4 bg-gradient-to-t from-background to-transparent">
          <Button
            onClick={handleChooseRecipe}
            className="h-12 px-8 text-base font-medium rounded-full shadow-lg"
            size="lg"
          >
            Elegir esta receta
          </Button>
        </div>
      )}
    </div>
  );
};