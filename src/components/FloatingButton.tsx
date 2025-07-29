import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
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
  const buttonText = selectedCount !== undefined ? `Buscar súper · Ingredientes (${selectedCount})` : "Cambiar receta";
  const containerClasses = "fixed bottom-0 left-0 right-0 z-40 flex justify-center";
  return <div className={containerClasses} style={{
    paddingBottom: `calc(32px + env(safe-area-inset-bottom))`
  }}>
      <Button onClick={handleClick} className={`h-14 text-base font-medium rounded-lg px-6 shadow-lg bg-btnFloating text-btnFloating-foreground hover:bg-btnFloating mx-4 w-full max-w-none ${className}`} size="lg">
        <div className="flex items-center justify-center gap-2">
          <img src="/lovable-uploads/71eecaf2-ff51-47ff-beef-72570cb4f960.png" alt="search" className="h-5 w-5" />
          <span>Ingredientes desde {totalPrice ? `${totalPrice.toFixed(2)} €` : '64,76 €'}</span>
        </div>
      </Button>
    </div>;
};