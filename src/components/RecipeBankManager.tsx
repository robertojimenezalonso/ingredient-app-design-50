import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRecipeBank } from '@/hooks/useRecipeBank';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChefHat, RefreshCw } from 'lucide-react';

export const RecipeBankManager = () => {
  const { 
    recipes, 
    isLoading, 
    isGenerating, 
    generateRecipeBank, 
    getRecipesByCategory,
    loadRecipes 
  } = useRecipeBank();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);

  const handleGenerateBank = async (category?: string) => {
    try {
      await generateRecipeBank(category);
      const categoryName = category ? 
        (category.charAt(0).toUpperCase() + category.slice(1)) : 
        "Banco completo";
      toast({
        title: `¡${categoryName} generado!`,
        description: category ? 
          `Se han creado recetas de ${categoryName.toLowerCase()} con sus imágenes.` :
          "Se han creado 39 recetas únicas con sus imágenes.",
      });
    } catch (error) {
      toast({
        title: "Error al generar recetas",
        description: "Hubo un problema generando las recetas. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const getCategoryStats = () => {
    const categories = ['desayuno', 'comida', 'cena', 'snack', 'aperitivo', 'merienda'];
    return categories.map(category => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      count: getRecipesByCategory(category).length,
      target: category === 'desayuno' || category === 'comida' || category === 'cena' ? 10 : 3
    }));
  };

  const totalRecipes = recipes.length;
  const targetRecipes = 39;
  const isComplete = totalRecipes >= targetRecipes;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Banco de Recetas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Estado: {totalRecipes}/{targetRecipes} recetas
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((totalRecipes / targetRecipes) * 100, 100)}%` }}
                />
              </div>
            </div>
            <Badge variant={isComplete ? "default" : "secondary"}>
              {isComplete ? "Completo" : "Incompleto"}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={() => handleGenerateBank()}
                disabled={isGenerating || isLoading}
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <ChefHat className="mr-2 h-4 w-4" />
                    Generar Todo
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={loadRecipes}
                disabled={isLoading}
                size="sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </Button>

              <Button 
                variant="ghost" 
                onClick={() => setShowDetails(!showDetails)}
                size="sm"
              >
                {showDetails ? 'Ocultar' : 'Ver'} Detalles
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={() => handleGenerateBank('desayuno')}
                disabled={isGenerating || isLoading}
                size="sm"
                variant="secondary"
              >
                Generar Desayunos
              </Button>
              <Button 
                onClick={() => handleGenerateBank('comida')}
                disabled={isGenerating || isLoading}
                size="sm"
                variant="secondary"
              >
                Generar Almuerzos
              </Button>
              <Button 
                onClick={() => handleGenerateBank('cena')}
                disabled={isGenerating || isLoading}
                size="sm"
                variant="secondary"
              >
                Generar Cenas
              </Button>
              <Button 
                onClick={() => handleGenerateBank('snack')}
                disabled={isGenerating || isLoading}
                size="sm"
                variant="secondary"
              >
                Generar Snacks
              </Button>
              <Button 
                onClick={() => handleGenerateBank('aperitivo')}
                disabled={isGenerating || isLoading}
                size="sm"
                variant="secondary"
              >
                Generar Aperitivos
              </Button>
              <Button 
                onClick={() => handleGenerateBank('merienda')}
                disabled={isGenerating || isLoading}
                size="sm"
                variant="secondary"
              >
                Generar Meriendas
              </Button>
            </div>
          </div>

          {showDetails && (
            <div className="mt-4 space-y-3">
              <h4 className="font-medium">Recetas por categoría:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {getCategoryStats().map(stat => (
                  <div key={stat.name} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm font-medium">{stat.name}</span>
                    <Badge variant={stat.count >= stat.target ? "default" : "secondary"}>
                      {stat.count}/{stat.target}
                    </Badge>
                  </div>
                ))}
              </div>
              
              {recipes.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Recetas almacenadas ({recipes.length}):</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {recipes.map((recipe, index) => (
                      <div key={recipe.id} className="flex items-center gap-3 p-2 bg-background border rounded text-sm">
                        <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium">{recipe.title}</div>
                          <div className="text-muted-foreground text-xs">
                            {recipe.category} • {recipe.calories} cal • {recipe.time} min
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {recipe.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isGenerating && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generando recetas con OpenAI...</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Este proceso puede tomar varios minutos. Se están creando 39 recetas únicas con imágenes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};