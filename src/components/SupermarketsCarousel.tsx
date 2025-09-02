import { ScrollArea } from '@/components/ui/scroll-area';

interface Supermarket {
  id: string;
  name: string;
  logo: string;
  color: string;
  bgColor: string;
}

interface SupermarketsCarouselProps {
  selectedSupermarket: string;
  onSupermarketChange: (supermarket: string) => void;
}

const supermarkets: Supermarket[] = [
  { 
    id: 'carrefour', 
    name: 'Carrefour', 
    logo: '🛒', 
    color: '#0066CC',
    bgColor: '#E6F3FF'
  },
  { 
    id: 'mercadona', 
    name: 'Mercadona', 
    logo: '🏪', 
    color: '#FF6B35',
    bgColor: '#FFF2EE'
  },
  { 
    id: 'dia', 
    name: 'DIA', 
    logo: '🛍️', 
    color: '#D70026',
    bgColor: '#FCE6EA'
  },
  { 
    id: 'alcampo', 
    name: 'Alcampo', 
    logo: '🏬', 
    color: '#00A651',
    bgColor: '#E6F7ED'
  },
  { 
    id: 'eroski', 
    name: 'Eroski', 
    logo: '🛒', 
    color: '#FF7F00',
    bgColor: '#FFF4E6'
  },
  { 
    id: 'lidl', 
    name: 'Lidl', 
    logo: '🏪', 
    color: '#FFD500',
    bgColor: '#FFFBE6'
  }
];

export const SupermarketsCarousel = ({ selectedSupermarket, onSupermarketChange }: SupermarketsCarouselProps) => {
  return (
    <div className="px-4 mb-4 mt-6">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 pb-2 pr-4 min-w-max">
          {supermarkets.map((supermarket) => (
            <div
              key={supermarket.id}
              onClick={() => onSupermarketChange(supermarket.id)}
              className={`flex-none cursor-pointer transition-all px-3 py-2 rounded-full flex items-center gap-2 ${
                selectedSupermarket === supermarket.id 
                  ? 'ring-2 ring-offset-1' 
                  : 'opacity-80 hover:opacity-100'
              }`}
              style={{
                backgroundColor: supermarket.bgColor,
                color: supermarket.color,
                borderColor: supermarket.color,
                '--tw-ring-color': supermarket.color
              } as any}
            >
              <span className="text-lg">{supermarket.logo}</span>
              <span className="text-sm font-medium whitespace-nowrap">{supermarket.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};