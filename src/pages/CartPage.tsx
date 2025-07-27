import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag, Search, Plus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/BottomNav';
import { FloatingButton } from '@/components/FloatingButton';
import { AirbnbHeader } from '@/components/AirbnbHeader';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const CartPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart, removeFromCart, getTotalIngredients, getGroupedIngredients, toggleIngredientSelection } = useCart();
  const { config } = useUserConfig();
  const [viewMode, setViewMode] = useState<'receta' | 'ingredientes'>('receta');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('');

  // Create mealPlan from selectedDates for tabs
  const mealPlan = config.selectedDates?.map(dateStr => ({
    date: new Date(dateStr),
    dateStr,
    meals: []
  })) || [];

  const groupedIngredients = getGroupedIngredients();
  const filteredIngredients = groupedIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveRecipe = (recipeId: string) => {
    removeFromCart(recipeId);
    toast({
      title: "Receta eliminada",
      description: "La receta ha sido eliminada del carrito"
    });
  };

  const handleSearchInSupermarket = () => {
    toast({
      title: "Buscar en supermercado",
      description: "Función próximamente disponible"
    });
  };

  const handleAddIngredient = () => {
    toast({
      title: "Añadir ingrediente",
      description: "Función próximamente disponible"
    });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white pb-8">
        <AirbnbHeader 
          showTabs={false}
          onFilterChange={setViewMode}
          mealPlan={mealPlan}
          currentFilter={viewMode}
        />
        
        <div className="flex flex-col items-center justify-center h-96 px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 200px)' }}>
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Tu carrito está vacío</h2>
          <p className="text-muted-foreground text-center mb-6">
            Añade algunas recetas deliciosas para empezar tu lista de compras
          </p>
          <Button onClick={() => navigate('/')}>
            Explorar recetas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-8">
      <AirbnbHeader 
        showTabs={viewMode === 'receta'}
        activeTab={activeTab}
        mealPlan={mealPlan}
        onTabChange={setActiveTab}
        onFilterChange={setViewMode}
        currentFilter={viewMode}
      />
      
      <div className="p-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 200px)' }}>

        {/* Search bar and add button */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={viewMode === 'receta' ? "Buscar recetas..." : "Buscar ingredientes..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-0 bg-muted/50"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleAddIngredient}
            className="rounded-xl border-0 bg-muted/50"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {viewMode === 'receta' && (
          <div className="space-y-4">
            {cart.map(item => (
              <Card key={item.recipe.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <img 
                      src={item.recipe.image}
                      alt={item.recipe.title}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{item.recipe.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{item.servings} raciones</Badge>
                        <Badge variant="outline">{item.recipe.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.selectedIngredients.length} ingredientes seleccionados
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar receta?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará "{item.recipe.title}" y todos sus ingredientes del carrito.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleRemoveRecipe(item.recipe.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {viewMode === 'ingredientes' && (
          <div className="space-y-3">
            {filteredIngredients.map((ingredient, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={ingredient.isSelected}
                      onCheckedChange={() => toggleIngredientSelection(ingredient.id)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{ingredient.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {ingredient.displayAmount} · en {ingredient.recipeCount} receta{ingredient.recipeCount > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Para: {ingredient.recipes.join(', ')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <FloatingButton onClick={handleSearchInSupermarket}>
        Buscar en supermercado
      </FloatingButton>
    </div>
  );
};

export default CartPage;