import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/types/recipe';

interface FloatingPlanSummaryProps {
  dayRecipes: Recipe[];
  selectedDate: Date;
  onPersonsChange?: (persons: number) => void;
  onSavePlan?: () => void;
  onChangePlan?: () => void;
  onNavigatePlan?: (direction: 'prev' | 'next') => void;
}

export const FloatingPlanSummary = ({
  dayRecipes,
  selectedDate,
  onPersonsChange,
  onSavePlan,
  onChangePlan,
  onNavigatePlan
}: FloatingPlanSummaryProps) => {
  const [persons, setPersons] = useState(2);

  // Calculate totals
  const totals = dayRecipes.reduce(
    (acc, recipe) => {
      acc.calories += recipe.calories || 0;
      acc.protein += recipe.macros?.protein || 0;
      acc.carbs += recipe.macros?.carbs || 0;
      acc.fat += recipe.macros?.fat || 0;
      acc.price += 8.50; // Precio estimado por receta
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, price: 0 }
  );

  // Calculate totals for multiple persons (only price changes)
  const totalPrice = totals.price * persons;

  // Check if healthy goal is met (example criteria)
  const isHealthyGoal = totals.calories <= 2000 && totals.protein >= 100;

  const handlePersonsChange = (delta: number) => {
    const newPersons = Math.max(1, persons + delta);
    setPersons(newPersons);
    onPersonsChange?.(newPersons);
  };

  const formatPrice = (price: number) => `${price.toFixed(2)}€`;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40">
      <div className="bg-card border border-border rounded-xl shadow-lg p-4 space-y-3">
        
        {/* First line: Mercadona + Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="text-sm font-medium">Mercadona</span>
          </div>
          <div className="text-lg font-bold text-primary">
            {formatPrice(totalPrice)}
          </div>
        </div>

        {/* Second line: Goal */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Objetivo: Saludable</span>
          {isHealthyGoal && (
            <Check className="w-4 h-4 text-green-500" />
          )}
        </div>

        {/* Third line: All macros in one line */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{Math.round(totals.calories)} kcal</span>
          <span>P {Math.round(totals.protein)}g</span>
          <span>H {Math.round(totals.carbs)}g</span>
          <span>G {Math.round(totals.fat)}g</span>
        </div>

        {/* Fourth line: For X persons (small text) */}
        <div className="text-xs text-muted-foreground">
          Para {persons} {persons === 1 ? 'persona' : 'personas'}
        </div>

        {/* Fifth line: Navigation and Actions */}
        <div className="flex items-center justify-between pt-2">
          {/* Plan Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigatePlan?.('prev')}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigatePlan?.('next')}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Change Plan */}
            <button
              onClick={onChangePlan}
              className="text-sm text-muted-foreground underline hover:text-foreground"
            >
              Cambiar
            </button>

            {/* Save Button */}
            <Button
              onClick={onSavePlan}
              size="sm"
              className="px-4"
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};