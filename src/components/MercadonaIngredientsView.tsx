import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types/recipe';
import { ImageLoader } from './ui/image-loader';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

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

  // Calcular porcentaje de uso y cantidad usada
  const calculateUsage = (supermarketIngredient: SupermarketIngredient) => {
    const recipeIngredient = findMatchingRecipeIngredient(supermarketIngredient.product_name);
    
    if (!recipeIngredient) {
      return { 
        percentage: 0, 
        recipeAmount: 'No usado',
        productAmount: `${supermarketIngredient.quantity} ${supermarketIngredient.unit_type}`
      };
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
    
    return {
      percentage: Math.round(percentage),
      recipeAmount: `${recipeIngredient.amount} ${recipeIngredient.unit}`,
      productAmount: `${supermarketQuantity} ${supermarketUnit}`
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
      .reduce((total, ingredient) => total + ingredient.price, 0);

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
    .reduce((total, ingredient) => total + ingredient.price, 0);

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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Ingredientes de Mercadona</h3>
        <Badge variant="secondary" className="text-lg font-bold">
          Total: {totalSelectedCost.toFixed(2)}€
        </Badge>
      </div>
      
      <div className="grid gap-2">
        {sortedIngredients.map((ingredient) => {
          const usage = calculateUsage(ingredient);
          const isSelected = selectedIngredients.has(ingredient.id);

          return (
            <Card key={ingredient.id} className={`transition-all duration-200 ${isSelected ? 'ring-1 ring-primary shadow-sm' : 'hover:shadow-sm'}`}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 flex-shrink-0">
                    <ImageLoader
                      src={ingredient.image_url}
                      alt={ingredient.product_name}
                      className="w-full h-full rounded-lg object-cover"
                      priority={true}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm line-clamp-1 text-left mb-1">
                          {usage.productAmount}
                        </div>
                        
                        {usage.recipeAmount !== 'No usado' && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>uso en receta {usage.recipeAmount}</span>
                            <div className="h-1 bg-muted rounded-full flex-1 max-w-[60px]">
                              <div 
                                className="h-full bg-orange-500 rounded-full transition-all" 
                                style={{ width: `${usage.percentage}%` }}
                              />
                            </div>
                            <span className="font-medium text-orange-600">
                              {usage.percentage}%
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black">
                          {ingredient.price.toFixed(2)}€
                        </span>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectionChange(ingredient.id, checked as boolean)}
                        />
                      </div>
                    </div>
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