import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Recipe } from '@/types/recipe';
import { Card, CardContent } from './ui/card';

interface MacroDonutChartProps {
  recipes: Recipe[];
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
    <div>
      <div className="flex items-center justify-between px-1 mt-3 mb-1">
        <h2 className="text-lg font-semibold text-foreground">Tu plan de recetas</h2>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/4d196b4e-7430-45d5-9ea8-3c41447ec14c.png" 
              alt="Anterior" 
              className="h-7 w-7 cursor-pointer"
            />
            <img 
              src="/lovable-uploads/d3ec2ee8-42f5-4273-a17c-c7f05147048d.png" 
              alt="Siguiente" 
              className="h-7 w-7 cursor-pointer"
            />
          </div>
          <span className="text-sm font-medium text-foreground">Generar</span>
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