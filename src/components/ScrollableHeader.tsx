import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ScrollableHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ScrollableHeader = ({ searchQuery, onSearchChange }: ScrollableHeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const supermarkets = [
    { id: 'carrefour', logo: '/lovable-uploads/1b721c65-ba26-440f-8448-f20a3a8cb7f4.png', color: '#0066CC', bgColor: '#E6F3FF' },
    { id: 'lidl', logo: '/lovable-uploads/23674cbe-32da-424b-97e0-adf545eb6907.png', color: '#FF6B35', bgColor: '#FFF2EE' },
    { id: 'mercadona', logo: '/lovable-uploads/36486e80-a4a9-40e3-af96-2438bf906343.png', color: '#D70026', bgColor: '#FCE6EA' }
  ];

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-background transition-all duration-300 ${
      isScrolled ? 'py-2 pb-1' : 'py-4 pb-2'
    }`}>
      <div className="px-4">
        {/* Title */}
        <h1 className="text-2xl font-semibold mb-1">Mejores precios</h1>
        
        {/* Subtitle with supermarket circles */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">
            Comparamos precios en 6 supermercados
          </span>
          <div className="flex items-center">
            {supermarkets.map((supermarket, index) => (
              <div
                key={supermarket.id}
                className="w-6 h-6 rounded-full flex items-center justify-center bg-white border border-gray-200"
                style={{
                  marginLeft: index > 0 ? '-8px' : '0',
                  zIndex: supermarkets.length - index
                }}
              >
                <img 
                  src={supermarket.logo} 
                  alt={supermarket.id} 
                  className={`${index === 0 ? 'w-3 h-3' : 'w-full h-full'} object-cover rounded-full`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Search bar and filter */}
        <div className="flex items-center gap-3 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar recetas o ingredientes"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 pr-4 py-4 rounded-xl border border-gray-500 bg-white text-sm placeholder:text-sm placeholder:text-muted-foreground"
            />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full bg-transparent border-0 h-12 w-12 hover:bg-gray-100">
            <SlidersHorizontal className="h-5 w-5 text-gray-600" />
          </Button>
        </div>

      </div>
    </div>
  );
};