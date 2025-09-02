import { ScrollArea } from '@/components/ui/scroll-area';

interface Diet {
  id: string;
  name: string;
  image: string;
}

interface DietsCarouselProps {
  selectedDiet: string;
  onDietChange: (diet: string) => void;
}

const diets: Diet[] = [
  { id: 'all', name: 'Todas las dietas', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061' },
  { id: 'mediterranean', name: 'Mediterránea', image: 'https://images.unsplash.com/photo-1515516969-d4008cc6241a' },
  { id: 'vegetarian', name: 'Vegetariana', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd' },
  { id: 'vegan', name: 'Vegana', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999' },
  { id: 'keto', name: 'Keto', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352' },
  { id: 'paleo', name: 'Paleo', image: 'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0' },
];

export const DietsCarousel = ({ selectedDiet, onDietChange }: DietsCarouselProps) => {
  return (
    <div className="px-4 mb-6">
      <h3 className="text-lg font-semibold mb-3">Tipos de dieta</h3>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-2">
          {diets.map((diet) => (
            <div
              key={diet.id}
              onClick={() => onDietChange(diet.id)}
              className={`flex-none cursor-pointer transition-all ${
                selectedDiet === diet.id ? 'opacity-100' : 'opacity-70'
              }`}
            >
              <div className={`w-32 h-20 rounded-xl overflow-hidden mb-2 ring-2 transition-all ${
                selectedDiet === diet.id ? 'ring-primary' : 'ring-transparent'
              }`}>
                <img 
                  src={diet.image} 
                  alt={diet.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-center font-medium max-w-[128px] truncate">{diet.name}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};