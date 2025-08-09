import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Recipe } from '@/types/recipe';
import { Card, CardContent } from './ui/card';
import { useState, useEffect } from 'react';
import { List } from 'lucide-react';

interface MacroDonutChartProps {
  recipes: Recipe[];
  shouldAnimate?: boolean;
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

export const MacroDonutChart = ({ recipes, shouldAnimate = false, onRecipesChange, onNavigationDataChange }: MacroDonutChartProps) => {
  const [planHistory, setPlanHistory] = useState<Recipe[][]>([recipes]);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  const currentRecipes = planHistory[currentPlanIndex] || recipes;

  const generateExampleRecipes = (): Recipe[] => {
    const exampleRecipes: Recipe[] = [
      {
        id: `gen-${Date.now()}-1-breakfast`,
        title: 'Tostadas de aguacate y huevo',
        image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
        calories: 380,
        time: 15,
        category: 'breakfast',
        servings: 2,
        macros: { protein: 22, carbs: 35, fat: 18 },
        ingredients: [
          { id: 'bread', name: 'Pan integral', amount: '4', unit: 'rebanadas', selected: true },
          { id: 'avocado', name: 'Aguacate', amount: '2', unit: 'unidades', selected: true },
          { id: 'eggs', name: 'Huevos', amount: '2', unit: 'unidades', selected: true },
          { id: 'tomato', name: 'Tomate cherry', amount: '100', unit: 'g', selected: true }
        ],
        instructions: ['Tostar el pan', 'Machacar el aguacate', 'Freír los huevos', 'Montar las tostadas'],
        nutrition: { calories: 380, protein: 22, carbs: 35, fat: 18, fiber: 8, sugar: 6 }
      },
      {
        id: `gen-${Date.now()}-2-lunch`,
        title: 'Pollo mediterráneo con quinoa',
        image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400',
        calories: 420,
        time: 30,
        category: 'lunch',
        servings: 2,
        macros: { protein: 38, carbs: 28, fat: 15 },
        ingredients: [
          { id: 'chicken', name: 'Pechuga de pollo', amount: '300', unit: 'g', selected: true },
          { id: 'quinoa', name: 'Quinoa', amount: '150', unit: 'g', selected: true },
          { id: 'zucchini', name: 'Calabacín', amount: '1', unit: 'unidad', selected: true },
          { id: 'olives', name: 'Aceitunas', amount: '50', unit: 'g', selected: true }
        ],
        instructions: ['Cocinar la quinoa', 'Saltear el pollo', 'Agregar verduras', 'Mezclar todo'],
        nutrition: { calories: 420, protein: 38, carbs: 28, fat: 15, fiber: 6, sugar: 4 }
      },
      {
        id: `gen-${Date.now()}-3-dinner`,
        title: 'Salmón al horno con espárragos',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
        calories: 350,
        time: 25,
        category: 'dinner',
        servings: 2,
        macros: { protein: 32, carbs: 12, fat: 22 },
        ingredients: [
          { id: 'salmon', name: 'Salmón', amount: '250', unit: 'g', selected: true },
          { id: 'asparagus', name: 'Espárragos', amount: '200', unit: 'g', selected: true },
          { id: 'lemon', name: 'Limón', amount: '1', unit: 'unidad', selected: true },
          { id: 'garlic', name: 'Ajo', amount: '2', unit: 'dientes', selected: true }
        ],
        instructions: ['Precalentar horno', 'Preparar salmón', 'Hornear con espárragos', 'Servir con limón'],
        nutrition: { calories: 350, protein: 32, carbs: 12, fat: 22, fiber: 4, sugar: 3 }
      },
      {
        id: `gen-${Date.now()}-4-snack`,
        title: 'Smoothie bowl de frutos rojos',
        image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400',
        calories: 280,
        time: 10,
        category: 'snacks',
        servings: 2,
        macros: { protein: 15, carbs: 42, fat: 8 },
        ingredients: [
          { id: 'berries', name: 'Frutos rojos', amount: '200', unit: 'g', selected: true },
          { id: 'yogurt', name: 'Yogur griego', amount: '150', unit: 'g', selected: true },
          { id: 'granola', name: 'Granola', amount: '50', unit: 'g', selected: true },
          { id: 'honey', name: 'Miel', amount: '1', unit: 'cucharada', selected: true }
        ],
        instructions: ['Mezclar yogur y frutos', 'Servir en bowl', 'Agregar granola', 'Decorar con miel'],
        nutrition: { calories: 280, protein: 15, carbs: 42, fat: 8, fiber: 6, sugar: 25 }
      }
    ];
    
    const variation = Math.random() * 10 + 5;
    const timeVariation = Math.floor(Math.random() * 10) - 5;
    
    return exampleRecipes.map(recipe => ({
      ...recipe,
      id: `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${recipe.category}`,
      time: Math.max(5, recipe.time + timeVariation),
      calories: Math.round(recipe.calories + (Math.random() - 0.5) * 50),
      macros: {
        protein: Math.round(Math.max(10, recipe.macros.protein + (Math.random() - 0.5) * variation)),
        carbs: Math.round(Math.max(10, recipe.macros.carbs + (Math.random() - 0.5) * variation)),
        fat: Math.round(Math.max(5, recipe.macros.fat + (Math.random() - 0.5) * variation))
      },
      ingredients: recipe.ingredients.map(ing => ({
        ...ing,
        id: `${ing.id}-${Math.random().toString(36).substr(2, 5)}`
      }))
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
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

  // Animación de carga del pie chart suave
  useEffect(() => {
    setAnimationProgress(0);
    const duration = 1200; // Duración en milisegundos
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Función de easing para suavizar la animación
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setAnimationProgress(easeOutQuart * 360);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [currentRecipes]);

  return (
    <div>
      <h2 className="text-xl font-medium text-foreground px-1 mt-3 mb-4">Tu plan para comer saludable</h2>
      <Card className="mb-3 -mt-1">
        <CardContent className="p-3 cursor-pointer" onClick={() => window.location.href = '/daily-summary'}>
          <div className="flex items-center gap-6 relative">
            <div className="absolute top-0 right-0">
              <List className="h-5 w-5 text-muted-foreground" />
            </div>
            {/* Pie Chart a la izquierda */}
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
                    startAngle={90}
                    endAngle={90 + animationProgress}
                    isAnimationActive={true}
                    style={{ pointerEvents: 'none' }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Indicadores a la derecha */}
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
                    <span className="text-sm font-normal">{macro.percentage}%</span>
                    <span className="text-sm text-muted-foreground font-normal">{macro.name}</span>
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