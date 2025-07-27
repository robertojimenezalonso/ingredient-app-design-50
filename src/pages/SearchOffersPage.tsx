
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Star } from 'lucide-react';
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

  // Obtener TODOS los ingredientes de las recetas AI (sin filtro de selección)
  const getAllIngredients = () => {
    const allIngredients = getGroupedIngredients(aiRecipes);
    // Retornar todos los ingredientes sin importar si están seleccionados o no
    return allIngredients;
  };

  const allIngredients = getAllIngredients();

  // Calcular precios por supermercado usando TODOS los ingredientes
  const calculateSupermarketPrices = () => {
    const supermarkets = [
      { 
        id: 'carrefour', 
        name: 'Carrefour', 
        logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop',
        distance: '0.5 km',
        deliveryTime: '30-45 min',
        rating: 4.2,
        multiplier: 1.0 
      },
      { 
        id: 'mercadona', 
        name: 'Mercadona', 
        logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
        distance: '0.8 km',
        deliveryTime: '45-60 min',
        rating: 4.5,
        multiplier: 0.85 
      },
      { 
        id: 'dia', 
        name: 'Día', 
        logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop',
        distance: '1.2 km',
        deliveryTime: '60-75 min',
        rating: 3.8,
        multiplier: 0.75 
      },
      { 
        id: 'alcampo', 
        name: 'Alcampo', 
        logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
        distance: '2.1 km',
        deliveryTime: '75-90 min',
        rating: 4.0,
        multiplier: 0.90 
      },
      { 
        id: 'lidl', 
        name: 'Lidl', 
        logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop',
        distance: '1.5 km',
        deliveryTime: '50-65 min',
        rating: 4.1,
        multiplier: 0.70 
      }
    ];

    const supermarketsWithPrices = supermarkets.map(supermarket => {
      let totalPrice = 0;
      let availableItems = 0;

      allIngredients.forEach(ingredient => {
        const product = findMatchingProduct(ingredient.name);
        if (product) {
          // Extraer precio numérico del string
          const priceMatch = product.price.match(/(\d+[,.]?\d*)/);
          if (priceMatch) {
            const price = parseFloat(priceMatch[1].replace(',', '.'));
            totalPrice += price * supermarket.multiplier;
            availableItems++;
          }
        }
      });

      return {
        ...supermarket,
        totalPrice: totalPrice.toFixed(2),
        availableItems,
        totalItems: allIngredients.length
      };
    });

    // Ordenar por precio total (más barato primero)
    return supermarketsWithPrices.sort((a, b) => parseFloat(a.totalPrice) - parseFloat(b.totalPrice));
  };

  const supermarketsWithPrices = calculateSupermarketPrices();

  const handleSupermarketClick = (supermarketId: string) => {
    setSelectedSupermarket(supermarketId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Buscar ofertas</h1>
            <p className="text-sm text-gray-600">{allIngredients.length} ingredientes encontrados</p>
          </div>
        </div>
      </div>

      {/* Lista de ingredientes - Mitad superior */}
      <div className="h-1/2 p-4 overflow-y-auto">
        <h2 className="text-base font-medium mb-3 text-gray-900">Ingredientes de tus recetas</h2>
        <div className="space-y-2">
          {allIngredients.map((ingredient, index) => {
            const product = findMatchingProduct(ingredient.name);
            return (
              <Card key={index} className="bg-white">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={product?.image || `https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=100&h=100&fit=crop`}
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
                    <div className="text-right">
                      <p className="text-sm font-medium">{product?.price || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Lista de supermercados - Mitad inferior */}
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
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm">{supermarket.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">{supermarket.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {supermarket.distance}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {supermarket.deliveryTime}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {supermarket.availableItems} de {supermarket.totalItems} productos disponibles
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">{supermarket.totalPrice}€</p>
                    <p className="text-xs text-gray-500">Total estimado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchOffersPage;
