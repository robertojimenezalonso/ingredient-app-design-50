import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
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
  const discountedPrice = (calculatedPrice * 0.85).toFixed(2);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-lg" style={{
      paddingBottom: `calc(16px + env(safe-area-inset-bottom))`
    }}>
      {/* Header con logo Mercadona y precio */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <img src={mercadonaLogo} alt="Mercadona" className="w-6 h-6 object-contain" />
          <span className="text-sm font-medium text-black">Mercadona</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-black">
            {calculatedPrice.toFixed(2).replace('.', ',')} €
          </div>
          <div className="text-xs text-gray-600">
            Mejor precio: <span className="text-green-600">{discountedPrice.replace('.', ',')} €</span> en otros supermercados
          </div>
        </div>
      </div>
      
      {/* Botones Carrito y Supermercados */}
      <div className="flex items-center gap-3 px-4 py-4">
        {/* Carrito - lado izquierdo */}
        <div className="flex-1 text-center">
          <button className="text-base font-medium text-black border-b-2 border-black pb-1">
            Carrito
          </button>
        </div>
        
        {/* Supermercados - lado derecho */}
        <div className="flex-1">
          <Button 
            onClick={handleClick} 
            className="h-12 text-base font-medium rounded-lg px-4 shadow-lg bg-btnFloating text-btnFloating-foreground hover:bg-btnFloating w-full"
            size="lg"
          >
            <span>Supermercados</span>
          </Button>
        </div>
      </div>
    </div>
  );
};