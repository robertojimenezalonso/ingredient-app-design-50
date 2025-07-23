import { ChevronRight } from 'lucide-react';
import { Recipe, CategoryType, CATEGORIES } from '@/types/recipe';
import { RecipeCard } from './RecipeCard';
import { Card, CardContent } from './ui/card';

interface CategoryCarouselProps {
  category: CategoryType;
  recipes: Recipe[];
  onAddRecipe: (recipe: Recipe) => void;
  onRecipeClick: (recipe: Recipe) => void;
  onViewAll: (category: CategoryType) => void;
}

export const CategoryCarousel = ({ 
  category, 
  recipes, 
  onAddRecipe, 
  onRecipeClick, 
  onViewAll 
}: CategoryCarouselProps) => {
  if (recipes.length === 0) return null;

  return (
    <div className="mb-4">
      {/* Card informativa del asistente */}
      <div className="px-4 mb-6 mt-12">
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">
                  Empieza a usar nuestro<br />Asistente AI de recetas
                </p>
              </div>
              <img 
                src="/lovable-uploads/aaa38274-3981-4f1b-976f-6cc68b738160.png" 
                alt="Asistente de recetas" 
                className="w-12 h-12"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-1 px-4 mb-2">
        <h2 className="text-lg font-semibold">Las recetas</h2>
      </div>
      
      <div className="px-4">
        {recipes.slice(0, 6).map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onAdd={onAddRecipe}
            onClick={onRecipeClick}
          />
        ))}
      </div>
    </div>
  );
};