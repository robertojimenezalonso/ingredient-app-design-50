import { Recipe } from '@/types/recipe';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { ImageLoader } from '@/components/ui/image-loader';
import { Clock, Users, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecipeDrawerProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (recipe: Recipe) => void;
}

export const RecipeDrawer = ({ recipe, isOpen, onClose, onAdd }: RecipeDrawerProps) => {
  if (!recipe) return null;

  const generateConsistentPrice = (id: string): string => {
    const hash = id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const price = (hash % 8 + 4).toFixed(2);
    return price.replace('.', ',');
  };

  const price = generateConsistentPrice(recipe.id);
  const servings = 2;
  const pricePerServing = (parseFloat(price.replace(',', '.')) / servings).toFixed(2).replace('.', ',');

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="pb-4">
            <div className="relative mb-4">
              <ImageLoader
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-48 object-cover rounded-lg"
                category={recipe.category}
                priority={true}
              />
            </div>
            <DrawerTitle className="text-xl font-medium text-left">
              {recipe.title}
            </DrawerTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{recipe.time} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{recipe.servings} pers.</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4" />
                <span>{recipe.calories} kcal</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-lg font-medium">
                {price} € <span className="text-sm text-muted-foreground">({pricePerServing} €/ración)</span>
              </div>
              <Button 
                onClick={() => onAdd(recipe)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Añadir
              </Button>
            </div>
          </DrawerHeader>
          
          <div className="px-4 pb-6">
            {/* Macros */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Información nutricional</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-medium">{recipe.macros.protein}g</div>
                  <div className="text-sm text-muted-foreground">Proteínas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium">{recipe.macros.carbs}g</div>
                  <div className="text-sm text-muted-foreground">Carbohidratos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium">{recipe.macros.fat}g</div>
                  <div className="text-sm text-muted-foreground">Grasas</div>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Ingredientes</h3>
              <div className="space-y-2">
                {recipe.ingredients.slice(0, 6).map((ingredient, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{ingredient.name}</span>
                    <span className="text-muted-foreground">{ingredient.amount} {ingredient.unit}</span>
                  </div>
                ))}
                {recipe.ingredients.length > 6 && (
                  <div className="text-sm text-muted-foreground">
                    +{recipe.ingredients.length - 6} ingredientes más...
                  </div>
                )}
              </div>
            </div>

            {/* Instructions preview */}
            <div>
              <h3 className="font-medium mb-3">Preparación</h3>
              <div className="space-y-2">
                {recipe.instructions.slice(0, 3).map((instruction, index) => (
                  <div key={index} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{instruction}</span>
                  </div>
                ))}
                {recipe.instructions.length > 3 && (
                  <div className="text-sm text-muted-foreground ml-9">
                    +{recipe.instructions.length - 3} pasos más...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};