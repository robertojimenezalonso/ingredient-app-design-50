import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types/recipe';
import { ImageLoader } from './ui/image-loader';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

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
  onSelectionChange?: (selectedIngredients: string[], totalCost: number) => void;
}

export const MercadonaIngredientsView = ({ recipe, onSelectionChange }: MercadonaIngredientsViewProps) => {
  const [supermarketIngredients, setSupermarketIngredients] = useState<SupermarketIngredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMercadonaIngredients();
  }, []);

  const loadMercadonaIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('supermarket_ingredients')
        .select('*')
        .eq('supermarket', 'Mercadona')
        .order('section_department', { ascending: true });

      if (error) throw error;

      setSupermarketIngredients(data || []);
      
      // Auto-seleccionar todos excepto sal, pimienta y aceite
      const autoSelected = new Set<string>();
      data?.forEach(ingredient => {
        const name = ingredient.product_name.toLowerCase();
        if (!name.includes('sal') && !name.includes('pimienta') && !name.includes('aceite')) {
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

  // Calcular porcentaje de uso y costo proporcional
  const calculateUsage = (supermarketIngredient: SupermarketIngredient) => {
    const recipeIngredient = findMatchingRecipeIngredient(supermarketIngredient.product_name);
    
    if (!recipeIngredient) {
      return { percentage: 0, proportionalCost: 0, recipeAmount: 'No usado' };
    }

    let recipeQuantity = parseFloat(recipeIngredient.amount);
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
    
    const percentage = Math.min((recipeQuantity / supermarketQuantity) * 100, 100);
    const proportionalCost = (supermarketIngredient.price * percentage) / 100;
    
    return {
      percentage: percentage,
      proportionalCost: proportionalCost,
      recipeAmount: `${recipeIngredient.amount} ${recipeIngredient.unit}`,
      supermarketAmount: `${supermarketQuantity} ${supermarketUnit}`
    };
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
        return total + usage.proportionalCost;
      }, 0);

    onSelectionChange?.(Array.from(newSelected), totalCost);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ingredientes de Mercadona</h3>
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/4" />
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
      return total + usage.proportionalCost;
    }, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Ingredientes de Mercadona</h3>
        <Badge variant="secondary" className="text-lg font-bold">
          Total: {totalSelectedCost.toFixed(2)}€
        </Badge>
      </div>
      
      <div className="grid gap-3">
        {supermarketIngredients.map((ingredient) => {
          const usage = calculateUsage(ingredient);
          const isSelected = selectedIngredients.has(ingredient.id);
          const isBasicIngredient = ['sal', 'pimienta', 'aceite'].some(basic => 
            ingredient.product_name.toLowerCase().includes(basic)
          );

          return (
            <Card key={ingredient.id} className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-sm'}`}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectionChange(ingredient.id, checked as boolean)}
                    className="mt-1"
                  />
                  
                  <div className="w-16 h-16 flex-shrink-0">
                    <ImageLoader
                      src={ingredient.image_url}
                      alt={ingredient.product_name}
                      className="w-full h-full rounded-lg object-cover"
                      priority={true}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 text-left">
                      {ingredient.product_name}
                    </h4>
                    
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Producto:</span>
                        <span className="font-medium">
                          {ingredient.quantity} {ingredient.unit_type}
                        </span>
                      </div>
                      
                      {usage.recipeAmount !== 'No usado' && (
                        <>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">Receta:</span>
                            <span className="font-medium">{usage.recipeAmount}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">Uso:</span>
                            <span className="font-medium text-orange-600">
                              {usage.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-between items-center text-xs pt-1 border-t">
                        <span className="text-muted-foreground">Precio:</span>
                        <div className="text-right">
                          <div className="text-muted-foreground line-through">
                            {ingredient.price.toFixed(2)}€
                          </div>
                          {usage.recipeAmount !== 'No usado' && (
                            <div className="font-bold text-green-600">
                              {usage.proportionalCost.toFixed(2)}€
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="mt-2 text-xs">
                      {ingredient.section_department}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        💡 Sal, pimienta y aceite no están seleccionados por defecto
      </div>
    </div>
  );
};