import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Recipe } from '@/types/recipe';
import { Card, CardContent } from './ui/card';
import { useState, useEffect } from 'react';

interface MacroDonutChartProps {
  recipes: Recipe[];
  onRecipesChange?: (recipes: Recipe[]) => void;
  onNavigationDataChange?: (data: {
    canGoPrevious: boolean;
    canGoNext: boolean;
    isGenerating: boolean;
    handlePrevious: () => void;
    handleNext: () => void;
    handleGenerate: () => void;
  }) => void;
}

const MACRO_COLORS = {
  protein: '#DE6968',
  carbs: '#DE9A69', 
  fat: '#6998DD'
};

const MACRO_ICONS = {
  protein: '/lovable-uploads/967d027e-2a1d-40b3-b300-c73dbb88963a.png',
  carbs: '/lovable-uploads/26934026-f2f8-4901-a7ba-e4e0c8ac36e1.png',
  fat: '/lovable-uploads/7f516dd8-5753-49bd-9b5d-aa5c0bfeedd1.png'
};

const MACRO_LABELS = {
  protein: 'Proteínas',
  carbs: 'Carbohidratos',
  fat: 'Grasas'
};

export const MacroDonutChart = ({ recipes, onRecipesChange, onNavigationDataChange }: MacroDonutChartProps) => {
  const [planHistory, setPlanHistory] = useState<Recipe[][]>([recipes]);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentRecipes = planHistory[currentPlanIndex] || recipes;

  // Generar recetas de ejemplo para demostración
  const generateExampleRecipes = (): Recipe[] => {
    const exampleRecipes: Recipe[] = [
      {
        id: `gen-${Date.now()}-1`,
        title: 'Salmón a la plancha con verduras',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
        calories: 350,
        time: 25,
        category: 'dinner',
        servings: 2,
        macros: { protein: 35, carbs: 15, fat: 20 },
        ingredients: [],
        instructions: [],
        nutrition: { calories: 350, protein: 35, carbs: 15, fat: 20, fiber: 5, sugar: 8 }
      },
      {
        id: `gen-${Date.now()}-2`,
        title: 'Ensalada de quinoa mediterránea',
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
        calories: 280,
        time: 15,
        category: 'lunch',
        servings: 2,
        macros: { protein: 12, carbs: 45, fat: 8 },
        ingredients: [],
        instructions: [],
        nutrition: { calories: 280, protein: 12, carbs: 45, fat: 8, fiber: 7, sugar: 6 }
      },
      {
        id: `gen-${Date.now()}-3`,
        title: 'Avena con frutos rojos',
        image: 'https://images.unsplash.com/photo-1571197119282-621c1ece75ac?w=400',
        calories: 320,
        time: 10,
        category: 'breakfast',
        servings: 2,
        macros: { protein: 18, carbs: 42, fat: 10 },
        ingredients: [],
        instructions: [],
        nutrition: { calories: 320, protein: 18, carbs: 42, fat: 10, fiber: 6, sugar: 12 }
      }
    ];
    
    // Variar un poco los macros para cada generación
    const variation = Math.random() * 10 + 5;
    return exampleRecipes.map(recipe => ({
      ...recipe,
      macros: {
        protein: Math.round(Math.max(10, recipe.macros.protein + (Math.random() - 0.5) * variation)),
        carbs: Math.round(Math.max(10, recipe.macros.carbs + (Math.random() - 0.5) * variation)),
        fat: Math.round(Math.max(5, recipe.macros.fat + (Math.random() - 0.5) * variation))
      }
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simular tiempo de generación
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newRecipes = generateExampleRecipes();
    const newHistory = [...planHistory, newRecipes];
    setPlanHistory(newHistory);
    setCurrentPlanIndex(newHistory.length - 1);
    
    if (onRecipesChange) {
      onRecipesChange(newRecipes);
    }
    
    setIsGenerating(false);
  };

  const handlePrevious = () => {
    if (currentPlanIndex > 0) {
      const newIndex = currentPlanIndex - 1;
      setCurrentPlanIndex(newIndex);
      if (onRecipesChange) {
        onRecipesChange(planHistory[newIndex]);
      }
    }
  };

  const handleNext = () => {
    if (currentPlanIndex < planHistory.length - 1) {
      const newIndex = currentPlanIndex + 1;
      setCurrentPlanIndex(newIndex);
      if (onRecipesChange) {
        onRecipesChange(planHistory[newIndex]);
      }
    }
  };

  // Calcular totales de macros
  const totals = currentRecipes.reduce((acc, recipe) => {
    acc.protein += recipe.macros.protein;
    acc.carbs += recipe.macros.carbs;
    acc.fat += recipe.macros.fat;
    return acc;
  }, { protein: 0, carbs: 0, fat: 0 });

  const totalMacros = totals.protein + totals.carbs + totals.fat;

  if (totalMacros === 0) {
    return null;
  }

  // Preparar datos para el gráfico
  const chartData = [
    {
      name: 'Proteínas',
      value: totals.protein,
      color: MACRO_COLORS.protein,
      percentage: Math.round((totals.protein / totalMacros) * 100)
    },
    {
      name: 'Carbohidratos', 
      value: totals.carbs,
      color: MACRO_COLORS.carbs,
      percentage: Math.round((totals.carbs / totalMacros) * 100)
    },
    {
      name: 'Grasas',
      value: totals.fat,
      color: MACRO_COLORS.fat,
      percentage: Math.round((totals.fat / totalMacros) * 100)
    }
  ];

  const canGoPrevious = currentPlanIndex > 0;
  const canGoNext = currentPlanIndex < planHistory.length - 1;

  // Enviar los datos de navegación al CategoryCarousel
  useEffect(() => {
    if (onNavigationDataChange) {
      onNavigationDataChange({
        canGoPrevious,
        canGoNext,
        isGenerating,
        handlePrevious,
        handleNext,
        handleGenerate
      });
    }
  }, [canGoPrevious, canGoNext, isGenerating, onNavigationDataChange]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground px-1 mt-3 mb-1">Tu plan para comer saludable</h2>
      <Card className="mb-3">
      <CardContent className="p-3">
        <div className="flex items-center gap-6">
          {/* Gráfico de rosco a la izquierda */}
          <div className="w-24 h-24 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
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

          {/* Detalles a la derecha */}
          <div className="flex-1 space-y-2">
            {chartData.map((macro) => (
              <div key={macro.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img 
                    src={macro.name === 'Proteínas' ? MACRO_ICONS.protein : 
                         macro.name === 'Carbohidratos' ? MACRO_ICONS.carbs : 
                         MACRO_ICONS.fat}
                    alt={macro.name.toLowerCase()}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">{macro.percentage}%</span>
                  <span className="text-sm text-muted-foreground">{macro.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};