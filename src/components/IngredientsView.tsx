import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export const IngredientsView = () => {
  const { toast } = useToast();
  const { getGroupedIngredients, toggleIngredientSelection } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  const groupedIngredients = getGroupedIngredients();
  const filteredIngredients = groupedIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddIngredient = () => {
    toast({
      title: "Añadir ingrediente",
      description: "Función próximamente disponible"
    });
  };

  return (
    <div className="bg-white p-4">
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

      {/* Ingredients list */}
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
        {filteredIngredients.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No se encontraron ingredientes' : 'No hay ingredientes seleccionados'}
          </div>
        )}
      </div>
    </div>
  );
};