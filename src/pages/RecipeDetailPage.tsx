import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Heart, Plus, Minus, Clock, Flame, ChevronDown, ChevronRight, X, CheckCircle } from 'lucide-react';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { useRecipes } from '@/hooks/useRecipes';
import { useGlobalIngredients } from '@/hooks/useGlobalIngredients';
import { useCart } from '@/hooks/useCart';
import { useCarrefourAPI } from '@/hooks/useCarrefourAPI';
import { useRecipeBank } from '@/hooks/useRecipeBank';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FloatingButton } from '@/components/FloatingButton';
import { BottomNav } from '@/components/BottomNav';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { RecipeSkeleton } from '@/components/ui/recipe-skeleton';
import { ImageLoader } from '@/components/ui/image-loader';
import { MercadonaIngredientsView } from '@/components/MercadonaIngredientsView';
const RecipeDetailPage = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    toast
  } = useToast();
  const {
    favorites,
    toggleFavorite
  } = useRecipes();
  const {
    recipes: recipeBankRecipes,
    convertToRecipe
  } = useRecipeBank();
  const {
    config
  } = useUserConfig();
  const {
    addToCart,
    getTotalIngredients
  } = useCart();
  const {
    findMatchingProduct,
    loading: productsLoading
  } = useCarrefourAPI();
  const {
    toggleIngredientById,
    isIngredientSelected,
    initializeIngredients
  } = useGlobalIngredients();
  const [servings, setServings] = useState(config.servingsPerRecipe || 2);
  const [servingsInput, setServingsInput] = useState((config.servingsPerRecipe || 2).toString());
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'recipes' | 'cart' | 'profile'>('recipes');
  const [optimizationOption, setOptimizationOption] = useState<'more-servings' | 'bigger-portions' | null>(null);
  const [moreServingsChecked, setMoreServingsChecked] = useState(false);
  const [biggerPortionsChecked, setBiggerPortionsChecked] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [showOptimizationAnimation, setShowOptimizationAnimation] = useState(false);
  const [isOptimizationOpen, setIsOptimizationOpen] = useState(false);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(true);
  // Function to get AI recipe by ID from localStorage
  const getAIRecipeById = (id: string) => {
    try {
      const savedAiRecipes = localStorage.getItem('aiGeneratedRecipes');
      if (savedAiRecipes) {
        const aiRecipes = JSON.parse(savedAiRecipes);
        return aiRecipes.find((recipe: any) => recipe.id === id) || null;
      }
    } catch (error) {
      console.error('Error loading AI recipe from localStorage:', error);
    }
    return null;
  };

  // Get recipe from different sources
  const getRecipe = () => {
    // First try recipe bank (real data)
    const bankRecipe = recipeBankRecipes.find(r => r.id === id!);
    if (bankRecipe) {
      return convertToRecipe(bankRecipe, config.servingsPerRecipe || 2);
    }
    
    // Then try AI recipes
    const aiRecipe = getAIRecipeById(id!);
    if (aiRecipe) return aiRecipe;
    
    return null;
  };
  
  const recipe = getRecipe();
  const [selectedCategory, setSelectedCategory] = useState(recipe?.category || 'lunch');

  // Check if we're in change mode
  const isChangeMode = searchParams.get('mode') === 'change';
  const originalRecipeId = searchParams.get('originalId');
  const originalRecipeTitle = searchParams.get('originalTitle');

  // Effect to handle recipe loading state
  useEffect(() => {
    // Simulate loading for AI recipes or when ingredients are being loaded
    const timer = setTimeout(() => {
      setIsLoadingRecipe(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [id]);

  // Show skeleton if loading or no recipe found with some content
  useEffect(() => {
    if (!recipe || !recipe.title || !recipe.ingredients || recipe.ingredients.length === 0) {
      setIsLoadingRecipe(true);
    }
  }, [recipe]);

  // Get the current valid ingredients (4-10 per recipe, no duplicates within same recipe)
  const getCurrentValidIngredients = () => {
    if (!recipe) return [];
    const validIngredients = [];
    const usedIngredientNames = new Set(); // Track names to avoid duplicates

    // First, try to get valid ingredients from the recipe ingredients
    for (const ingredient of recipe.ingredients) {
      const carrefourProduct = findMatchingProduct(ingredient.name, ingredient.id);
      if (carrefourProduct && carrefourProduct.name && carrefourProduct.name.trim() !== '' && carrefourProduct.name !== 'Producto sin nombre') {
        const normalizedName = carrefourProduct.name.toLowerCase();
        if (!usedIngredientNames.has(normalizedName)) {
          validIngredients.push({
            ingredient,
            carrefourProduct,
            isFallback: false
          });
          usedIngredientNames.add(normalizedName);
          if (validIngredients.length >= 10) break; // Max 10 ingredients
        }
      }
    }

    // If we have less than 4, try to find more by creating additional ingredient variations
    if (validIngredients.length < 4) {
      const commonIngredients = ['Aceite de oliva', 'Sal', 'Pimienta', 'Ajo', 'Cebolla', 'Limón', 'Perejil', 'Orégano', 'Comino', 'Pimentón', 'Tomate', 'Queso', 'Huevo', 'Leche', 'Mantequilla'];
      for (const ingredientName of commonIngredients) {
        if (validIngredients.length >= 4) break;
        const normalizedName = ingredientName.toLowerCase();
        if (!usedIngredientNames.has(normalizedName)) {
          // Create a synthetic ingredient ID for API lookup
          const syntheticId = `synthetic-${validIngredients.length}-${ingredientName.replace(/\s+/g, '-').toLowerCase()}`;
          const carrefourProduct = findMatchingProduct(ingredientName, syntheticId);
          if (carrefourProduct && carrefourProduct.name && carrefourProduct.name.trim() !== '' && carrefourProduct.name !== 'Producto sin nombre') {
            const syntheticIngredient = {
              id: syntheticId,
              name: ingredientName,
              amount: '1',
              unit: 'unidad',
              selected: true
            };
            validIngredients.push({
              ingredient: syntheticIngredient,
              carrefourProduct,
              isFallback: false
            });
            usedIngredientNames.add(normalizedName);
          }
        }
      }
    }
    console.log(`📊 Recipe ${recipe.id}: Found ${validIngredients.length} valid ingredients from API`);
    return validIngredients; // Return only valid ingredients from API
  };

  // Initialize ingredients when component mounts
  useEffect(() => {
    if (!recipe || productsLoading) {
      return;
    }
    initializeIngredients([recipe]);
  }, [recipe?.id, productsLoading, initializeIngredients]);

  // Scroll to top when component mounts or recipe changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  const handleServingsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServingsInput(e.target.value);
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setServings(value);
    }
  };
  const handleServingsInputBlur = () => {
    const value = parseInt(servingsInput);
    const defaultServings = config.servingsPerRecipe || 2;
    if (isNaN(value) || value < 1) {
      setServings(defaultServings);
      setServingsInput(defaultServings.toString());
    } else {
      setServings(value);
      setServingsInput(value.toString());
    }
  };
  const abbreviateUnit = (unit: string): string => {
    const abbreviations: {
      [key: string]: string;
    } = {
      'unidades': 'ud.',
      'unidad': 'ud.',
      'gramos': 'g',
      'kilogramos': 'kg',
      'litros': 'l',
      'mililitros': 'ml',
      'cucharadas': 'cdas.',
      'cucharada': 'cda.',
      'cucharaditas': 'cdtas.',
      'cucharadita': 'cdta.',
      'tazas': 'tzs.',
      'taza': 'tz.',
      'dientes': 'dts.',
      'diente': 'dt.',
      'pizca': 'pzc.',
      'pizcas': 'pzcs.'
    };
    return abbreviations[unit.toLowerCase()] || unit;
  };
  const calculateIngredientPrice = (ingredient: any): number => {
    const adjustedAmount = parseFloat(ingredient.amount) * servings / recipe.servings;
    const basePrice = 1.5; // Base price per unit
    return adjustedAmount * basePrice;
  };
  const calculateIngredientUsagePercentage = (ingredient: any): number => {
    // Generate consistent percentage based on ingredient name
    const hash = ingredient.name.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const percentage = Math.abs(hash % 11) * 2 + 80; // Even numbers between 80-100%
    return Math.min(percentage, 100);
  };
  const calculateNeededAmount = (ingredient: any): string => {
    const recipeAmount = parseFloat(ingredient.amount);
    const usagePercentage = calculateIngredientUsagePercentage(ingredient);
    const packageAmount = recipeAmount * servings / recipe.servings;
    const neededAmount = packageAmount * usagePercentage / 100;

    // Make sure needed amount is less than package amount
    const adjustedNeeded = Math.min(neededAmount, packageAmount * 0.95);
    const displayAmount = adjustedNeeded.toFixed(1);
    return displayAmount.endsWith('.0') ? displayAmount.slice(0, -2) : displayAmount;
  };
  const calculateAverageUsagePercentage = (): number => {
    if (!recipe) return 0;
    const validIngredients = getCurrentValidIngredients();
    const selectedValidIngredients = validIngredients.filter(vi => isIngredientSelected(vi.ingredient.id));
    if (selectedValidIngredients.length === 0) return 0;
    const total = selectedValidIngredients.reduce((sum, vi) => {
      const ingredient = vi.ingredient;
      const carrefourProduct = vi.carrefourProduct;

      // Use the same logic as in getQuantityData to calculate usage percentage
      const extractQuantityFromTitle = (title: string) => {
        const patterns = [/(\d+(?:[.,]\d+)?)\s*(kg|g|l|cl|ml|ud|unidades?|rebanadas?|latas?|botes?)/i, /(\d+(?:[.,]\d+)?)\s*(aprox)/i];
        for (const pattern of patterns) {
          const match = title.match(pattern);
          if (match) {
            const quantity = parseFloat(match[1].replace(',', '.'));
            let unit = match[2].toLowerCase();
            if (unit === 'aprox') {
              const kgMatch = title.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
              if (kgMatch) {
                return {
                  quantity: parseFloat(kgMatch[1].replace(',', '.')),
                  unit: 'kg'
                };
              }
            }
            return {
              quantity,
              unit
            };
          }
        }
        return null;
      };
      const titleQuantity = carrefourProduct ? extractQuantityFromTitle(carrefourProduct.name) : null;
      let seedValue = 0;
      for (let i = 0; i < ingredient.id.length; i++) {
        seedValue += ingredient.id.charCodeAt(i);
      }
      const discountPercentage = seedValue % 25;
      if (titleQuantity) {
        const baseQuantity = titleQuantity.quantity;
        const unit = titleQuantity.unit.toLowerCase();
        const shouldUseIncrements = !['ud', 'unidad', 'unidades', 'kg', 'l'].includes(unit);
        let discountedQuantity: number;
        if (shouldUseIncrements) {
          const maxReduction = Math.floor(baseQuantity * 0.24);
          const reductionOptions = [];
          for (let i = 10; i <= maxReduction && i < baseQuantity; i += 10) {
            reductionOptions.push(baseQuantity - i);
          }
          if (reductionOptions.length === 0) {
            discountedQuantity = baseQuantity * ((100 - discountPercentage) / 100);
          } else {
            const optionIndex = (seedValue + baseQuantity) % reductionOptions.length;
            discountedQuantity = reductionOptions[optionIndex];
          }
        } else {
          discountedQuantity = baseQuantity * ((100 - discountPercentage) / 100);
        }
        const usagePercentage = Math.round(discountedQuantity / baseQuantity * 100);
        return sum + usagePercentage;
      } else {
        const usagePercentage = 100 - discountPercentage;
        return sum + usagePercentage;
      }
    }, 0);
    return Math.round(total / selectedValidIngredients.length);
  };
  const handleOptimizeRecipe = () => {
    if (!optimizationOption) return;
    setIsOptimized(true);
    if (optimizationOption === 'more-servings') {
      setServings(prev => prev + 1);
      setServingsInput(prev => (parseInt(prev) + 1).toString());
    } else if (optimizationOption === 'bigger-portions') {
      const newServings = Math.round(servings * 1.1);
      setServings(newServings);
      setServingsInput(newServings.toString());
    }
    toast({
      title: "Receta optimizada",
      description: `${optimizationOption === 'more-servings' ? 'Se añadió 1 ración más' : 'Se aumentó el tamaño de las raciones un 10%'}`
    });
  };
  // Show skeleton while loading or if no valid recipe content
  if (isLoadingRecipe || !recipe || !recipe.title || !recipe.ingredients || recipe.ingredients.length === 0) {
    return <RecipeSkeleton />;
  }
  const isFavorite = favorites.includes(recipe.id);

  // Get the count of selected ingredients from current valid ingredients
  const getSelectedCount = () => {
    const validIngredients = getCurrentValidIngredients();
    return validIngredients.filter(vi => isIngredientSelected(vi.ingredient.id)).length;
  };
  const selectedCount = getSelectedCount();

  // Calculate total price of selected ingredients using current valid ingredients
  const calculateTotalPrice = () => {
    const validIngredients = getCurrentValidIngredients();
    return validIngredients.filter(vi => isIngredientSelected(vi.ingredient.id)).reduce((total, vi) => {
      if (vi.carrefourProduct?.price && vi.carrefourProduct.price !== '') {
        // Extract numeric value from price string like "1,35 €"
        const priceStr = vi.carrefourProduct.price.replace(',', '.').replace('€', '').trim();
        const numericPrice = parseFloat(priceStr);
        if (!isNaN(numericPrice) && numericPrice > 0) {
          return total + numericPrice;
        }
      }

      // Fallback: generate consistent price based on ingredient ID
      let seedValue = 0;
      for (let i = 0; i < vi.ingredient.id.length; i++) {
        seedValue += vi.ingredient.id.charCodeAt(i);
      }
      const fallbackPrice = (seedValue % 300 + 100) / 100; // Price between 1.00€ and 4.00€
      return total + fallbackPrice;
    }, 0);
  };
  const totalPrice = calculateTotalPrice();
  const handleIngredientToggle = (ingredientId: string) => {
    toggleIngredientById(ingredientId);
  };
  const handleStepToggle = (stepIndex: number) => {
    setCompletedSteps(prev => prev.includes(stepIndex) ? prev.filter(i => i !== stepIndex) : [...prev, stepIndex]);
  };
  const handleAddToCart = () => {
    if (optimizationOption && !isOptimized) {
      handleOptimizeRecipe();
      return;
    }
    // Get selected ingredient IDs for cart
    const validIngredients = getCurrentValidIngredients();
    const selectedIngredientIds = validIngredients
      .filter(vi => isIngredientSelected(vi.ingredient.id))
      .map(vi => vi.ingredient.id);
    
    addToCart(recipe, servings, selectedIngredientIds);
    toast({
      title: "Añadido al carrito",
      description: `${selectedCount} ingredientes añadidos`
    });
    navigate(-1);
  };

  const handleSelectRecipe = () => {
    // Navegar de vuelta a la lista con la receta seleccionada
    navigate('/milista', { 
      state: { 
        replaceRecipe: {
          originalId: originalRecipeId,
          newRecipe: recipe
        }
      }
    });
    
    toast({
      title: "Receta cambiada",
      description: `${originalRecipeTitle} ha sido sustituida por ${recipe.title}`,
    });
  };

  const handleTabChange = (tab: 'recipes' | 'cart' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'cart') {
      navigate('/cart');
    } else if (tab === 'profile') {
      navigate('/profile');
    }
  };
  const adjustedCalories = Math.round(recipe.calories * servings / recipe.servings);
  return <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative">
        <ImageLoader
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-64 object-cover"
          fallbackSrc="https://images.unsplash.com/photo-1546548970-71785318a17b?w=800&h=600&fit=crop"
          placeholder={
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          }
        />
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button variant="secondary" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="px-4 mt-4 relative z-10">
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-4">{recipe.title}</h1>
          </div>



          {/* Servings selector */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <input type="number" inputMode="numeric" min="0" max="10" value={servingsInput} onChange={handleServingsInputChange} onBlur={handleServingsInputBlur} className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-lg font-bold text-center border-none focus:outline-none focus:ring-2 focus:ring-gray-400" />
              <span className="text-base font-medium">{servings === 1 ? 'Ración' : 'Raciones'}</span>
            </div>
            {/* Calories and time */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-black" />
                <span className="text-base font-medium">{adjustedCalories} kcal</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-black" />
                <span className="text-base font-medium">{recipe.time} min.</span>
              </div>
            </div>
          </div>

      </div>

      {/* Separator */}
      <div className="w-full h-2 bg-muted/50"></div>

      {/* Tabs */}
      <Tabs defaultValue="mercadona" className="w-full">
        <TabsList className="grid grid-cols-4 mx-4 mt-4 mb-4">
          <TabsTrigger value="mercadona">Mercadona</TabsTrigger>
          <TabsTrigger value="ingredientes">Ingredientes</TabsTrigger>
          <TabsTrigger value="instrucciones">Pasos</TabsTrigger>
          <TabsTrigger value="nutricion">Nutrición</TabsTrigger>
        </TabsList>

        {/* Mercadona Tab */}
        <TabsContent value="mercadona" className="px-4 mb-8">
          <MercadonaIngredientsView 
            recipe={recipe}
            onSelectionChange={(selectedIds, totalCost) => {
              console.log('🛒 Mercadona selection:', selectedIds.length, 'ingredients, cost:', totalCost.toFixed(2), '€');
            }}
          />
        </TabsContent>

        {/* Ingredientes Tab */}
        <TabsContent value="ingredientes" className="px-4 mb-8">

          <h2 className="text-lg font-semibold mb-4">{recipe.ingredients.length} Ingredientes</h2>



          <div className="mb-4">
            {productsLoading && <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Cargando precios del supermercado...</p>
              </div>}
            <div className="space-y-0">
              {recipe.ingredients.map((ingredient, displayIndex) => {
                const adjustedAmount = (parseFloat(ingredient.amount) * servings / recipe.servings).toFixed(1);
                const displayAmount = adjustedAmount.endsWith('.0') ? adjustedAmount.slice(0, -2) : adjustedAmount;

                return <div key={ingredient.id}>
                  <div className="flex items-center gap-3 py-3">
                    <div className="relative">
                      <img 
                        src={`https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=100`} 
                        alt={ingredient.name} 
                        className="w-16 h-16 rounded-lg object-cover border" 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium line-clamp-2">
                          {ingredient.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {displayAmount} {abbreviateUnit(ingredient.unit)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isIngredientSelected(ingredient.id)}
                        onChange={() => handleIngredientToggle(ingredient.id)}
                        className="w-5 h-5 rounded border-2 border-gray-300 checked:bg-primary checked:border-primary"
                      />
                    </div>
                  </div>
                  {displayIndex < recipe.ingredients.length - 1 && <div className="border-b border-border"></div>}
                </div>;
              })}
            </div>
          </div>

        </TabsContent>

        {/* Instrucciones Tab */}
        <TabsContent value="instrucciones" className="px-4 mb-8">
          <div className="mb-6">
            <div className="space-y-0 mt-4">
              {recipe.instructions.map((instruction, index) => <div key={index}>
                  <div className="flex items-center gap-4 py-3 cursor-pointer" onClick={() => handleStepToggle(index)}>
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <p className={`text-sm leading-relaxed flex-1 ${completedSteps.includes(index) ? 'line-through opacity-50' : ''}`}>
                      {instruction}
                    </p>
                  </div>
                  {index < recipe.instructions.length - 1 && <div className="border-b border-border"></div>}
                </div>)}
            </div>
          </div>
        </TabsContent>

        {/* Información nutricional Tab */}
        <TabsContent value="nutricion" className="px-4 mb-8">
          <div className="mb-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b-2 border-muted">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <Flame className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-medium">Calorías</span>
                </div>
                <span className="font-bold">{adjustedCalories} kcal</span>
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
          </div>
        </TabsContent>
      </Tabs>
    </div>;
};
export default RecipeDetailPage;