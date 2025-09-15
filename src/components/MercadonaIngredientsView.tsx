import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types/recipe';
import { ImageLoader } from './ui/image-loader';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
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
  Coffee,
  ChevronRight,
  Flame,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import mercadonaLogo from '@/assets/mercadona-logo-new.png';
import lidlLogo from '@/assets/lidl-logo.png';
import carrefourLogo from '@/assets/carrefour-logo.png';

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
  completedSteps?: number[];
  onStepToggle?: (stepIndex: number) => void;
}

type SupermarketType = 'Mercadona' | 'Lidl' | 'Carrefour';

export const MercadonaIngredientsView = ({ recipe, servings, onSelectionChange, completedSteps = [], onStepToggle }: MercadonaIngredientsViewProps) => {
  const [supermarketIngredients, setSupermarketIngredients] = useState<SupermarketIngredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [selectedSupermarket, setSelectedSupermarket] = useState<SupermarketType>('Mercadona');
  const [isLoading, setIsLoading] = useState(true);
  const [isIngredientsExpanded, setIsIngredientsExpanded] = useState(false);
  const [isNutritionExpanded, setIsNutritionExpanded] = useState(false);
  const [isStepsExpanded, setIsStepsExpanded] = useState(false);

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

      // Auto-seleccionar todos excepto sal, pimienta y aceite (pero incluir tomate)
      const autoSelected = new Set<string>();
      data?.forEach(ingredient => {
        const name = ingredient.product_name.toLowerCase();
        // Seleccionar todos los ingredientes EXCEPTO sal, pimienta y aceite
        if (!name.includes('sal') && !name.includes('pimienta') && !name.includes('aceite')) {
          autoSelected.add(ingredient.id);
        }
        // Forzar selección del tomate
        if (name.includes('tomate')) {
          autoSelected.add(ingredient.id);
        }
      });
      
      // Ordenar ingredientes: seleccionados primero, no seleccionados después
      const sortedData = data?.sort((a, b) => {
        const aSelected = autoSelected.has(a.id);
        const bSelected = autoSelected.has(b.id);
        
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0; // Mantener orden alfabético dentro de cada grupo
      });

      setSupermarketIngredients(sortedData || []);
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
      const recipeIngredient = ingredient.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const product = productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      // Lógica de matching inteligente - normaliza acentos y compara variaciones
      if ((product.includes('huevo') || product.includes('huevos')) && 
          (recipeIngredient.includes('huevo') || recipeIngredient.includes('huevos'))) return true;
      if ((product.includes('espinaca') || product.includes('espinacas')) && 
          (recipeIngredient.includes('espinaca') || recipeIngredient.includes('espinacas'))) return true;
      if ((product.includes('champinon') || product.includes('champinones')) && 
          (recipeIngredient.includes('champinon') || recipeIngredient.includes('champinones'))) return true;
      if ((product.includes('cebolla') || product.includes('cebollas')) && 
          (recipeIngredient.includes('cebolla') || recipeIngredient.includes('cebollas'))) return true;
      if ((product.includes('tomate') || product.includes('tomates')) && 
          (recipeIngredient.includes('tomate') || recipeIngredient.includes('tomates'))) return true;
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

  const displayedIngredients = isIngredientsExpanded ? supermarketIngredients : supermarketIngredients.slice(0, 2);

  return (
    <div className="space-y-4 pb-20">
      {/* Receta Header Card */}
      <Card className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#C3C3C3]">
        <CardHeader className="pb-4 px-4">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex-shrink-0">
              <ImageLoader
                src={recipe.image} 
                alt={recipe.title}
                className="w-24 h-24 object-cover rounded-xl mx-auto"
                category={recipe.category}
                priority={true}
                placeholder={
                  <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center mx-auto">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                }
              />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold text-neutral-950 mb-3">{recipe.title}</CardTitle>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{recipe.time} min</span>
                </div>
                <button 
                  onClick={() => setIsStepsExpanded(!isStepsExpanded)}
                  className="flex items-center gap-1 hover:text-gray-800"
                >
                  <span>Pasos</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mercadona Ingredients Card */}
      <Card className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#C3C3C3]">
        <CardHeader className="pb-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={mercadonaLogo} alt="Mercadona" className="w-8 h-8" />
              <CardTitle className="text-xl font-semibold text-neutral-950">Ingredientes</CardTitle>
            </div>
            <button 
              onClick={() => setIsIngredientsExpanded(!isIngredientsExpanded)}
              className="text-sm text-gray-600 flex items-center gap-1"
            >
              <span>Raciones {servings}</span>
              {isIngredientsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4">
          {displayedIngredients.map((ingredient, index) => {
            const usage = calculateUsage(ingredient);
            const isSelected = selectedIngredients.has(ingredient.id);
            const percentageColor = getPercentageColor(usage.percentage);

            const recipeIngredient = findMatchingRecipeIngredient(ingredient.product_name);
            const IconComponent = recipeIngredient ? getIngredientIcon(recipeIngredient.name) : ChefHat;
            
            return (
              <div key={ingredient.id}>
                <div className="py-2">
                  {/* Sección inferior: Producto del supermercado */}
                  <div className="p-3">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 flex-shrink-0">
                        <ImageLoader
                          src={ingredient.image_url}
                          alt={ingredient.product_name}
                          className="w-full h-full rounded-lg object-cover"
                          priority={true}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1 gap-4">
                          <div className="flex-1 mr-2">
                            {usage.unitsNeeded > 1 && (
                              <Badge variant="secondary" className="text-xs font-bold bg-orange-100 text-orange-800 px-1 py-0.5 mb-1">
                                {usage.unitsNeeded}X
                              </Badge>
                            )}
                            <h5 className="text-sm leading-tight line-clamp-3">
                              {ingredient.product_name} <span className="whitespace-nowrap">{usage.productAmount}</span>
                            </h5>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {usage.recipeAmount !== 'No usado' && (
                              <div>
                                <span>El {usage.percentage}% se usa en esta receta</span>
                                <div className="font-medium text-sm text-gray-800 mt-1">
                                  {usage.totalPrice.toFixed(2)}€
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <button className="flex items-center gap-1 text-xs text-gray-500">
                              <span className="font-medium">+2</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleSelectionChange(ingredient.id, checked as boolean)}
                              className="border-gray-300 data-[state=checked]:border-0"
                            />
                          </div>
                        </div>
                        
                        {usage.unitsNeeded > 1 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {usage.unitPrice.toFixed(2)}€/ud
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Separador entre ingredientes, excepto para el último */}
                {index < displayedIngredients.length - 1 && (
                  <div className="border-b border-gray-200 my-1"></div>
                )}
              </div>
            );
          })}
          
          {!isIngredientsExpanded && supermarketIngredients.length > 2 && (
            <div className="text-center pt-2">
              <button 
                onClick={() => setIsIngredientsExpanded(true)}
                className="text-sm text-gray-500 flex items-center justify-center gap-1 w-full"
              >
                <span>Ver {supermarketIngredients.length - 2} más</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pasos Card */}
      {isStepsExpanded && (
        <Card className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#C3C3C3]">
          <CardHeader className="pb-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-neutral-950">Pasos</CardTitle>
              <button onClick={() => setIsStepsExpanded(false)}>
                <ChevronUp className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-0">
              {recipe.instructions.map((instruction, index) => (
                <div key={index}>
                  <div className="flex items-center gap-4 py-3 cursor-pointer" onClick={() => onStepToggle?.(index)}>
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <p className={`text-sm leading-relaxed flex-1 ${completedSteps.includes(index) ? 'line-through opacity-50' : ''}`}>
                      {instruction}
                    </p>
                  </div>
                  {index < recipe.instructions.length - 1 && <div className="border-b border-border"></div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nutrición Card - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <Card className="bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-0 border-t border-[#C3C3C3]">
          <CardHeader className="pb-3 px-4">
            <button 
              onClick={() => setIsNutritionExpanded(!isNutritionExpanded)}
              className="flex items-center justify-between w-full"
            >
              <CardTitle className="text-xl font-semibold text-neutral-950">Nutrición</CardTitle>
              {isNutritionExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </CardHeader>
          
          {isNutritionExpanded && (
            <CardContent className="px-4 pb-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b-2 border-muted">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                      <Flame className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-medium">Calorías</span>
                  </div>
                  <span className="font-bold">{Math.round(recipe.calories * servings / recipe.servings)} kcal</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b-2 border-muted">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">H</span>
                    </div>
                    <span className="font-medium">Hidratos</span>
                  </div>
                  <span className="font-bold">{Math.round((recipe.macros.carbs * servings) / recipe.servings)} g</span>
                </div>
                
                <div className="text-sm text-muted-foreground ml-9 space-y-2 pb-3 border-b-2 border-muted">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Fi</span>
                      </div>
                      <span>Fibra</span>
                    </div>
                    <span>2 g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="ml-8">Azúcares</span>
                    <span>3 g</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b-2 border-muted">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <span className="font-medium">Proteínas</span>
                  </div>
                  <span className="font-bold">{Math.round((recipe.macros.protein * servings) / recipe.servings)} g</span>
                </div>
                
                <div className="border-b-2 border-muted pb-3">
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">G</span>
                      </div>
                      <span className="font-medium">Grasas</span>
                    </div>
                    <span className="font-bold">{Math.round((recipe.macros.fat * servings) / recipe.servings)} g</span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground ml-9 space-y-2 mt-2">
                    <div className="flex justify-between">
                      <span>Grasas saturadas</span>
                      <span>7 g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grasas insaturadas</span>
                      <span>6,1 g</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Colesterol</span>
                    <span className="font-bold">31,6 mg</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Sodio</span>
                    <span className="font-bold">74,1 mg</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Potasio</span>
                    <span className="font-bold">1117,6 mg</span>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};