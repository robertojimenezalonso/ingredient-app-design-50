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
  const [currentCount, setCurrentCount] = useState(10);

  useEffect(() => {
    // Círculos aparecen secuencialmente en 1.5 segundos total
    // Primer círculo: 1 segundo después del texto
    const timer1 = setTimeout(() => setShowFirst(true), 1000);
    
    // Segundo círculo: 0.5 segundos después del primero
    const timer2 = setTimeout(() => setShowSecond(true), 1500);
    
    // Tercer círculo: 0.5 segundos después del segundo  
    const timer3 = setTimeout(() => setShowThird(true), 2000);
    
    // Contador: 0.5 segundos después del tercero
    const timer4 = setTimeout(() => setShowCounter(true), 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Animación del contador - 3.5 segundos para llegar al total
  useEffect(() => {
    if (showCounter && currentCount < totalCount) {
      const duration = 3500; // 3.5 segundos
      const steps = Math.ceil(duration / 50); // 50ms entre incrementos
      const increment = Math.ceil((totalCount - 10) / steps); // Empezar desde 10
      
      const timer = setTimeout(() => {
        setCurrentCount(prev => Math.min(prev + increment, totalCount));
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [showCounter, currentCount, totalCount]);

  return (
    <div className="flex items-center mt-4">
      {/* Primer ingrediente */}
      <div className={`transition-all duration-300 ${showFirst ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        {supermarketIngredients[0] && (
          <div 
            className="w-10 h-10 rounded-full overflow-hidden"
            style={{ 
              backgroundColor: '#F4F4F4',
              border: '1px solid #D6D6D6'
            }}
          >
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

      {/* Segundo ingrediente - solapado */}
      <div className={`transition-all duration-300 -ml-2 ${showSecond ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        {supermarketIngredients[1] && (
          <div 
            className="w-10 h-10 rounded-full overflow-hidden"
            style={{ 
              backgroundColor: '#F4F4F4',
              border: '1px solid #D6D6D6'
            }}
          >
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

      {/* Tercer ingrediente - solapado */}
      <div className={`transition-all duration-300 -ml-2 ${showThird ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        {supermarketIngredients[2] && (
          <div 
            className="w-10 h-10 rounded-full overflow-hidden"
            style={{ 
              backgroundColor: '#F4F4F4',
              border: '1px solid #D6D6D6'
            }}
          >
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

      {/* Círculo contador - solapado */}
      <div className={`transition-all duration-300 -ml-2 ${showCounter ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ 
            backgroundColor: '#E5E5E5',
            border: '1px solid #D6D6D6'
          }}
        >
          <span className="text-xs font-medium text-gray-600">
            +{currentCount}
          </span>
        </div>
      </div>
    </div>
  );
};