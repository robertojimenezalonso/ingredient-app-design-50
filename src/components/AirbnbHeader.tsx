import { SlidersHorizontal, Search, Plus, ChevronDown, Coffee, UtensilsCrossed, Moon, Wine, Package, Cake, Filter, MoreVertical, ArrowLeft } from 'lucide-react';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import mercadonaLogo from '@/assets/mercadona-logo-new.png';

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
  currentFilter?: 'receta' | 'ingredientes';
  navigationData?: {
    canGoPrevious: boolean;
    canGoNext: boolean;
    isGenerating: boolean;
    handlePrevious: () => void;
    handleNext: () => void;
    handleGenerate: () => void;
  } | null;
}

export const AirbnbHeader = ({ 
  showTabs = false, 
  activeTab = '', 
  mealPlan = [], 
  onTabChange,
  onFilterChange,
  currentFilter = 'receta',
  navigationData
}: AirbnbHeaderProps = {}) => {
  const { config } = useUserConfig();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedFoodType, setSelectedFoodType] = useState<string | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Sync selectedFilter with currentFilter prop
  useEffect(() => {
    setSelectedFilter(currentFilter);
  }, [currentFilter]);

  const [selectedFilter, setSelectedFilter] = useState<string | null>(currentFilter);

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
        <button 
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-black" />
        </button>
      </div>
      
      <div className="px-4 py-2 relative">
        <div className="flex-1 rounded-lg transition-colors cursor-pointer" style={{ backgroundColor: '#F6F6F6' }}>
          <div className="px-6 py-2 relative">
            <div className="text-left">
              <div className="font-medium text-base text-foreground">
                Mi lista de la compra
              </div>
              <div className="text-sm text-muted-foreground font-normal flex items-center -ml-1">
                <img src={mercadonaLogo} alt="Mercadona" className="w-6 h-6 object-cover mr-1 bg-white rounded-full" />
                Mercadona · Para {config.selectedDates?.length || 0} días
              </div>
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <img src="/lovable-uploads/8f17d96b-3966-4959-b7ba-b9d53435740d.png" alt="Filter" className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
      


      {/* Date Tabs - Only show when showTabs is true AND mealPlan has data */}
      {(() => {
        console.log('AirbnbHeader: showTabs =', showTabs, 'mealPlan.length =', mealPlan.length);
        return showTabs && mealPlan.length > 0;
      })() && (
        <div className="bg-white/95 backdrop-blur-sm relative border-0 shadow-none z-20">
          <div className="px-4">
            <div ref={tabsContainerRef} className="flex gap-6 overflow-x-auto">
              {mealPlan.map(({ date, dateStr }) => (
                <button
                  key={dateStr}
                  data-tab={dateStr}
                  onClick={() => onTabChange?.(dateStr)}
                  className={`flex-shrink-0 pb-3 pt-2 text-sm font-normal relative ${
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