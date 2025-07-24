import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
  const buttonText = className.includes('bg-green-500') ? 'Optimizando receta' : selectedCount !== undefined && totalPrice !== undefined ? `Añadir ${selectedCount} a mi compra • ${totalPrice.toFixed(2).replace('.', ',')} €` : children;
  const containerClasses = isAtBottom ? "fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-transparent" : "fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-gray-200/50 shadow-[0_-4px_20px_rgba(0,0,0,0.12)]";
  return <div className={containerClasses} style={{
    paddingBottom: 'env(safe-area-inset-bottom)'
  }}>
      
    </div>;
};