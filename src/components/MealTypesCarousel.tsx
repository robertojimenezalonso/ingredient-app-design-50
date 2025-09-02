import { ScrollArea } from '@/components/ui/scroll-area';

interface MealType {
  id: string;
  name: string;
  image: string;
}

interface MealTypesCarouselProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const mealTypes: MealType[] = [
  { id: 'all', name: 'Todo', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b' },
  { id: 'breakfast', name: 'Desayuno', image: 'https://images.unsplash.com/photo-1525351326368-efbb5cb6e397' },
  { id: 'appetizer', name: 'Aperitivo', image: 'https://images.unsplash.com/photo-1544025162-d76694265947' },
  { id: 'lunch', name: 'Comida', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445' },
  { id: 'snacks', name: 'Snack', image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729' },
  { id: 'dinner', name: 'Cena', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d' },
  { id: 'desserts', name: 'Postre', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307' },
];

export const MealTypesCarousel = ({ selectedType, onTypeChange }: MealTypesCarouselProps) => {
  return (
    <div className="px-4 mb-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-2">
          {mealTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => onTypeChange(type.id)}
              className={`flex-none cursor-pointer transition-all ${
                selectedType === type.id ? 'opacity-100' : 'opacity-70'
              }`}
            >
              <div className={`w-16 h-16 rounded-full overflow-hidden mb-2 ring-2 transition-all ${
                selectedType === type.id ? 'ring-primary' : 'ring-transparent'
              }`}>
                <img 
                  src={type.image} 
                  alt={type.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-center font-medium">{type.name}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};