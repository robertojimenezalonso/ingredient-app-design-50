import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Plus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FloatingButton } from '@/components/FloatingButton';
import { AirbnbHeader } from '@/components/AirbnbHeader';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const CartIngredientsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart, getGroupedIngredients, toggleIngredientSelection } = useCart();
  const { config } = useUserConfig();
  const [searchQuery, setSearchQuery] = useState('');

  const groupedIngredients = getGroupedIngredients();
  const filteredIngredients = groupedIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleFilterChange = (filter: 'receta' | 'ingredientes') => {
    if (filter === 'receta') {
      navigate('/milista/recetas');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white pb-8">
        <AirbnbHeader 
          showTabs={false}
          onFilterChange={handleFilterChange}
        />
        
        <div className="flex flex-col items-center justify-center h-96 px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 200px)' }}>
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No tienes ingredientes</h2>
          <p className="text-muted-foreground text-center mb-6">
            Añade algunas recetas para ver sus ingredientes aquí
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
        showTabs={false}
        onFilterChange={handleFilterChange}
      />
      
      <div className="p-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 160px)' }}>
        {/* Search bar and add button */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ingredientes..."
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
      </div>

      <FloatingButton onClick={handleSearchInSupermarket}>
        Buscar en supermercado
      </FloatingButton>
    </div>
  );
};

export default CartIngredientsPage;