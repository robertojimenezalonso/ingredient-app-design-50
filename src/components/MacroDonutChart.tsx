import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Recipe } from '@/types/recipe';
import { Card, CardContent } from './ui/card';
import { useState, useEffect } from 'react';

interface MacroDonutChartProps {
  recipes: Recipe[];
  onRecipesChange?: (recipes: Recipe[]) => void;
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

export const MacroDonutChart = ({ recipes, onRecipesChange }: MacroDonutChartProps) => {
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
        image: '/lovable-uploads/e959efca-f3da-43ea-96a2-ac6b262be062.png',
        calories: 350,
        time: 25,
        category: 'Cena',
        servings: 2,
        macros: { protein: 35, carbs: 15, fat: 20 },
        ingredients: [],
        instructions: [],
        nutrition: { calories: 350, protein: 35, carbs: 15, fat: 20, fiber: 5, sugar: 8 }
      },
      {
        id: `gen-${Date.now()}-2`,
        title: 'Ensalada de quinoa mediterránea',
        image: '/lovable-uploads/aaa38274-3981-4f1b-976f-6cc68b738160.png',
        calories: 280,
        time: 15,
        category: 'Almuerzo',
        servings: 2,
        macros: { protein: 12, carbs: 45, fat: 8 },
        ingredients: [],
        instructions: [],
        nutrition: { calories: 280, protein: 12, carbs: 45, fat: 8, fiber: 7, sugar: 6 }
      },
      {
        id: `gen-${Date.now()}-3`,
        title: 'Pollo al curry con arroz integral',
        image: '/lovable-uploads/62545d3b-2a8b-4a13-a64c-d485492f24c1.png',
        calories: 420,
        time: 40,
        category: 'Cena',
        servings: 2,
        macros: { protein: 28, carbs: 35, fat: 12 },
        ingredients: [],
        instructions: [],
        nutrition: { calories: 420, protein: 28, carbs: 35, fat: 12, fiber: 4, sugar: 5 }
      }
    ];
    
    // Variar un poco los macros para cada generación
    const variation = Math.random() * 10 + 5;
    return exampleRecipes.map(recipe => ({
      ...recipe,
      macros: {
        protein: Math.max(10, recipe.macros.protein + (Math.random() - 0.5) * variation),
        carbs: Math.max(10, recipe.macros.carbs + (Math.random() - 0.5) * variation),
        fat: Math.max(5, recipe.macros.fat + (Math.random() - 0.5) * variation)
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

  return (
    <div>
      <div className="flex items-center justify-between px-1 mt-3 mb-1">
        <h2 className="text-lg font-semibold text-foreground">Tu plan de recetas</h2>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/4d196b4e-7430-45d5-9ea8-3c41447ec14c.png" 
              alt="Anterior" 
              className={`h-7 w-7 cursor-pointer transition-opacity ${
                canGoPrevious ? 'opacity-100 hover:opacity-80' : 'opacity-30 cursor-not-allowed'
              }`}
              onClick={canGoPrevious ? handlePrevious : undefined}
            />
            <img 
              src="/lovable-uploads/d3ec2ee8-42f5-4273-a17c-c7f05147048d.png" 
              alt="Siguiente" 
              className={`h-7 w-7 cursor-pointer transition-opacity ${
                canGoNext ? 'opacity-100 hover:opacity-80' : 'opacity-30 cursor-not-allowed'
              }`}
              onClick={canGoNext ? handleNext : undefined}
            />
          </div>
          <span 
            className={`text-sm font-medium cursor-pointer transition-colors ${
              isGenerating 
                ? 'text-muted-foreground cursor-not-allowed' 
                : 'text-foreground hover:text-primary'
            }`}
            onClick={!isGenerating ? handleGenerate : undefined}
          >
            {isGenerating ? 'Generando...' : 'Generar'}
          </span>
        </div>
      </div>
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