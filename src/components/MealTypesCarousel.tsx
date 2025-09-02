import { useState } from 'react';

interface MealType {
  id: string;
  name: string;
  image: string;
}

const mealTypes: MealType[] = [
  {
    id: 'breakfast',
    name: 'Desayuno',
    image: '/lovable-uploads/190fc1f3-4981-4c81-baa7-bef57932b8e5.png'
  },
  {
    id: 'appetizer',
    name: 'Aperitivo',
    image: '/lovable-uploads/1a119c40-7aac-4ada-b1c9-1a0c5f3492fd.png'
  },
  {
    id: 'snacks',
    name: 'Snack',
    image: '/lovable-uploads/26934026-f2f8-4901-a7ba-e4e0c8ac36e1.png'
  },
  {
    id: 'lunch',
    name: 'Comida',
    image: '/lovable-uploads/2f62f477-2662-4cc5-adcc-6ddfaa085c50.png'
  },
  {
    id: 'dinner',
    name: 'Cena',
    image: '/lovable-uploads/4d196b4e-7430-45d5-9ea8-3c41447ec14c.png'
  }
];

interface MealTypesCarouselProps {
  selectedMealType: string | null;
  onMealTypeSelect: (mealType: string | null) => void;
}

export const MealTypesCarousel = ({ selectedMealType, onMealTypeSelect }: MealTypesCarouselProps) => {
  return (
    <div className="px-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Tipos de comidas</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {mealTypes.map((mealType) => (
          <button
            key={mealType.id}
            onClick={() => onMealTypeSelect(selectedMealType === mealType.id ? null : mealType.id)}
            className={`flex flex-col items-center gap-2 flex-shrink-0 p-2 rounded-xl transition-all ${
              selectedMealType === mealType.id 
                ? 'bg-primary/10 transform scale-105' 
                : 'hover:bg-muted/50'
            }`}
          >
            <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-colors ${
              selectedMealType === mealType.id 
                ? 'border-primary' 
                : 'border-muted'
            }`}>
              <img 
                src={mealType.image} 
                alt={mealType.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className={`text-sm font-medium ${
              selectedMealType === mealType.id 
                ? 'text-primary' 
                : 'text-foreground'
            }`}>
              {mealType.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};