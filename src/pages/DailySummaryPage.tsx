
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Recipe } from '@/types/recipe';
import { useRecipeBank } from '@/hooks/useRecipeBank';

const MACRO_COLORS = {
  protein: '#DE6968',
  carbs: '#DE9A69', 
  fat: '#6998DD'
};

export const DailySummaryPage = () => {
  const navigate = useNavigate();
  const { getRandomRecipesByCategory, convertToRecipe, recipes: bankRecipes, isLoading } = useRecipeBank();
  const [expandedMealTypes, setExpandedMealTypes] = useState<Set<string>>(new Set(['cena'])); // Expandir 'cena' por defecto

  // Definir categorías fijas para asegurar que siempre se muestren
  const defaultCategories = ['desayuno', 'comida', 'cena', 'snack', 'aperitivo', 'merienda'];
  
  // Obtener las categorías disponibles, pero siempre usar las por defecto como base
  const availableCategories = useMemo(() => {
    if (bankRecipes.length === 0) {
      console.log('No hay recetas en bankRecipes, usando categorías por defecto');
      return defaultCategories;
    }
    
    const categoriesFromDB = [...new Set(bankRecipes.map(recipe => recipe.category))];
    console.log('Categorías encontradas en la BD:', categoriesFromDB);
    
    // Combinar categorías por defecto con las de la BD, priorizando las que tienen recetas
    const allCategories = [...new Set([...categoriesFromDB, ...defaultCategories])];
    console.log('Categorías finales:', allCategories);
    
    return allCategories;
  }, [bankRecipes]);
  
  // Obtener 3 recetas aleatorias por cada categoría disponible
  const recipesByMealType = useMemo(() => {
    console.log('Generando recetas por tipo de comida...');
    const result: Record<string, (Recipe & { mealType: string })[]> = {};
    
    availableCategories.forEach(category => {
      console.log(`Obteniendo recetas para categoría: ${category}`);
      const bankRecipes = getRandomRecipesByCategory(category, 3);
      console.log(`Recetas encontradas para ${category}:`, bankRecipes.length);
      
      result[category] = bankRecipes.map(bankRecipe => ({
        ...convertToRecipe(bankRecipe, 1),
        mealType: category
      }));
    });
    
    console.log('Resultado final recipesByMealType:', result);
    return result;
  }, [getRandomRecipesByCategory, convertToRecipe, availableCategories]);

  // Extraer todas las recetas para los cálculos generales
  const allRecipes = useMemo(() => {
    return Object.values(recipesByMealType).flat();
  }, [recipesByMealType]);

  // Debug: Log estado actual
  useEffect(() => {
    console.log('Estado actual:');
    console.log('- isLoading:', isLoading);
    console.log('- bankRecipes.length:', bankRecipes.length);
    console.log('- availableCategories:', availableCategories);
    console.log('- allRecipes.length:', allRecipes.length);
    console.log('- recipesByMealType:', recipesByMealType);
  }, [isLoading, bankRecipes.length, availableCategories, allRecipes.length, recipesByMealType]);

  // Calcular totales por tipo de comida
  const getMealTypeTotals = (mealRecipes: (Recipe & { mealType: string })[]) => {
    return mealRecipes.reduce((acc, recipe) => {
      acc.calories += recipe.calories;
      acc.protein += recipe.macros.protein;
      acc.carbs += recipe.macros.carbs;
      acc.fat += recipe.macros.fat;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  // Calcular totales generales
  const allTotals = allRecipes.reduce((acc, recipe) => {
    acc.protein += recipe.macros.protein;
    acc.carbs += recipe.macros.carbs;
    acc.fat += recipe.macros.fat;
    return acc;
  }, { protein: 0, carbs: 0, fat: 0 });

  const totalMacros = allTotals.protein + allTotals.carbs + allTotals.fat;

  const chartData = totalMacros > 0 ? [
    {
      name: 'Proteínas',
      value: allTotals.protein,
      color: MACRO_COLORS.protein,
      percentage: Math.round((allTotals.protein / totalMacros) * 100)
    },
    {
      name: 'Carbohidratos', 
      value: allTotals.carbs,
      color: MACRO_COLORS.carbs,
      percentage: Math.round((allTotals.carbs / totalMacros) * 100)
    },
    {
      name: 'Grasas',
      value: allTotals.fat,
      color: MACRO_COLORS.fat,
      percentage: Math.round((allTotals.fat / totalMacros) * 100)
    }
  ] : [];


  const getObjectiveText = () => {
    return `Explora nuestras recetas organizadas por tipo de comida`;
  };

  const handleToggleMealType = (mealType: string) => {
    setExpandedMealTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mealType)) {
        newSet.delete(mealType);
      } else {
        newSet.add(mealType);
      }
      return newSet;
    });
  };

  // Mostrar loading si está cargando
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Explorador de recetas</h1>
            <div className="w-9" />
          </div>
        </div>
        <div className="p-4">
          <p className="text-center text-muted-foreground">Cargando recetas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Explorador de recetas</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Solo el texto del objetivo */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              {getObjectiveText()}
            </p>
          </CardContent>
        </Card>

        {/* Debug info */}
        {availableCategories.length === 0 && (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-red-500 text-center">
                No hay categorías disponibles. Total recetas en BD: {bankRecipes.length}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tabla estilo Excel */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium w-40">Receta</th>
                    <th className="text-center p-3 font-medium w-28">kcal</th>
                    <th className="text-center p-3 font-medium w-16">Prot</th>
                    <th className="text-center p-3 font-medium w-16">Carb</th>
                    <th className="text-center p-3 font-medium w-16">Gras</th>
                  </tr>
                </thead>
                <tbody>
                  {availableCategories.map((mealType) => {
                    const mealRecipes = recipesByMealType[mealType] || [];
                    const mealTotals = getMealTypeTotals(mealRecipes);
                    
                    // Mapear los nombres de comidas al español
                    const mealTypeNames: Record<string, string> = {
                      'desayuno': 'Desayuno',
                      'comida': 'Comida', 
                      'cena': 'Cena',
                      'merienda': 'Merienda',
                      'snack': 'Snack',
                      'aperitivo': 'Aperitivo'
                    };

                    return (
                      <React.Fragment key={mealType}>
                        {/* Fila de encabezado del tipo de comida */}
                        <tr className="bg-[#F6F6F6] border-b">
                          <td colSpan={5} className="p-0 sticky left-0 right-0">
                            <div 
                              className="flex items-center justify-between p-4 cursor-pointer w-screen max-w-full"
                              style={{ width: '100vw', maxWidth: 'calc(100vw - 2rem)' }}
                              onClick={() => handleToggleMealType(mealType)}
                            >
                              <h3 className="text-sm text-black capitalize font-semibold underline underline-offset-4">
                                {mealTypeNames[mealType] || mealType} ({mealRecipes.length} recetas)
                              </h3>
                              <button 
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleMealType(mealType);
                                }}
                              >
                                {expandedMealTypes.has(mealType) ? <Minus size={20} /> : <Plus size={20} />}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Recetas del tipo de comida (mostrar solo si está expandido) */}
                        {expandedMealTypes.has(mealType) && (
                          <>
                            {mealRecipes.length > 0 ? (
                              mealRecipes.map((recipe, recipeIndex) => (
                                <tr key={recipe.id} className="border-b hover:bg-muted/25">
                                  <td className="p-3 w-40">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={recipe.image}
                                        alt={recipe.title}
                                        className="w-10 h-10 rounded object-cover cursor-pointer flex-shrink-0"
                                        onClick={() => navigate(`/recipe/${recipe.id}`)}
                                      />
                                      <div className="flex flex-col min-w-0 flex-1">
                                        <span 
                                          className="cursor-pointer hover:text-primary hover:underline text-ellipsis overflow-hidden whitespace-nowrap block w-[100px]"
                                          onClick={() => navigate(`/recipe/${recipe.id}`)}
                                          title={recipe.title}
                                        >
                                          {recipe.title}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {mealTypeNames[recipe.mealType] || recipe.mealType}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 text-center w-28">{recipe.calories} kcal</td>
                                  <td className="p-3 text-center text-[#DE6968] w-16">{recipe.macros.protein}g</td>
                                  <td className="p-3 text-center text-[#DE9A69] w-16">{recipe.macros.carbs}g</td>
                                  <td className="p-3 text-center text-[#6998DD] w-16">{recipe.macros.fat}g</td>
                                </tr>
                              ))
                            ) : (
                              <tr className="border-b">
                                <td colSpan={5} className="p-4 text-center text-muted-foreground text-sm">
                                  No hay recetas disponibles para {mealTypeNames[mealType] || mealType}
                                </td>
                              </tr>
                            )}

                            {/* Fila de totales del tipo de comida */}
                            {mealRecipes.length > 0 && (
                              <tr className="border-b-2 border-primary/20 bg-muted/50">
                                <td className="p-3 font-semibold">Total {mealTypeNames[mealType] || mealType}</td>
                                <td className="p-3 text-center font-semibold w-28">{mealTotals.calories} kcal</td>
                                <td className="p-3 text-center font-semibold text-[#DE6968] w-16">{mealTotals.protein}g</td>
                                <td className="p-3 text-center font-semibold text-[#DE9A69] w-16">{mealTotals.carbs}g</td>
                                <td className="p-3 text-center font-semibold text-[#6998DD] w-16">{mealTotals.fat}g</td>
                              </tr>
                            )}
                          </>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
