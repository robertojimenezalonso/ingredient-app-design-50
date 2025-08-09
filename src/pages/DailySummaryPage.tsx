import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Recipe } from '@/types/recipe';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useDateTabs } from '@/hooks/useDateTabs';
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
  const { mealPlan } = useDateTabs(); // Usar la misma lógica que /milista
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Extraer todas las recetas del meal plan
  const recipes = mealPlan.flatMap(dayPlan => 
    dayPlan.meals.map(meal => meal.recipe).filter(Boolean)
  );

  // Agrupar recetas por fecha usando el mismo formato que useDateTabs
  const recipesByDate = mealPlan.reduce((acc, dayPlan) => {
    acc[dayPlan.dateStr] = dayPlan.meals.map(meal => ({
      ...meal.recipe,
      mealType: meal.meal // Agregar el tipo de comida para mostrar en la tabla
    })).filter(Boolean);
    return acc;
  }, {} as Record<string, (Recipe & { mealType: string })[]>);

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
        {/* Gráfico y objetivo */}
        {chartData.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-6 mb-4">
                <div className="w-20 h-20 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1 space-y-1">
                  {chartData.map((macro) => (
                    <div key={macro.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: macro.color }}
                      />
                      <span className="text-sm">{macro.percentage}% {macro.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                {getObjectiveText()}
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
                    <th className="text-left p-3 font-medium">Comida</th>
                    <th className="text-left p-3 font-medium">Receta</th>
                    <th className="text-center p-3 font-medium">Cal</th>
                    <th className="text-center p-3 font-medium">Prot</th>
                    <th className="text-center p-3 font-medium">Carb</th>
                    <th className="text-center p-3 font-medium">Gras</th>
                  </tr>
                </thead>
                <tbody>
                  {mealPlan.map((dayPlan, dateIndex) => {
                    const dayRecipes = dayPlan.meals.map(meal => ({
                      ...meal.recipe,
                      mealType: meal.meal
                    })).filter(recipe => recipe.id); // Solo recetas válidas
                    
                    const dayTotals = getDayTotals(dayRecipes);
                    const formattedDate = formatDate(dayPlan.date);

                    return (
                      <React.Fragment key={dayPlan.dateStr}>
                        {/* Fila de encabezado del día con funcionalidad de /milista */}
                        <tr className="bg-[#F6F6F6] border-b">
                          <td colSpan={6} className="p-0">
                            <div 
                              className="flex items-center justify-between p-4 cursor-pointer"
                              onClick={() => handleToggleDay(dayPlan.dateStr)}
                            >
                              <h3 className="text-sm text-black capitalize font-semibold underline underline-offset-4">
                                {format(dayPlan.date, "eee. d", { locale: es }).toLowerCase()}
                              </h3>
                              <button 
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleDay(dayPlan.dateStr);
                                }}
                              >
                                {expandedDays.has(dayPlan.dateStr) ? <Minus size={20} /> : <Plus size={20} />}
                              </button>
                            </div>
                            
                            {expandedDays.has(dayPlan.dateStr) && (
                              <div className="px-4 pb-4 border-t border-gray-300">
                                <DayMealSelector
                                  dateStr={dayPlan.dateStr}
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
                            <td className="p-3 text-muted-foreground text-center" colSpan={6}>
                              No hay recetas para este día
                            </td>
                          </tr>
                        ) : (
                          dayRecipes.map((recipe, recipeIndex) => (
                            <tr key={recipe.id} className="border-b hover:bg-muted/25">
                              <td className="p-3">
                                <span className="text-sm font-medium capitalize">
                                  {recipe.mealType}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={recipe.image}
                                    alt={recipe.title}
                                    className="w-10 h-10 rounded object-cover cursor-pointer"
                                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                                  />
                                  <span 
                                    className="cursor-pointer hover:text-primary hover:underline"
                                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                                  >
                                    {recipe.title}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 text-center">{recipe.calories}</td>
                              <td className="p-3 text-center text-[#DE6968]">{recipe.macros.protein}g</td>
                              <td className="p-3 text-center text-[#DE9A69]">{recipe.macros.carbs}g</td>
                              <td className="p-3 text-center text-[#6998DD]">{recipe.macros.fat}g</td>
                            </tr>
                          ))
                        )}

                        {/* Fila de totales del día */}
                        {dayRecipes.length > 0 && (
                          <tr className="border-b-2 border-primary/20 bg-muted/50">
                            <td className="p-3 font-semibold">TOTAL DÍA</td>
                            <td className="p-3"></td>
                            <td className="p-3 text-center font-semibold">{dayTotals.calories}</td>
                            <td className="p-3 text-center font-semibold text-[#DE6968]">{dayTotals.protein}g</td>
                            <td className="p-3 text-center font-semibold text-[#DE9A69]">{dayTotals.carbs}g</td>
                            <td className="p-3 text-center font-semibold text-[#6998DD]">{dayTotals.fat}g</td>
                          </tr>
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