import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types/recipe';
import { ImageLoader } from './ui/image-loader';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

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

type SupermarketType = 'Mercadona' | 'Lidl' | 'Carrefour';

export const MercadonaIngredientsView = ({ recipe, onSelectionChange }: MercadonaIngredientsViewProps) => {
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

  // Calcular porcentaje de uso y cantidad usada
  const calculateUsage = (supermarketIngredient: SupermarketIngredient) => {
    const recipeIngredient = findMatchingRecipeIngredient(supermarketIngredient.product_name);
    
    if (!recipeIngredient) {
      return { 
        percentage: 0, 
        recipeAmount: 'No usado',
        productAmount: `${supermarketIngredient.quantity} ${abbreviateUnit(supermarketIngredient.unit_type)}`
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
      recipeAmount: `${recipeIngredient.amount} ${abbreviateUnit(recipeIngredient.unit)}`,
      productAmount: `${supermarketQuantity} ${abbreviateUnit(supermarketUnit)}`
    };
  };

  // Obtener color del porcentaje según el rango
  const getPercentageColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-red-600';
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
        <h3 className="text-lg font-semibold">Ingredientes</h3>
        <Badge variant="secondary" className="text-lg font-bold">
          Total: {totalSelectedCost.toFixed(2)}€
        </Badge>
      </div>
      
      {/* Selector de supermercados */}
      <div className="flex gap-2 justify-center">
        {(['Mercadona', 'Lidl', 'Carrefour'] as SupermarketType[]).map((supermarket) => (
          <Button
            key={supermarket}
            variant={selectedSupermarket === supermarket ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSupermarket(supermarket)}
            className="text-xs"
          >
            {supermarket}
          </Button>
        ))}
      </div>
      
      <div className="grid gap-2">
        {sortedIngredients.map((ingredient) => {
          const usage = calculateUsage(ingredient);
          const isSelected = selectedIngredients.has(ingredient.id);
          const percentageColor = getPercentageColor(usage.percentage);

          return (
            <Card key={ingredient.id} className={`transition-all duration-200 ${isSelected ? 'ring-1 ring-primary shadow-sm' : 'hover:shadow-sm'}`}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 flex-shrink-0">
                    <ImageLoader
                      src={ingredient.image_url}
                      alt={ingredient.product_name}
                      className="w-full h-full rounded-lg object-cover"
                      priority={true}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-base line-clamp-3 text-left leading-tight">
                        {ingredient.product_name} {usage.productAmount}
                      </h4>
                      <div className="flex items-center gap-3 ml-2">
                        <span className="font-medium text-base">
                          {ingredient.price.toFixed(2)}€
                        </span>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectionChange(ingredient.id, checked as boolean)}
                        />
                      </div>
                    </div>
                    
                    {usage.recipeAmount !== 'No usado' && (
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>uso en receta {usage.recipeAmount}</span>
                        <span className={`font-normal ${percentageColor}`}>
                          {usage.percentage}%
                        </span>
                      </div>
                    )}
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