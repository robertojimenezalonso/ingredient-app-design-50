import { useState, useEffect } from 'react';

interface IngredientProgressAnimationProps {
  supermarketIngredients: any[];
  totalCount: number;
}

export const IngredientProgressAnimation = ({ 
  supermarketIngredients, 
  totalCount 
}: IngredientProgressAnimationProps) => {
  const [showCircles, setShowCircles] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [currentCount, setCurrentCount] = useState(10);

  useEffect(() => {
    // Todos los círculos aparecen juntos 1 segundo después
    const timer1 = setTimeout(() => setShowCircles(true), 1000);
    
    // Contador empieza al mismo tiempo que los círculos
    const timer2 = setTimeout(() => setShowCounter(true), 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
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
      <div className={`transition-all duration-300 ${showCircles ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        {supermarketIngredients[0] && (
          <div 
            className="w-12 h-12 rounded-full overflow-hidden"
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
      <div className={`transition-all duration-300 -ml-3 ${showCircles ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        {supermarketIngredients[1] && (
          <div 
            className="w-12 h-12 rounded-full overflow-hidden"
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
      <div className={`transition-all duration-300 -ml-3 ${showCircles ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        {supermarketIngredients[2] && (
          <div 
            className="w-12 h-12 rounded-full overflow-hidden"
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
      <div className={`transition-all duration-300 -ml-3 ${showCircles ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
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