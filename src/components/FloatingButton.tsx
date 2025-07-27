import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
interface FloatingButtonProps {
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
  selectedCount?: number;
  totalPrice?: number;
}
export const FloatingButton = ({
  onClick,
  className = "",
  children,
  selectedCount,
  totalPrice
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
  
  const containerClasses = isAtBottom ? "fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-transparent" : "fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-gray-200/50 shadow-[0_-4px_20px_rgba(0,0,0,0.12)]";
  
  return (
    <div className={containerClasses} style={{
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      <div className="p-4">
        <Button 
          onClick={onClick}
          className={`w-full h-12 text-base font-medium ${className}`}
          size="lg"
        >
          <div className="flex items-center justify-center gap-2">
            {selectedCount !== undefined && <Search className="h-5 w-5" />}
            <span>{buttonText}</span>
          </div>
        </Button>
      </div>
    </div>
  );
};