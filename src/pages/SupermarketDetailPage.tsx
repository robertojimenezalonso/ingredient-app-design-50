import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
interface SupermarketProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  originalIngredient: string;
  matchScore: number;
  isChecked: boolean;
}
interface SupermarketData {
  name: string;
  logo: string;
  totalPrice: string;
  deliveryFee: string;
}
const supermarketInfo: Record<string, SupermarketData> = {
  carrefour: {
    name: 'Carrefour',
    logo: '/lovable-uploads/62545d3b-2a8b-4a13-a64c-d485492f24c1.png',
    totalPrice: '€67.45',
    deliveryFee: '€4.99'
  },
  lidl: {
    name: 'Lidl',
    logo: '/lovable-uploads/8530d68e-8316-44b0-8389-d319fd405949.png',
    totalPrice: '€52.30',
    deliveryFee: '€3.99'
  },
  mercadona: {
    name: 'Mercadona',
    logo: '/lovable-uploads/a06f3ae9-f80a-48b6-bf55-8c1b736c79f8.png',
    totalPrice: '€59.20',
    deliveryFee: '€2.99'
  },
  dia: {
    name: 'Dia',
    logo: '/lovable-uploads/eeddbd2d-b7e8-45f2-a498-8bca36687a55.png',
    totalPrice: '€48.95',
    deliveryFee: '€2.50'
  },
  eroski: {
    name: 'Eroski',
    logo: '/lovable-uploads/e959efca-f3da-43ea-96a2-ac6b262be062.png',
    totalPrice: '€64.80',
    deliveryFee: '€3.50'
  }
};
export default function SupermarketDetailPage() {
  const {
    supermarket
  } = useParams<{
    supermarket: string;
  }>();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [products, setProducts] = useState<SupermarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedCount, setCheckedCount] = useState(0);
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState<string>('€0.00');
  const supermarketData = supermarket ? supermarketInfo[supermarket] : null;
  useEffect(() => {
    if (supermarket) {
      fetchMatchedProducts();
    }
  }, [supermarket]);
  const fetchMatchedProducts = async () => {
    setLoading(true);
    try {
      // Get ingredients from localStorage (AI generated recipes)
      const storedRecipes = localStorage.getItem('aiGeneratedRecipes');
      if (!storedRecipes) {
        toast({
          title: "Error",
          description: "No se encontraron recetas para hacer el matching",
          variant: "destructive"
        });
        return;
      }
      const recipes = JSON.parse(storedRecipes);
      const allIngredients = recipes.flatMap((recipe: any) => recipe.ingredients.map((ing: any) => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit
      })));
      console.log('Ingredients to match:', allIngredients);

      // Call edge function to get matched products
      const {
        data,
        error
      } = await supabase.functions.invoke('match-supermarket-products', {
        body: {
          supermarket,
          ingredients: allIngredients
        }
      });
      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Error al buscar productos en el supermercado",
          variant: "destructive"
        });
        return;
      }
      if (data?.products) {
        const productsWithCheck = data.products.map((product: any) => ({
          ...product,
          isChecked: false
        }));
        setProducts(productsWithCheck);

        // Calcular precio total basándose en los productos reales
        calculateTotalPrice(productsWithCheck);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error al conectar con el supermercado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const calculateTotalPrice = (productList: SupermarketProduct[]) => {
    let total = 0;
    productList.forEach(product => {
      // Extraer precio numérico del string (€X.XX)
      const priceMatch = product.price.match(/[\d,]+[.,]?\d*/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[0].replace(',', '.'));
        if (!isNaN(price)) {
          total += price;
        }
      }
    });
    setCalculatedTotalPrice(`€${total.toFixed(2)}`);
  };
  const toggleProductCheck = (productId: string) => {
    setProducts(prev => {
      const updated = prev.map(product => product.id === productId ? {
        ...product,
        isChecked: !product.isChecked
      } : product);
      const newCheckedCount = updated.filter(p => p.isChecked).length;
      setCheckedCount(newCheckedCount);
      return updated;
    });
  };
  if (!supermarketData) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Supermercado no encontrado</p>
      </div>;
  }
  return <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate('/search-offers')} className="flex items-center gap-2 text-gray-600">
            <ArrowLeft className="h-5 w-5" />
            <span>Buscar ofertas</span>
          </button>
          
          <div className="flex items-center gap-3">
            <img src={supermarketData.logo} alt={supermarketData.name} className="h-8 w-8 object-contain" />
            <span className="font-semibold">{supermarketData.name}</span>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">Total</p>
            <p className="font-bold text-lg">{calculatedTotalPrice}</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Productos tachados: {checkedCount} / {products.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(checkedCount / products.length * 100) || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{
            width: `${checkedCount / products.length * 100}%`
          }} />
          </div>
        </div>
      </div>

      {/* Products list */}
      <div className="p-4 pb-24">
        <h1 className="text-lg font-semibold mb-4 text-gray-900">Ingredientes de tus recetas</h1>
        {loading ? <div className="space-y-4">
            {[...Array(6)].map((_, i) => <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>)}
          </div> : <div className="space-y-3">
            {products.map(product => <Card key={product.id} className={`cursor-pointer transition-all duration-200 ${product.isChecked ? 'bg-gray-100 border-gray-300 opacity-75' : 'bg-white hover:shadow-md'}`} onClick={() => toggleProductCheck(product.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Product image */}
                    <img src={`https://images.unsplash.com/photo-1546548970-71785318a17b?w=80&h=80&fit=crop&q=80&auto=format&cs=tinysrgb&dpr=1&s=${encodeURIComponent(product.name)}`} alt={product.name} className="h-16 w-16 object-cover rounded-lg" onError={e => {
                const target = e.target as HTMLImageElement;
                target.src = `https://images.unsplash.com/photo-1546548970-71785318a17b?w=80&h=80&fit=crop&q=80&auto=format`;
              }} />
                    
                    {/* Product info */}
                    <div className="flex-1 text-sm">
                      <h3 className={`font-medium text-base ${product.isChecked ? 'line-through text-gray-500' : ''}`}>
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {product.originalIngredient}
                      </p>
                    </div>
                    
                    {/* Price */}
                    <div className="text-right">
                      <p className={`font-bold text-sm ${product.isChecked ? 'line-through text-gray-500' : ''}`}>
                        {product.price}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>}
      </div>

      {/* Footer summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {checkedCount} de {products.length} productos
            </p>
            <p className="text-xs text-gray-500">
              Entrega: {supermarketData.deliveryFee}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{calculatedTotalPrice}</p>
            <Button className="mt-2" disabled={checkedCount === 0}>
              Ir a pagar
            </Button>
          </div>
        </div>
      </div>
    </div>;
}