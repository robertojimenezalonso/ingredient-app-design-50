import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Recipe } from '@/types/recipe';
import { Card, CardContent } from './ui/card';

interface MacroDonutChartProps {
  recipes: Recipe[];
}

const MACRO_COLORS = {
  protein: '#FF6B6B',
  carbs: '#4ECDC4', 
  fat: '#45B7D1'
};

const MACRO_ICONS = {
  protein: '🥩',
  carbs: '🍞',
  fat: '🥑'
};

const MACRO_LABELS = {
  protein: 'Proteínas',
  carbs: 'Carbohidratos',
  fat: 'Grasas'
};

export const MacroDonutChart = ({ recipes }: MacroDonutChartProps) => {
  // Calcular totales de macros
  const totals = recipes.reduce((acc, recipe) => {
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

  return (
    <Card className="mb-4 mx-4">
      <CardContent className="p-4">
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
                  <span className="text-base">
                    {macro.name === 'Proteínas' ? MACRO_ICONS.protein : 
                     macro.name === 'Carbohidratos' ? MACRO_ICONS.carbs : 
                     MACRO_ICONS.fat}
                  </span>
                  <span className="text-sm text-muted-foreground">{macro.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: macro.color }}
                  />
                  <span className="text-sm font-medium">{macro.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};