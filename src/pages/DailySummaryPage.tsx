import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Recipe } from '@/types/recipe';
import { useUserConfig } from '@/contexts/UserConfigContext';

const MACRO_COLORS = {
  protein: '#DE6968',
  carbs: '#DE9A69', 
  fat: '#6998DD'
};

export const DailySummaryPage = () => {
  const navigate = useNavigate();
  const { config } = useUserConfig();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  useEffect(() => {
    const savedRecipes = localStorage.getItem('daily-recipes');
    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes));
    }

    // Get dates from the past 7 days
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    setSelectedDates(dates);
  }, []);

  // Agrupar recetas por fecha
  const recipesByDate = selectedDates.reduce((acc, date) => {
    const dateStr = date.toISOString().split('T')[0];
    acc[dateStr] = recipes.filter(recipe => {
      const savedDate = localStorage.getItem(`recipe-${recipe.id}-date`);
      return savedDate === dateStr;
    });
    return acc;
  }, {} as Record<string, Recipe[]>);

  // Calcular totales por día
  const getDayTotals = (dayRecipes: Recipe[]) => {
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

  const handleAddRecipe = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    localStorage.setItem('selected-date-for-recipe', dateStr);
    navigate('/');
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
          <h1 className="text-lg font-semibold">Resumen diario</h1>
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

        {/* Resumen por días */}
        {selectedDates.map((date) => {
          const dateStr = date.toISOString().split('T')[0];
          const dayRecipes = recipesByDate[dateStr] || [];
          const dayTotals = getDayTotals(dayRecipes);

          return (
            <Card key={dateStr}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg capitalize">
                    {formatDate(date)}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddRecipe(date)}
                    className="h-8 px-3"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Añadir
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {dayRecipes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No hay recetas para este día
                  </p>
                ) : (
                  <>
                    {/* Lista de recetas */}
                    <div className="space-y-2">
                      {dayRecipes.map((recipe) => (
                        <div 
                          key={recipe.id}
                          className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                          onClick={() => navigate(`/recipe/${recipe.id}`)}
                        >
                          <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{recipe.title}</h4>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {recipe.calories} cal
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {recipe.time} min
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <div>P: {recipe.macros.protein}g</div>
                            <div>C: {recipe.macros.carbs}g</div>
                            <div>G: {recipe.macros.fat}g</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totales del día */}
                    <div className="border-t pt-3">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold">{dayTotals.calories}</div>
                          <div className="text-xs text-muted-foreground">Calorías</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-[#DE6968]">{dayTotals.protein}g</div>
                          <div className="text-xs text-muted-foreground">Proteínas</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-[#DE9A69]">{dayTotals.carbs}g</div>
                          <div className="text-xs text-muted-foreground">Carbohidratos</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-[#6998DD]">{dayTotals.fat}g</div>
                          <div className="text-xs text-muted-foreground">Grasas</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};