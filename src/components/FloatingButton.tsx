import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, ShoppingCart, Save } from 'lucide-react';
import mercadonaLogo from '@/assets/mercadona-logo-new.png';
interface FloatingButtonProps {
  onClick?: () => void;
  onSave?: () => void;
  className?: string;
  children?: React.ReactNode;
  selectedCount?: number;
  totalPrice?: number;
  recipeCount?: number;
  showSaveButton?: boolean;
}
export const FloatingButton = ({
  onClick,
  onSave,
  className = "",
  children,
  selectedCount,
  totalPrice,
  recipeCount,
  showSaveButton = false
}: FloatingButtonProps) => {
  const navigate = useNavigate();
  const [isAtBottom, setIsAtBottom] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // Check if user is at the bottom (with 10px tolerance)
      const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAtBottom(atBottom);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navegar a la nueva página de búsqueda de ofertas
      navigate('/search-offers');
    }
  };
  const calculatedPrice = totalPrice || 64.76;
  const discountPercentage = 0.15; // 15% discount
  const betterPrice = calculatedPrice * (1 - discountPercentage);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-lg border-t border-gray-100" style={{
      paddingBottom: `calc(16px + env(safe-area-inset-bottom))`,
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Botones */}
      <div className="flex items-center gap-3 px-4 py-4">
        {showSaveButton ? (
          <>
            {/* Guardar Lista - lado izquierdo */}
            <div className="flex-1">
              <Button 
                onClick={onSave}
                className="h-12 text-base font-medium rounded-lg px-4 w-full bg-green-500 text-white hover:bg-green-600"
                size="lg"
              >
                <div className="flex items-center justify-center gap-2">
                  <Save className="h-4 w-4" />
                  <span>Guardar lista</span>
                </div>
              </Button>
            </div>
            
            {/* Mejor Precio - lado derecho */}
            <div className="flex-1">
              <Button 
                onClick={handleClick} 
                className="h-12 text-base font-medium rounded-lg px-4 shadow-lg bg-btnFloating text-btnFloating-foreground hover:bg-btnFloating w-full"
                size="lg"
              >
                <div className="flex items-center justify-center gap-2">
                  <Search className="h-4 w-4" />
                  <span>Mejor precio</span>
                  <span>{betterPrice.toFixed(2).replace('.', ',')} €</span>
                </div>
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Carrito - lado izquierdo */}
            <div className="flex-1">
              <Button 
                className="h-12 text-base font-medium rounded-lg px-4 w-full bg-gray-100 text-black hover:bg-gray-200"
                size="lg"
              >
                <span>Carrito</span>
              </Button>
            </div>
            
            {/* Mejor Precio - lado derecho */}
            <div className="flex-1">
              <Button 
                onClick={handleClick} 
                className="h-12 text-base font-medium rounded-lg px-4 shadow-lg bg-btnFloating text-btnFloating-foreground hover:bg-btnFloating w-full"
                size="lg"
              >
                <div className="flex items-center justify-center gap-2">
                  <Search className="h-4 w-4" />
                  <span>Mejor precio</span>
                  <span>{betterPrice.toFixed(2).replace('.', ',')} €</span>
                </div>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};