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
      <Button onClick={handleClick} className={`h-12 text-base font-medium rounded-full px-6 shadow-lg bg-opacity-90 ${className}`} size="lg">
        <div className="flex items-center justify-center gap-2">
          <Search className="h-5 w-5" />
          <span className="font-medium">Buscar supermercados</span>
        </div>
      </Button>
    </div>;
};