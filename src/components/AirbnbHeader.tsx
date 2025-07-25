import { SlidersHorizontal, Search, Plus, ChevronDown, Coffee, UtensilsCrossed, Moon, Wine, Package, Cake, Filter, MoreVertical } from 'lucide-react';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const foodTypes = [
  { id: "desayuno", name: "Desayuno", emoji: "🥞" },
  { id: "almuerzo", name: "Almuerzo", emoji: "🍝" },
  { id: "cena", name: "Cena", emoji: "🥗" },
  { id: "aperitivo", name: "Aperitivo", emoji: "🧀" },
  { id: "snack", name: "Snack", emoji: "🥨" },
  { id: "postres", name: "Postres", emoji: "🧁" },
  { id: "otros", name: "Otros", emoji: "🏪" }
];

const filters = [
  { id: "promociones", name: "Promociones", hasDropdown: false },
  { id: "precio", name: "Precio", hasDropdown: true },
  { id: "dietetica", name: "Dietética", hasDropdown: true },
  { id: "nutricion", name: "Nutrición", hasDropdown: true },
  { id: "usado", name: "% Usado", hasDropdown: true },
  { id: "ingredientes", name: "Ingredientes", hasDropdown: true },
  { id: "tipo-comida", name: "Tipo de comida", hasDropdown: true },
  { id: "utensilios", name: "Utensilios", hasDropdown: true },
  { id: "tiempo", name: "Tiempo", hasDropdown: true },
];

interface AirbnbHeaderProps {
  showTabs?: boolean;
  activeTab?: string;
  mealPlan?: Array<{ date: Date; dateStr: string; meals: any[] }>;
  onTabChange?: (dateStr: string) => void;
  onFilterChange?: (filter: 'receta' | 'ingredientes') => void;
}

export const AirbnbHeader = ({ 
  showTabs = false, 
  activeTab = '', 
  mealPlan = [], 
  onTabChange,
  onFilterChange 
}: AirbnbHeaderProps = {}) => {
  const { config } = useUserConfig();
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedFoodType, setSelectedFoodType] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>('receta');
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to active tab
  useEffect(() => {
    if (activeTab && tabsContainerRef.current) {
      const activeButton = tabsContainerRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
      if (activeButton) {
        activeButton.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'start' 
        });
      }
    }
  }, [activeTab]);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const supermarketName = config.supermarket || 'LIDL';
  const servingsText = config.servingsPerRecipe === 1 
    ? '1 Ración por receta' 
    : `${config.servingsPerRecipe} Raciones por receta`;
  const locationText = config.postalCode 
    ? `${config.postalCode} • ${servingsText}`
    : `En tienda • ${servingsText}`;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-background transition-all duration-300 ${
      isScrolled ? 'border-b border-gray-200/30 shadow-[0_4px_20px_rgba(0,0,0,0.08)]' : ''
    }`} style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      
      {/* Main Header - Always Visible */}
      <div className="flex items-center gap-3 p-4 bg-white">
        <div className="flex-1 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_25px_rgba(0,0,0,0.15)] transition-shadow cursor-pointer">
          <div className="px-6 py-2 relative">
            <div className="text-center">
              <div className="font-semibold text-foreground">
                Mi lista de la compra
              </div>
              <div className="text-sm text-muted-foreground">
                {config.selectedDates?.length || 0} Días · {config.servingsPerRecipe} Raciones por receta
              </div>
            </div>
          </div>
        </div>
        <button className="p-2">
          <Filter className="h-5 w-5 text-black" />
        </button>
      </div>
      

      {/* Switch entre Receta y Lista de ingredientes - Hidden when scrolled */}
      <div className={`transition-all duration-300 overflow-hidden bg-white relative z-10 ${
        isScrolled ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
      }`}>
        <div className="flex items-center justify-center gap-1 px-4 py-4">
          <button 
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedFilter === 'receta' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => {
              setSelectedFilter('receta');
              onFilterChange?.('receta');
            }}
          >
            <UtensilsCrossed className="h-4 w-4" />
            Recetas
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedFilter === 'ingredientes' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => {
              setSelectedFilter('ingredientes');
              onFilterChange?.('ingredientes');
            }}
          >
            <Package className="h-4 w-4" />
            Ingredientes
          </button>
        </div>
      </div>

      {/* Date Tabs - Show when scrolled */}
      {showTabs && (
        <div className="bg-white/95 backdrop-blur-sm relative border-0 shadow-none z-20">
          <div className="px-4">
            <div ref={tabsContainerRef} className="flex gap-6 overflow-x-auto">
              {mealPlan.map(({ date, dateStr }) => (
                <button
                  key={dateStr}
                  data-tab={dateStr}
                  onClick={() => onTabChange?.(dateStr)}
                  className={`flex-shrink-0 pb-3 pt-2 text-base font-medium relative ${
                    activeTab === dateStr
                      ? 'text-black'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {format(date, "eee d", { locale: es }).toLowerCase()}
                  {activeTab === dateStr && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black z-10"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200"></div>
        </div>
      )}

    </div>
  );
};