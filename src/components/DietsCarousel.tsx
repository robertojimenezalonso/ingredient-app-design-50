import { Card } from '@/components/ui/card';

interface DietType {
  id: string;
  name: string;
  image: string;
}

const dietTypes: DietType[] = [
  {
    id: 'mediterranean',
    name: 'Mediterránea',
    image: '/lovable-uploads/62545d3b-2a8b-4a13-a64c-d485492f24c1.png'
  },
  {
    id: 'vegetarian',
    name: 'Vegetariana',
    image: '/lovable-uploads/71eecaf2-ff51-47ff-beef-72570cb4f960.png'
  },
  {
    id: 'keto',
    name: 'Keto',
    image: '/lovable-uploads/7825fcc8-c2a8-4678-9edd-23e6a72bf209.png'
  },
  {
    id: 'vegan',
    name: 'Vegana',
    image: '/lovable-uploads/7f516dd8-5753-49bd-9b5d-aa5c0bfeedd1.png'
  },
  {
    id: 'paleo',
    name: 'Paleo',
    image: '/lovable-uploads/8530d68e-8316-44b0-8389-d319fd405949.png'
  }
];

interface DietsCarouselProps {
  selectedDiet: string | null;
  onDietSelect: (diet: string | null) => void;
}

export const DietsCarousel = ({ selectedDiet, onDietSelect }: DietsCarouselProps) => {
  return (
    <div className="px-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Tipos de dietas</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {dietTypes.map((diet) => (
          <Card 
            key={diet.id}
            onClick={() => onDietSelect(selectedDiet === diet.id ? null : diet.id)}
            className={`w-40 flex-shrink-0 overflow-hidden cursor-pointer transition-all ${
              selectedDiet === diet.id 
                ? 'ring-2 ring-primary transform scale-105' 
                : 'hover:shadow-md'
            }`}
          >
            <div className="relative">
              <img 
                src={diet.image} 
                alt={diet.name}
                className="w-full h-24 object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-end">
                <div className="p-3">
                  <h3 className={`font-semibold text-sm ${
                    selectedDiet === diet.id 
                      ? 'text-white' 
                      : 'text-white'
                  }`}>
                    {diet.name}
                  </h3>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};