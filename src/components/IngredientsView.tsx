import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { useGlobalIngredients } from '@/hooks/useGlobalIngredients';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import { useToast } from '@/hooks/use-toast';
import { Recipe } from '@/types/recipe';

interface IngredientsViewProps {
  recipes: Recipe[];
}

export const IngredientsView = ({ recipes }: IngredientsViewProps) => {
  const { toast } = useToast();
  const { getGroupedIngredients, toggleIngredientByName, selectedIngredientIds } = useGlobalIngredients();
  const [searchQuery, setSearchQuery] = useState('');

  const groupedIngredients = useMemo(() => {
    const ingredients = getGroupedIngredients(recipes);
    console.log('IngredientsView: groupedIngredients recalculated', ingredients.length);
    console.log('IngredientsView: selectedIngredientIds', selectedIngredientIds);
    console.log('IngredientsView: ingredients with selection status:', ingredients.map(ing => ({
      name: ing.name,
      isSelected: ing.isSelected,
      allIds: ing.allIds
    })));
    return ingredients;
  }, [getGroupedIngredients, recipes, selectedIngredientIds]);
  
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
    <div className="bg-white p-4 mt-8">{/* Removed pb-24 and fragment */}
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
            <Card 
              key={index}
              className={`cursor-pointer transition-colors ${
                ingredient.isSelected 
                  ? 'border-black bg-gray-100' 
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
              onClick={() => toggleIngredientByName(recipes, ingredient.name)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=100&h=100&fit=crop`}
                      alt={ingredient.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{ingredient.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {ingredient.displayAmount} · en {ingredient.recipeCount} receta{ingredient.recipeCount > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      Para: {ingredient.recipes.join(", ")}
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