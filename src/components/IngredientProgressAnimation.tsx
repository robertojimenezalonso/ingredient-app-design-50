import { useState, useEffect } from 'react';

interface IngredientProgressAnimationProps {
  supermarketIngredients: any[];
  totalCount: number;
}

export const IngredientProgressAnimation = ({ 
  supermarketIngredients, 
  totalCount 
}: IngredientProgressAnimationProps) => {
  const [showFirst, setShowFirst] = useState(false);
  const [showSecond, setShowSecond] = useState(false);
  const [showThird, setShowThird] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [currentCount, setCurrentCount] = useState(1);

  useEffect(() => {
    // Primer ingrediente: 1 segundo
    const timer1 = setTimeout(() => setShowFirst(true), 1000);
    
    // Segundo ingrediente: 2.5 segundos
    const timer2 = setTimeout(() => setShowSecond(true), 2500);
    
    // Tercer ingrediente: 3 segundos
    const timer3 = setTimeout(() => setShowThird(true), 3000);
    
    // Contador: 3.5 segundos
    const timer4 = setTimeout(() => setShowCounter(true), 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Animación del contador
  useEffect(() => {
    if (showCounter && currentCount < totalCount) {
      const increment = Math.ceil(totalCount / 30); // Dividir en ~30 pasos para llegar en 1.5 segundos
      const timer = setTimeout(() => {
        setCurrentCount(prev => Math.min(prev + increment, totalCount));
      }, 50); // 50ms entre incrementos

      return () => clearTimeout(timer);
    }
  }, [showCounter, currentCount, totalCount]);

  return (
    <div className="flex items-center gap-3 mt-4">
      {/* Primer ingrediente */}
      <div className={`transition-all duration-300 ${showFirst ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        {supermarketIngredients[0] && (
          <div className="w-12 h-12 rounded-full overflow-hidden" style={{ backgroundColor: '#F4F4F4' }}>
            {supermarketIngredients[0].image_url ? (
              <img 
                src={supermarketIngredients[0].image_url} 
                alt={supermarketIngredients[0].product_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-500">
                  {supermarketIngredients[0].product_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Segundo ingrediente */}
      <div className={`transition-all duration-300 ${showSecond ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        {supermarketIngredients[1] && (
          <div className="w-12 h-12 rounded-full overflow-hidden" style={{ backgroundColor: '#F4F4F4' }}>
            {supermarketIngredients[1].image_url ? (
              <img 
                src={supermarketIngredients[1].image_url} 
                alt={supermarketIngredients[1].product_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-500">
                  {supermarketIngredients[1].product_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tercer ingrediente */}
      <div className={`transition-all duration-300 ${showThird ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        {supermarketIngredients[2] && (
          <div className="w-12 h-12 rounded-full overflow-hidden" style={{ backgroundColor: '#F4F4F4' }}>
            {supermarketIngredients[2].image_url ? (
              <img 
                src={supermarketIngredients[2].image_url} 
                alt={supermarketIngredients[2].product_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-500">
                  {supermarketIngredients[2].product_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Círculo contador */}
      <div className={`transition-all duration-300 ${showCounter ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#E5E5E5' }}
        >
          <span className="text-xs font-medium text-gray-600">
            {currentCount}
          </span>
        </div>
      </div>
    </div>
  );
};