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
  const totalSupermarkets = supermarkets.length;
  const displaySupermarkets = supermarkets.slice(0, 3); // Solo mostrar 3 logos

  return (
    <div className="px-4 mb-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Comparamos precios en {totalSupermarkets} supermercados
        </span>
        <div className="flex items-center">
          {displaySupermarkets.map((supermarket, index) => (
            <div
              key={supermarket.id}
              className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-sm"
              style={{
                backgroundColor: supermarket.bgColor,
                color: supermarket.color,
                marginLeft: index > 0 ? '-8px' : '0',
                zIndex: displaySupermarkets.length - index
              }}
            >
              {supermarket.logo}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};