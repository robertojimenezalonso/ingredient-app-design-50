import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Search, Plus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const CartRecipesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart, removeFromCart } = useCart();
  const { config } = useUserConfig();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('');

  // Create mealPlan from selectedDates for tabs
  const mealPlan = config.selectedDates?.map(dateStr => ({
    date: new Date(dateStr),
    dateStr,
    meals: []
  })) || [];

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

  const handleAddRecipe = () => {
    navigate('/');
  };

  const handleFilterChange = (filter: 'receta' | 'ingredientes') => {
    if (filter === 'ingredientes') {
      navigate('/milista/ingredientes');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white pb-8">
        <AirbnbHeader 
          showTabs={false}
          onFilterChange={handleFilterChange}
          mealPlan={mealPlan}
        />
        
        <div className="flex flex-col items-center justify-center h-96 px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 200px)' }}>
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No tienes recetas</h2>
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
        showTabs={true}
        activeTab={activeTab}
        mealPlan={mealPlan}
        onTabChange={setActiveTab}
        onFilterChange={handleFilterChange}
      />
      
      <div className="p-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 200px)' }}>
        {/* Search bar and add button */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar recetas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-0 bg-muted/50"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleAddRecipe}
            className="rounded-xl border-0 bg-muted/50"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {cart
            .filter(item => item.recipe.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(item => (
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
      </div>

      <FloatingButton onClick={handleSearchInSupermarket}>
        Buscar en supermercado
      </FloatingButton>
    </div>
  );
};

export default CartRecipesPage;