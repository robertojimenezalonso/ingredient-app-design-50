import { useNavigate } from "react-router-dom";
import { useRecipeBank } from "@/hooks/useRecipeBank";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { RecipeCard } from "@/components/RecipeCard";
import { Recipe } from "@/types/recipe";

const NewExplorePage = () => {
  const navigate = useNavigate();
  const { recipes, isLoading, getRecipesByCategory, convertToRecipe } = useRecipeBank();

  const categories = [
    { key: "desayuno", name: "Desayuno", icon: "🌅" },
    { key: "comida", name: "Comida", icon: "🍽️" },
    { key: "cena", name: "Cena", icon: "🌙" },
    { key: "snack", name: "Snacks", icon: "🍪" },
    { key: "aperitivo", name: "Aperitivos", icon: "🥂" },
    { key: "postre", name: "Postres", icon: "🍰" }
  ];

  const getRandomRecipes = (category: string, count: number = 3): Recipe[] => {
    const categoryRecipes = getRecipesByCategory(category);
    const shuffled = [...categoryRecipes].sort(() => 0.5 - Math.random());
    const selectedBankItems = shuffled.slice(0, count);
    
    // Convert RecipeBankItem to Recipe format
    return selectedBankItems.map(bankItem => convertToRecipe(bankItem));
  };

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleAddRecipe = (recipe: Recipe) => {
    // Handle add recipe logic if needed
    console.log("Add recipe:", recipe);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Explora Recetas
          </h1>
          <p className="text-muted-foreground text-lg">
            Descubre deliciosas recetas organizadas por categorías
          </p>
        </div>

        <div className="space-y-8">
          {categories.map((category) => {
            const categoryRecipes = getRandomRecipes(category.key, 3);
            
            return (
              <Card key={category.key} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle 
                      className="text-2xl font-semibold cursor-pointer hover:text-primary transition-colors flex items-center gap-3"
                      onClick={() => navigate(`/category/${category.key}`)}
                    >
                      <span className="text-3xl">{category.icon}</span>
                      {category.name}
                      <ChevronRight className="h-5 w-5" />
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/category/${category.key}`)}
                    >
                      Ver todas
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {categoryRecipes.length > 0 ? (
                    <div className="space-y-0">
                      {categoryRecipes.map((recipe) => (
                        <RecipeCard
                          key={recipe.id}
                          recipe={recipe}
                          onAdd={handleAddRecipe}
                          onClick={handleRecipeClick}
                          mealType={category.name}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No hay recetas disponibles para {category.name.toLowerCase()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NewExplorePage;