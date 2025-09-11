import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types/recipe';
import { ImageLoader } from './ui/image-loader';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Apple, 
  Beef, 
  Carrot, 
  Egg, 
  Fish, 
  Grape, 
  Milk, 
  Wheat, 
  ChefHat,
  Salad,
  Cookie,
  Coffee
} from 'lucide-react';

interface SupermarketIngredient {
  id: string;
  product_name: string;
  quantity: number;
  unit_type: string;
  price: number;
  image_url: string;
  section_department: string;
}

interface MercadonaIngredientsViewProps {
  recipe: Recipe;
  servings: number;
  onSelectionChange?: (selectedIngredients: string[], totalCost: number) => void;
}

type SupermarketType = 'Mercadona' | 'Lidl' | 'Carrefour';

export const MercadonaIngredientsView = ({ recipe, servings, onSelectionChange }: MercadonaIngredientsViewProps) => {
  const [supermarketIngredients, setSupermarketIngredients] = useState<SupermarketIngredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [selectedSupermarket, setSelectedSupermarket] = useState<SupermarketType>('Mercadona');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadIngredients();
  }, [selectedSupermarket]);

  const loadIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('supermarket_ingredients')
        .select('*')
        .eq('supermarket', selectedSupermarket)
        .order('product_name', { ascending: true });

      if (error) throw error;

      setSupermarketIngredients(data || []);
      
      // Auto-seleccionar todos excepto sal, pimienta y aceite
      const autoSelected = new Set<string>();
      data?.forEach(ingredient => {
        const name = ingredient.product_name.toLowerCase();
        // Seleccionar todos los ingredientes EXCEPTO sal, pimienta y aceite
        // PERO incluir el tomate que debe estar seleccionado por defecto
        if (!name.includes('sal') && !name.includes('pimienta') && !name.includes('aceite')) {
          autoSelected.add(ingredient.id);
        }
        // Forzar selección del tomate
        if (name.includes('tomate')) {
          autoSelected.add(ingredient.id);
        }
      });
      setSelectedIngredients(autoSelected);
      
    } catch (error) {
      console.error('Error loading Mercadona ingredients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para abreviar unidades
  const abbreviateUnit = (unit: string): string => {
    const abbreviations: { [key: string]: string } = {
      'gramos': 'g',
      'kilogramos': 'kg', 
      'litros': 'L',
      'mililitros': 'ml',
      'unidad': 'U',
      'unidades': 'U',
      'cucharadas': 'cdas',
      'cucharada': 'cda',
      'cucharaditas': 'cdtas',
      'cucharadita': 'cdta'
    };
    return abbreviations[unit.toLowerCase()] || unit;
  };

  // Buscar el ingrediente de la receta que coincida con el producto de Mercadona
  const findMatchingRecipeIngredient = (productName: string) => {
    return recipe.ingredients.find(ingredient => {
      const recipeIngredient = ingredient.name.toLowerCase();
      const product = productName.toLowerCase();
      
      // Lógica de matching inteligente
      if (product.includes('huevo') && recipeIngredient.includes('huevo')) return true;
      if (product.includes('espinaca') && recipeIngredient.includes('espinaca')) return true;
      if (product.includes('champiñón') && recipeIngredient.includes('champiñón')) return true;
      if (product.includes('cebolla') && recipeIngredient.includes('cebolla')) return true;
      if (product.includes('tomate') && recipeIngredient.includes('tomate')) return true;
      if (product.includes('queso') && recipeIngredient.includes('queso')) return true;
      if (product.includes('aceite') && recipeIngredient.includes('aceite')) return true;
      if (product.includes('sal') && recipeIngredient.includes('sal')) return true;
      if (product.includes('pimienta') && recipeIngredient.includes('pimienta')) return true;
      
      return false;
    });
  };

  // Calcular porcentaje de uso y cantidad usada basado en las raciones actuales
  const calculateUsage = (supermarketIngredient: SupermarketIngredient) => {
    const recipeIngredient = findMatchingRecipeIngredient(supermarketIngredient.product_name);
    
    if (!recipeIngredient) {
      return { 
        percentage: 0, 
        recipeAmount: 'No usado',
        productAmount: `${supermarketIngredient.quantity} ${abbreviateUnit(supermarketIngredient.unit_type)}`,
        unitsNeeded: 1,
        totalPrice: supermarketIngredient.price,
        unitPrice: supermarketIngredient.price
      };
    }

    // Calcular la cantidad necesaria para las raciones actuales
    const baseRecipeAmount = parseFloat(recipeIngredient.amount);
    const neededAmount = (baseRecipeAmount * servings) / recipe.servings;
    
    let recipeQuantity = neededAmount;
    let supermarketQuantity = supermarketIngredient.quantity;
    
    // Normalizar unidades para el cálculo
    const recipeUnit = recipeIngredient.unit.toLowerCase();
    const supermarketUnit = supermarketIngredient.unit_type.toLowerCase();
    
    // Conversiones de unidades comunes
    if (recipeUnit === 'gr' && supermarketUnit === 'gramos') {
      // Ya están en la misma unidad
    } else if (recipeUnit === 'ud' && supermarketUnit === 'unidad') {
      // Ya están en la misma unidad
    } else if (recipeUnit === 'cda' && supermarketUnit === 'litros') {
      // 1 cucharada ≈ 15ml = 0.015L
      recipeQuantity = recipeQuantity * 0.015;
    }
    
    // Calcular cuántos productos necesitamos
    const unitsNeeded = Math.max(1, Math.ceil(recipeQuantity / supermarketQuantity));
    
    // Calcular porcentaje de uso del último producto
    const totalAvailable = supermarketQuantity * unitsNeeded;
    const percentage = Math.min((recipeQuantity / totalAvailable) * 100, 100);
    
    return {
      percentage: Math.round(percentage),
      recipeAmount: `${neededAmount.toFixed(1)} ${abbreviateUnit(recipeIngredient.unit)}`,
      productAmount: `${supermarketQuantity} ${abbreviateUnit(supermarketUnit)}`,
      unitsNeeded,
      totalPrice: supermarketIngredient.price * unitsNeeded,
      unitPrice: supermarketIngredient.price
    };
  };

  // Obtener color del porcentaje según el rango
  const getPercentageColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  // Obtener icono para el ingrediente de la receta
  const getIngredientIcon = (ingredientName: string) => {
    const name = ingredientName.toLowerCase();
    if (name.includes('huevo')) return Egg;
    if (name.includes('cebolla')) return Apple; // Usando Apple como representación de vegetales redondos
    if (name.includes('tomate')) return Apple;
    if (name.includes('champiñón')) return Salad;
    if (name.includes('espinaca')) return Salad;
    if (name.includes('queso')) return Milk;
    if (name.includes('aceite')) return Coffee; // Como líquido
    if (name.includes('sal') || name.includes('pimienta')) return ChefHat;
    if (name.includes('carne') || name.includes('pollo')) return Beef;
    if (name.includes('pescado')) return Fish;
    if (name.includes('zanahoria')) return Carrot;
    if (name.includes('pan') || name.includes('harina')) return Wheat;
    if (name.includes('fruta')) return Grape;
    return ChefHat; // Icono por defecto
  };

  const handleSelectionChange = (ingredientId: string, checked: boolean) => {
    const newSelected = new Set(selectedIngredients);
    if (checked) {
      newSelected.add(ingredientId);
    } else {
      newSelected.delete(ingredientId);
    }
    setSelectedIngredients(newSelected);

    // Calcular costo total de ingredientes seleccionados
    const totalCost = supermarketIngredients
      .filter(ingredient => newSelected.has(ingredient.id))
      .reduce((total, ingredient) => {
        const usage = calculateUsage(ingredient);
        return total + usage.totalPrice;
      }, 0);

    onSelectionChange?.(Array.from(newSelected), totalCost);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ingredientes de Mercadona</h3>
        <div className="grid gap-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3">
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalSelectedCost = supermarketIngredients
    .filter(ingredient => selectedIngredients.has(ingredient.id))
    .reduce((total, ingredient) => {
      const usage = calculateUsage(ingredient);
      return total + usage.totalPrice;
    }, 0);

  // Precios de ejemplo para otros supermercados
  const getSupermarketPrice = (supermarket: SupermarketType): number => {
    switch (supermarket) {
      case 'Mercadona': return totalSelectedCost;
      case 'Lidl': return totalSelectedCost * 0.85; // 15% más barato
      case 'Carrefour': return totalSelectedCost * 1.1; // 10% más caro
      default: return totalSelectedCost;
    }
  };

  // Separar ingredientes seleccionados y no seleccionados
  const selectedIngredientsList = supermarketIngredients.filter(ingredient => 
    selectedIngredients.has(ingredient.id)
  );
  const unselectedIngredientsList = supermarketIngredients.filter(ingredient => 
    !selectedIngredients.has(ingredient.id)
  );

  // Combinar listas: seleccionados primero
  const sortedIngredients = [...selectedIngredientsList, ...unselectedIngredientsList];

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <h3 className="text-lg font-semibold">Ingredientes</h3>
      </div>
      
      {/* Selector de supermercados con precios */}
      <div className="flex gap-2">
        {(['Mercadona', 'Lidl', 'Carrefour'] as SupermarketType[]).map((supermarket) => {
          const price = getSupermarketPrice(supermarket);
          const isSelected = selectedSupermarket === supermarket;
          const getPriceColor = () => {
            switch (supermarket) {
              case 'Mercadona': return 'bg-green-100 text-green-700';
              case 'Lidl': return 'bg-orange-100 text-orange-700';
              case 'Carrefour': return 'bg-red-100 text-red-700';
              default: return 'bg-gray-100 text-gray-700';
            }
          };
          
          return (
            <Button
              key={supermarket}
              variant="outline"
              size="sm"
              onClick={() => setSelectedSupermarket(supermarket)}
              className={`text-xs rounded-full gap-2 transition-all ${
                isSelected 
                  ? 'bg-gray-800 text-white border-gray-800 hover:bg-gray-900' 
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              <span>{supermarket}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriceColor()}`}>
                {price.toFixed(2)}€
              </span>
            </Button>
          );
        })}
      </div>
      
      {/* Información de precio por ración y comparación */}
      <div className="text-center text-sm text-muted-foreground">
        <span className="font-medium">{totalSelectedCost.toFixed(2)}€</span> para {servings} {servings === 1 ? 'ración' : 'raciones'}
        {selectedSupermarket !== 'Mercadona' && (
          <span className="block text-xs">
            {((getSupermarketPrice('Mercadona') - totalSelectedCost) * -1).toFixed(2)}€ 
            {getSupermarketPrice('Mercadona') < totalSelectedCost ? ' más caro' : ' más barato'} que Mercadona
          </span>
        )}
      </div>
      
      <div className="grid gap-2">
        {sortedIngredients.map((ingredient) => {
          const usage = calculateUsage(ingredient);
          const isSelected = selectedIngredients.has(ingredient.id);
          const percentageColor = getPercentageColor(usage.percentage);

          {
            const recipeIngredient = findMatchingRecipeIngredient(ingredient.product_name);
            const IconComponent = recipeIngredient ? getIngredientIcon(recipeIngredient.name) : ChefHat;
            
            return (
              <Card key={ingredient.id} className={`transition-all duration-200 ${isSelected ? 'ring-1 ring-gray-400 shadow-sm' : 'hover:shadow-sm'}`}>
                <CardContent className="p-3">
                  {/* Sección superior: Ingrediente original de la receta */}
                  {recipeIngredient && (
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-full">
                          <IconComponent size={12} className="text-gray-600" />
                        </div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-gray-800">
                            {recipeIngredient.name}
                          </h4>
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {abbreviateUnit(recipeIngredient.unit)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">
                          {usage.totalPrice.toFixed(2)}€
                        </span>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectionChange(ingredient.id, checked as boolean)}
                          className="border-gray-300"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Sección inferior: Producto del supermercado */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex gap-3">
                      <div className="flex items-center">
                        <button className="flex items-center gap-1 text-xs text-gray-500 mr-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          <span className="font-medium">+2</span>
                        </button>
                      </div>
                      
                      <div className="w-12 h-12 flex-shrink-0">
                        <ImageLoader
                          src={ingredient.image_url}
                          alt={ingredient.product_name}
                          className="w-full h-full rounded-lg object-cover"
                          priority={true}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          {usage.unitsNeeded > 1 && (
                            <Badge variant="secondary" className="text-xs font-bold bg-orange-100 text-orange-800 px-1 py-0.5">
                              {usage.unitsNeeded}X
                            </Badge>
                          )}
                          <h5 className="font-medium text-sm line-clamp-2 text-left leading-tight">
                            {ingredient.product_name}
                          </h5>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          {usage.productAmount}
                          {usage.recipeAmount !== 'No usado' && (
                            <>
                              <span> · </span>
                              <span className="font-normal text-gray-500">
                                {usage.percentage}% usado
                              </span>
                            </>
                          )}
                        </div>
                        
                        {usage.unitsNeeded > 1 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {usage.unitPrice.toFixed(2)}€/ud
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }
        })}
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        💡 Sal, pimienta y aceite no están seleccionados por defecto
      </div>
    </div>
  );
};