import { Recipe } from '@/types/recipe';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useCarrefourAPI } from '@/hooks/useCarrefourAPI';

interface IngredientAvatarsProps {
  recipe: Recipe;
  maxVisible?: number;
}

export const IngredientAvatars = ({ recipe, maxVisible = 3 }: IngredientAvatarsProps) => {
  const { findMatchingProduct } = useCarrefourAPI();
  
  // Get valid ingredients with Carrefour products (same logic as in RecipeDetailPage)
  const getValidIngredients = () => {
    const validIngredients = [];
    const usedIngredientNames = new Set();

    for (const ingredient of recipe.ingredients.slice(0, 8)) {
      const carrefourProduct = findMatchingProduct(ingredient.name, ingredient.id);
      if (carrefourProduct && carrefourProduct.name && carrefourProduct.name.trim() !== '' && carrefourProduct.name !== 'Producto sin nombre') {
        const normalizedName = carrefourProduct.name.toLowerCase();
        if (!usedIngredientNames.has(normalizedName)) {
          validIngredients.push({
            ingredient,
            carrefourProduct
          });
          usedIngredientNames.add(normalizedName);
          if (validIngredients.length >= 10) break;
        }
      }
    }

    return validIngredients;
  };

  const validIngredients = getValidIngredients();
  const visibleIngredients = validIngredients.slice(0, maxVisible);
  const remainingCount = Math.max(0, validIngredients.length - maxVisible);

  return (
    <div className="flex items-center -space-x-2">
      {visibleIngredients.map(({ ingredient, carrefourProduct }, index) => (
        <Avatar key={ingredient.id} className="w-8 h-8 border border-gray-200">
          <AvatarImage 
            src={carrefourProduct?.image || `https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=100`}
            alt={ingredient.name}
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=100';
            }}
          />
          <AvatarFallback className="text-xs bg-muted">
            {ingredient.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      {remainingCount > 0 && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground font-medium">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
};