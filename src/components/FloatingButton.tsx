import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
interface FloatingButtonProps {
  onClick: () => void;
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
  const buttonText = selectedCount !== undefined 
    ? `Buscar súper · Ingredientes (${selectedCount})` 
    : "Cambiar receta";
  
  const containerClasses = "fixed bottom-0 left-0 right-0 z-40 flex justify-center";
  
  return (
    <div className={containerClasses} style={{
      paddingBottom: `calc(32px + env(safe-area-inset-bottom))`
    }}>
      <Button 
        onClick={onClick}
        className={`h-12 text-base font-medium rounded-full px-6 shadow-lg ${className}`}
        size="lg"
      >
        <div className="flex items-center justify-center gap-2">
          <Search className="h-5 w-5" />
          <span>Buscar oferta</span>
        </div>
      </Button>
    </div>
  );
};