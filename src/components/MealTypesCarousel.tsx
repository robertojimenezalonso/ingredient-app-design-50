import { ScrollArea } from '@/components/ui/scroll-area';

interface MealType {
  id: string;
  name: string;
  image: string;
}

interface MealTypesCarouselProps {
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
}

const mealTypes: MealType[] = [
  { id: 'supermarket', name: 'Supermercado', image: '/lovable-uploads/94cb6ab6-c51b-4e8e-abd6-99be9c687723.png' },
  { id: 'breakfast', name: 'Desayuno', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop' },
  { id: 'appetizer', name: 'Aperitivo', image: 'https://images.unsplash.com/photo-1544025162-d76694265947' },
  { id: 'lunch', name: 'Comida', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445' },
  { id: 'snacks', name: 'Snack', image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729' },
  { id: 'dinner', name: 'Cena', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d' },
  { id: 'desserts', name: 'Postre', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307' },
];

export const MealTypesCarousel = ({ selectedTypes, onTypeToggle }: MealTypesCarouselProps) => {
  return (
    <div className="mb-4 mt-4">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 pb-2 pl-4 min-w-max">
          {mealTypes.map((type, index) => (
            <div
              key={type.id}
              onClick={() => onTypeToggle(type.id)}
              className="flex-none cursor-pointer transition-all flex flex-col items-center"
            >
              <div className={`w-16 h-16 rounded-full overflow-hidden mb-2 transition-all flex items-center justify-center ${
                index === mealTypes.length - 1 ? 'mr-4' : ''
              }`}>
                <img 
                  src={type.image} 
                  alt={type.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className={`text-xs text-center font-medium transition-colors ${
                selectedTypes.includes(type.id) ? 'text-primary' : 'text-foreground'
              }`}>{type.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};