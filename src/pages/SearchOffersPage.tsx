
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGlobalIngredients } from '@/hooks/useGlobalIngredients';
import { useCarrefourAPI } from '@/hooks/useCarrefourAPI';
import { Recipe } from '@/types/recipe';

const SearchOffersPage = () => {
  const navigate = useNavigate();
  const { getGroupedIngredients } = useGlobalIngredients();
  const { findMatchingProduct } = useCarrefourAPI();
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
  const [selectedSupermarket, setSelectedSupermarket] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cargar recetas AI desde localStorage
  useEffect(() => {
    const savedAiRecipes = localStorage.getItem('aiGeneratedRecipes');
    if (savedAiRecipes) {
      try {
        const parsedRecipes = JSON.parse(savedAiRecipes);
        setAiRecipes(parsedRecipes);
      } catch (error) {
        console.error('Error parsing AI recipes:', error);
      }
    }
  }, []);

  // Obtener ingredientes agrupados de las recetas AI
  const groupedIngredients = getGroupedIngredients(aiRecipes);

  // Handle scroll to expand/collapse
  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollTop = scrollRef.current.scrollTop;
      if (scrollTop > 50 && !isExpanded) {
        setIsExpanded(true);
      } else if (scrollTop <= 20 && isExpanded) {
        setIsExpanded(false);
      }
    }
  };

  // Calcular precios por supermercado usando los ingredientes agrupados
  const calculateSupermarketPrices = () => {
    const supermarkets = [
      { 
        id: 'carrefour', 
        name: 'Carrefour', 
        logo: '/lovable-uploads/62545d3b-2a8b-4a13-a64c-d485492f24c1.png',
        multiplier: 1.0 
      },
      { 
        id: 'mercadona', 
        name: 'Mercadona', 
        logo: '/lovable-uploads/a06f3ae9-f80a-48b6-bf55-8c1b736c79f8.png',
        multiplier: 0.85 
      },
      { 
        id: 'dia', 
        name: 'Día', 
        logo: '/lovable-uploads/eeddbd2d-b7e8-45f2-a498-8bca36687a55.png',
        multiplier: 0.75 
      },
      { 
        id: 'eroski', 
        name: 'Eroski', 
        logo: '/lovable-uploads/e959efca-f3da-43ea-96a2-ac6b262be062.png',
        multiplier: 0.90 
      },
      { 
        id: 'lidl', 
        name: 'Lidl', 
        logo: '/lovable-uploads/8530d68e-8316-44b0-8389-d319fd405949.png',
        multiplier: 0.70 
      }
    ];

    const supermarketsWithPrices = supermarkets.map(supermarket => {
      let totalPrice = 0;

      groupedIngredients.forEach(ingredient => {
        const product = findMatchingProduct(ingredient.name);
        if (product) {
          // Extraer precio numérico del string
          const priceMatch = product.price.match(/(\d+[,.]?\d*)/);
          if (priceMatch) {
            const price = parseFloat(priceMatch[1].replace(',', '.'));
            totalPrice += price * supermarket.multiplier;
          }
        }
      });

      return {
        ...supermarket,
        totalPrice: totalPrice.toFixed(2)
      };
    });

    // Ordenar por precio total (más barato primero)
    return supermarketsWithPrices.sort((a, b) => parseFloat(a.totalPrice) - parseFloat(b.totalPrice));
  };

  const supermarketsWithPrices = calculateSupermarketPrices();
  const cheapestSupermarket = supermarketsWithPrices[0];

  const handleSupermarketClick = (supermarketId: string) => {
    setSelectedSupermarket(supermarketId);
    // Navegar a la página de detalle del supermercado
    navigate(`/supermarket/${supermarketId}`);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/milista')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Buscar ofertas</h1>
            <p className="text-sm text-gray-600">{groupedIngredients.length} ingredientes encontrados</p>
          </div>
        </div>
      </div>

      {/* Layout responsivo basado en el estado expandido */}
      <div className="flex flex-col h-[calc(100vh-73px)]">
        {/* Lista de ingredientes */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className={`transition-all duration-300 ease-in-out p-4 overflow-y-auto ${
            isExpanded ? 'h-full' : 'h-1/2'
          }`}
        >
          <h2 className="text-base font-medium mb-3 text-gray-900">Ingredientes de tus recetas</h2>
          <div className="space-y-2">
            {groupedIngredients.map((ingredient, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={`https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=100&h=100&fit=crop`}
                        alt={ingredient.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{ingredient.name}</h3>
                      <p className="text-xs text-gray-600">
                        {ingredient.displayAmount} · {ingredient.recipeCount} receta{ingredient.recipeCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Lista de supermercados - Solo visible cuando no está expandido */}
        {!isExpanded && (
          <div className="h-1/2 p-4 bg-white border-t border-gray-200">
            <h2 className="text-base font-medium mb-3 text-gray-900">Supermercados disponibles</h2>
            <div className="space-y-3 overflow-y-auto">
              {supermarketsWithPrices.map((supermarket) => (
                <Card 
                  key={supermarket.id} 
                  className={`cursor-pointer transition-all ${
                    selectedSupermarket === supermarket.id 
                      ? 'border-black bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSupermarketClick(supermarket.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden">
                        <img
                          src={supermarket.logo}
                          alt={supermarket.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm text-black">{supermarket.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-black">{supermarket.totalPrice}€</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botón flotante del supermercado más económico - Solo visible cuando está expandido */}
      {isExpanded && cheapestSupermarket && (
        <div className="fixed bottom-6 left-4 right-4 animate-fade-in">
          <Card 
            className="shadow-lg border-2 border-green-500 cursor-pointer"
            onClick={() => handleSupermarketClick(cheapestSupermarket.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden">
                    <img
                      src={cheapestSupermarket.logo}
                      alt={cheapestSupermarket.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-black">{cheapestSupermarket.name}</h3>
                    <p className="text-xs text-green-600">Más económico</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-black">{cheapestSupermarket.totalPrice}€</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCollapse();
                    }}
                    className="rounded-full h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SearchOffersPage;
