import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
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
    { id: 'carrefour', logo: '🛒', color: '#0066CC', bgColor: '#E6F3FF' },
    { id: 'mercadona', logo: '🏪', color: '#FF6B35', bgColor: '#FFF2EE' },
    { id: 'dia', logo: '🛍️', color: '#D70026', bgColor: '#FCE6EA' }
  ];

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-background transition-all duration-300 ${
      isScrolled ? 'py-2' : 'py-4'
    }`}>
      <div className="px-4">
        {/* Title */}
        <h1 className="text-xl font-bold mb-2">Mejores precios</h1>
        
        {/* Subtitle with supermarket circles */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Comparamos precios en 6 supermercados
          </span>
          <div className="flex items-center">
            {supermarkets.map((supermarket, index) => (
              <div
                key={supermarket.id}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                style={{
                  backgroundColor: supermarket.bgColor,
                  color: supermarket.color,
                  marginLeft: index > 0 ? '-8px' : '0',
                  zIndex: supermarkets.length - index
                }}
              >
                {supermarket.logo}
              </div>
            ))}
          </div>
        </div>

        {/* Search bar and filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar recetas..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border-input"
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};