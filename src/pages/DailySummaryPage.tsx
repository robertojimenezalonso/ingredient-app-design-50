import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Recipe } from '@/types/recipe';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useRecipeBank } from '@/hooks/useRecipeBank';
import { DayMealSelector } from '@/components/DayMealSelector';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MACRO_COLORS = {
  protein: '#DE6968',
  carbs: '#DE9A69', 
  fat: '#6998DD'
};

export const DailySummaryPage = () => {
  const navigate = useNavigate();
  const { config } = useUserConfig();
  const { getRecipesForPlan } = useRecipeBank();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Obtener el plan de recetas usando las fechas y comidas seleccionadas
  const recipePlan = useMemo(() => {
    if (!config.selectedDates || !config.selectedMeals) {
      return {};
    }
    return getRecipesForPlan(config.selectedDates, config.selectedMeals, config.servingsPerRecipe || 1);
  }, [config.selectedDates, config.selectedMeals, config.servingsPerRecipe, getRecipesForPlan]);

  // Convertir el plan a formato de recetas agrupadas por fecha
  const recipesByDate = useMemo(() => {
    const result: Record<string, (Recipe & { mealType: string })[]> = {};
    
    Object.entries(recipePlan).forEach(([dateStr, dayMeals]) => {
      result[dateStr] = [];
      Object.entries(dayMeals).forEach(([meal, recipes]) => {
        recipes.forEach(recipe => {
          result[dateStr].push({
            ...recipe,
            mealType: meal
          });
        });
      });
    });
    
    return result;
  }, [recipePlan]);

  // Extraer todas las recetas para los cálculos generales
  const recipes = useMemo(() => {
    return Object.values(recipesByDate).flat();
  }, [recipesByDate]);

  // Calcular totales por día
  const getDayTotals = (dayRecipes: (Recipe & { mealType: string })[]) => {
    return dayRecipes.reduce((acc, recipe) => {
      acc.calories += recipe.calories;
      acc.protein += recipe.macros.protein;
      acc.carbs += recipe.macros.carbs;
      acc.fat += recipe.macros.fat;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  // Calcular totales generales
  const allTotals = recipes.reduce((acc, recipe) => {
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const getObjectiveText = () => {
    return `Con estas recetas estás cumpliendo tu objetivo de perder peso`;
  };

  const handleToggleDay = (dateStr: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr);
      } else {
        newSet.add(dateStr);
      }
      return newSet;
    });
  };

  const handleAddRecipe = (date: Date) => {
    // Navegar a /milista donde puede añadir recetas
    navigate('/milista');
  };

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
          <h1 className="text-lg font-semibold">Tabla de recetas</h1>
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

        {/* Tabla estilo Excel */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Receta</th>
                    <th className="text-center p-3 font-medium">kcal</th>
                    <th className="text-center p-3 font-medium">Prot</th>
                    <th className="text-center p-3 font-medium">Carb</th>
                    <th className="text-center p-3 font-medium">Gras</th>
                  </tr>
                </thead>
                <tbody>
                  {config.selectedDates?.map((dateStr, dateIndex) => {
                    const date = new Date(dateStr + 'T12:00:00');
                    const dayRecipes = recipesByDate[dateStr] || [];
                    const dayTotals = getDayTotals(dayRecipes);
                    const formattedDate = formatDate(date);

                    return (
                      <React.Fragment key={dateStr}>
                        {/* Fila de encabezado del día con funcionalidad de /milista */}
                        <tr className="bg-[#F6F6F6] border-b">
                          <td colSpan={5} className="p-0 sticky left-0 right-0">
                            <div 
                              className="flex items-center justify-between p-4 cursor-pointer w-screen max-w-full"
                              style={{ width: '100vw', maxWidth: 'calc(100vw - 2rem)' }}
                              onClick={() => handleToggleDay(dateStr)}
                            >
                              <h3 className="text-sm text-black capitalize font-semibold underline underline-offset-4">
                                {format(date, "eee. d", { locale: es }).toLowerCase()}
                              </h3>
                              <button 
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleDay(dateStr);
                                }}
                              >
                                {expandedDays.has(dateStr) ? <Minus size={20} /> : <Plus size={20} />}
                              </button>
                            </div>
                            
                            {expandedDays.has(dateStr) && (
                              <div 
                                className="px-4 pb-4 border-t border-gray-300"
                                style={{ width: '100vw', maxWidth: 'calc(100vw - 2rem)' }}
                              >
                                <DayMealSelector
                                  dateStr={dateStr}
                                  currentMeals={config.selectedMeals || []}
                                  onMealsChange={() => {}} // Por ahora vacío
                                  onShowDeleteConfirmation={() => {}} // Por ahora vacío
                                  currentRecipes={{}}
                                />
                              </div>
                            )}
                          </td>
                        </tr>

                        {/* Recetas del día */}
                        {dayRecipes.length === 0 ? (
                          <tr className="border-b hover:bg-muted/25">
                            <td className="p-3 text-muted-foreground text-center" colSpan={5}>
                              No hay recetas para este día
                            </td>
                          </tr>
                        ) : (
                          dayRecipes.map((recipe, recipeIndex) => (
                            <tr key={recipe.id} className="border-b hover:bg-muted/25">
                              <td className="p-3 max-w-[80px]">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={recipe.image}
                                    alt={recipe.title}
                                    className="w-10 h-10 rounded object-cover cursor-pointer flex-shrink-0"
                                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                                  />
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <span 
                                      className="cursor-pointer hover:text-primary hover:underline text-ellipsis overflow-hidden whitespace-nowrap block w-[80px]"
                                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                                      title={recipe.title}
                                    >
                                      {recipe.title}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {recipe.mealType}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center">{recipe.calories} kcal</td>
                              <td className="p-3 text-center text-[#DE6968]">{recipe.macros.protein}g</td>
                              <td className="p-3 text-center text-[#DE9A69]">{recipe.macros.carbs}g</td>
                              <td className="p-3 text-center text-[#6998DD]">{recipe.macros.fat}g</td>
                            </tr>
                          ))
                        )}

                        {/* Fila de totales del día */}
                        {dayRecipes.length > 0 && (
                          <tr className="border-b-2 border-primary/20 bg-muted/50">
                            <td className="p-3 font-semibold max-w-[80px]">Total por día por persona</td>
                            <td className="p-3 text-center font-semibold">{dayTotals.calories} kcal</td>
                            <td className="p-3 text-center font-semibold text-[#DE6968]">{dayTotals.protein}g</td>
                            <td className="p-3 text-center font-semibold text-[#DE9A69]">{dayTotals.carbs}g</td>
                            <td className="p-3 text-center font-semibold text-[#6998DD]">{dayTotals.fat}g</td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  }) || []}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
