import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, ShoppingCart } from 'lucide-react';
import mercadonaLogo from '@/assets/mercadona-logo-new.png';
interface FloatingButtonProps {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  selectedCount?: number;
  totalPrice?: number;
  recipeCount?: number;
}
export const FloatingButton = ({
  onClick,
  className = "",
  children,
  selectedCount,
  totalPrice,
  recipeCount
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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-lg" style={{
      paddingBottom: `calc(16px + env(safe-area-inset-bottom))`
    }}>
      {/* Header con logo Mercadona y precio */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shadow-sm bg-gray-50">
        <div className="flex items-center gap-2">
          <img src={mercadonaLogo} alt="Mercadona" className="w-6 h-6 object-cover rounded-full bg-white" />
          <span className="text-base font-medium text-black">Mercadona</span>
        </div>
        <div className="text-base font-medium text-black">
          {calculatedPrice.toFixed(2).replace('.', ',')} €
        </div>
      </div>
      
      {/* Botones Carrito y Mejor Precio */}
      <div className="flex items-center gap-3 px-4 pb-4">
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
      </div>
    </div>
  );
};