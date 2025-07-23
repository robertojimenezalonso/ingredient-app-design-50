import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/BottomNav';
import { FloatingButton } from '@/components/FloatingButton';
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
import { useToast } from '@/hooks/use-toast';

const CartPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart, removeFromCart, getTotalIngredients, getGroupedIngredients } = useCart();
  const [viewMode, setViewMode] = useState<'recipes' | 'ingredients'>('recipes');

  const groupedIngredients = getGroupedIngredients();

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

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Carrito</h1>
        </div>

        <div className="flex flex-col items-center justify-center h-96 px-4">
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
    <div className="min-h-screen bg-background pb-8">
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/')}
          className="rounded-xl"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Carrito</h1>
      </div>

      <div className="p-4">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'recipes' | 'ingredients')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="recipes">Por receta</TabsTrigger>
            <TabsTrigger value="ingredients">Por ingrediente</TabsTrigger>
          </TabsList>

          <TabsContent value="recipes" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="ingredients" className="space-y-3">
            {groupedIngredients.map((ingredient, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{ingredient.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {ingredient.amount} {ingredient.unit}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Para: {ingredient.recipes.join(', ')}
                      </p>
                    </div>
                    <div className="w-4 h-4 border-2 border-primary rounded bg-primary/20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <FloatingButton onClick={handleSearchInSupermarket}>
        Buscar en supermercado
      </FloatingButton>
    </div>
  );
};

export default CartPage;