import { SlidersHorizontal, Search, Plus, ChevronDown, Coffee, UtensilsCrossed, Moon, Wine, Package, Cake } from 'lucide-react';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useState, useEffect } from 'react';

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

export const AirbnbHeader = () => {
  const { config } = useUserConfig();
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedFoodType, setSelectedFoodType] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  
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
      <div className="flex items-center gap-3 p-4 backdrop-blur-md bg-background/80">
        <div className="flex-1 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_25px_rgba(0,0,0,0.15)] transition-shadow cursor-pointer">
          <div className="px-6 py-2 relative">
            <div className="text-center">
              <div className="font-semibold text-foreground">
                Recetas en {supermarketName}
              </div>
              <div className="text-sm text-muted-foreground">
                {locationText}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar and Food Icons - Hidden when scrolled */}
      <div className={`transition-all duration-300 overflow-hidden ${
        isScrolled ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
      }`}>
        
      </div>

    </div>
  );
};