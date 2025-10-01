import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types/recipe';
import { toast } from '@/hooks/use-toast';
import { useGlobalRecipeRegistry } from '@/hooks/useGlobalRecipeRegistry';

interface GenerateRecipeRequest {
  people: number;
  days: string[];
  meals: string[];
  restrictions?: string[];
}

export const useAIRecipes = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const registry = useGlobalRecipeRegistry();

  const generateRecipe = async (request: GenerateRecipeRequest, showToast: boolean = true): Promise<Recipe | null> => {
    setIsGenerating(true);
    
    try {
      // Generate recipe text
      const { data: recipeData, error: recipeError } = await supabase.functions.invoke(
        'generate-recipe',
        {
          body: request
        }
      );

      if (recipeError) {
        throw new Error(`Error generating recipe: ${recipeError.message}`);
      }

      const recipe = recipeData.recipe;

      // TEMPORALMENTE DESHABILITADO: Generación de imágenes para ahorrar créditos
      // Usando imágenes placeholder de Unsplash
      const imageUrl = 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=500&h=300&fit=crop';
      console.log('⚠️ Generación de imágenes DESHABILITADA - usando placeholder');

      // Combine recipe with image
      const finalRecipe: Recipe = {
        ...recipe,
        image: imageUrl
      };

      if (showToast) {
        toast({
          title: "Receta generada",
          description: `${recipe.title} ha sido creada con IA`
        });
      }

      return finalRecipe;
    } catch (error) {
      console.error('Error generating AI recipe:', error);
      toast({
        title: "Error",
        description: "No se pudo generar la receta. Intenta de nuevo.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRecipeImages = async (recipeNames: string[]): Promise<{ [recipeName: string]: string }> => {
    const imageMap: { [recipeName: string]: string } = {};
    
    // Define diverse food images based on recipe category/type
    const getDefaultImageForRecipe = (recipeName: string): string => {
      const name = recipeName.toLowerCase();
      
      if (name.includes('ensalada') || name.includes('salad')) {
        return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=300&fit=crop'; // Salad
      } else if (name.includes('pollo') || name.includes('chicken')) {
        return 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&h=300&fit=crop'; // Chicken
      } else if (name.includes('salmón') || name.includes('salmon') || name.includes('pescado')) {
        return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&h=300&fit=crop'; // Salmon
      } else if (name.includes('omelette') || name.includes('huevo') || name.includes('egg')) {
        return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&h=300&fit=crop'; // Eggs
      } else if (name.includes('avena') || name.includes('oats')) {
        return 'https://images.unsplash.com/photo-1571197238394-0090f3fde7df?w=500&h=300&fit=crop'; // Oats
      } else if (name.includes('tostada') || name.includes('toast')) {
        return 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=500&h=300&fit=crop'; // Avocado toast
      } else if (name.includes('quinoa')) {
        return 'https://images.unsplash.com/photo-1505576633757-0ac1084af824?w=500&h=300&fit=crop'; // Quinoa bowl
      } else if (name.includes('bowl')) {
        return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop'; // Buddha bowl
      } else if (name.includes('sopa') || name.includes('soup')) {
        return 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&h=300&fit=crop'; // Soup
      } else if (name.includes('pasta')) {
        return 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=500&h=300&fit=crop'; // Pasta
      } else {
        return 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=500&h=300&fit=crop'; // Generic healthy food
      }
    };
    
    console.log(`🖼️ Starting image generation for ${recipeNames.length} recipes`);
    
    // Generate images one by one with more conservative delays
    for (let i = 0; i < recipeNames.length; i++) {
      const recipeName = recipeNames[i];
      const defaultImage = getDefaultImageForRecipe(recipeName);
      
      console.log(`\n🎨 Generating image ${i + 1}/${recipeNames.length}: "${recipeName}"`);
      
      // Start with fallback image and try to improve it
      imageMap[recipeName] = defaultImage;
      
      let imageGenerated = false;
      let retryCount = 0;
      const maxRetries = 2; // Reduced retries to avoid long waits
      
      // TEMPORALMENTE DESHABILITADO: Generación de imágenes para ahorrar créditos
      console.log(`⚠️ Generación AI deshabilitada - usando imagen placeholder para "${recipeName}"`);
      imageGenerated = true; // Usar siempre fallback
      
      // Reduced delay between requests to 12 seconds
      if (i < recipeNames.length - 1) {
        const delay = 12000;
        console.log(`⏱️ Waiting ${delay/1000}s before next image...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    const aiSuccessCount = Object.values(imageMap).filter(url => 
      !url.includes('unsplash.com')).length;
    console.log(`🏁 Image generation complete: ${aiSuccessCount}/${recipeNames.length} AI images, ${recipeNames.length - aiSuccessCount} fallbacks`);
    
    return imageMap;
  };

  const generateMultipleRecipes = async (request: GenerateRecipeRequest, count: number = 3, showToast: boolean = true): Promise<Recipe[]> => {
    const recipes: Recipe[] = [];
    const sessionTitles = new Set<string>();
    
    // Get all existing recipe titles from global registry and localStorage
    const existingAIRecipes = JSON.parse(localStorage.getItem('aiGeneratedRecipes') || '[]');
    const existingTitles = new Set(existingAIRecipes.map((r: Recipe) => r.title));
    const globalTitles = registry.getAllTitles();
    const allExistingTitles = new Set([...existingTitles, ...globalTitles]);
    
    console.log(`Starting sequential generation of ${count} recipes`);
    console.log(`Found ${allExistingTitles.size} existing recipes to avoid`);
    
    // Define meal-specific prompts to ensure proper categorization
    const getMealSpecificPrompts = (meals: string[]) => {
      const prompts: string[] = [];
      
      meals.forEach(meal => {
        switch(meal.toLowerCase()) {
          case 'desayuno':
            prompts.push(
              "DEBE ser una receta de DESAYUNO: huevos, tostadas, cereales, yogur, frutas, avena, batidos",
              "DESAYUNO típico: omelette, tostadas con aguacate, yogur con granola, avena, frutas"
            );
            break;
          case 'almuerzo':
            prompts.push(
              "DEBE ser una receta de ALMUERZO: ensaladas sustanciosas, platos principales, proteínas con acompañantes",
              "ALMUERZO completo: pollo/pescado/carne con verduras, ensaladas con proteína, pasta, quinoa"
            );
            break;
          case 'cena':
            prompts.push(
              "DEBE ser una receta de CENA: platos ligeros pero nutritivos, pescado, verduras, sopas",
              "CENA saludable: salmón, verduras al vapor, sopas nutritivas, ensaladas ligeras"
            );
            break;
        }
      });
      
      return prompts;
    };
    
    // Add variety prompts to ensure different recipes
    const varietyPrompts = [
      "Genera una receta mediterránea saludable",
      "Crea una receta asiática con ingredientes frescos", 
      "Diseña una receta mexicana auténtica",
      "Elabora una receta italiana tradicional",
      "Inventa una receta vegetariana nutritiva",
      "Desarrolla una receta con proteínas magras",
      "Crea una receta rica en fibra y vitaminas",
      "Diseña una receta baja en carbohidratos",
      "Elabora una receta con legumbres como protagonista",
      "Inventa una receta de pescado al horno",
      "Desarrolla una receta con quinoa o arroz integral",
      "Crea una receta de pollo con verduras al vapor",
      "Prepara una receta francesa clásica",
      "Diseña una receta peruana sabrosa",
      "Crea una receta india con especias",
      "Elabora una receta tailandesa picante",
      "Inventa una receta griega tradicional",
      "Desarrolla una receta marroquí aromática",
      "Crea una receta japonesa equilibrada",
      "Diseña una receta brasileña tropical",
      "Elabora una receta nórdica con pescado",
      "Crea una receta turca especiada",
      "Diseña una receta argentina parrillada",
      "Inventa una receta coreana fermentada"
    ];
    
    // Generate recipes SEQUENTIALLY to avoid duplicates
    for (let i = 0; i < count; i++) {
      console.log(`\n🍳 Generating recipe ${i + 1} of ${count}`);
      
      const maxRetries = 8;
      let recipeGenerated = false;
      
      for (let retry = 0; retry < maxRetries && !recipeGenerated; retry++) {
        try {
          // Create unique constraints for each attempt
          const varietyIndex = (i * 7 + retry * 3) % varietyPrompts.length;
          const secondaryVarietyIndex = (i * 11 + retry * 5 + 13) % varietyPrompts.length;
          const tertiaryVarietyIndex = (i * 13 + retry * 7 + 19) % varietyPrompts.length;
          
          const mealSpecificPrompts = getMealSpecificPrompts(request.meals);
          const allExistingArray = Array.from(allExistingTitles);
          const sessionArray = Array.from(sessionTitles);
          
          const uniquePrompts = [
            ...mealSpecificPrompts,
            varietyPrompts[varietyIndex],
            varietyPrompts[secondaryVarietyIndex],
            varietyPrompts[tertiaryVarietyIndex],
            `PROHIBIDO repetir estas ${allExistingArray.length} recetas existentes: ${allExistingArray.join(', ')}`,
            `PROHIBIDO repetir estas ${sessionArray.length} recetas de esta sesión: ${sessionArray.join(', ')}`,
            `Receta única #${i + 1}, ingredientes y técnicas COMPLETAMENTE diferentes`,
            `Evita: ${allExistingArray.slice(-8).join(', ')}`,
            `Timestamp: ${Date.now()}-${retry}`,
            `Creatividad máxima, combinaciones únicas de ingredientes`
          ];
          
          const enhancedRequest = {
            ...request,
            restrictions: [...(request.restrictions || []), ...uniquePrompts]
          };
          
          // Add progressive delay between requests
          const delay = Math.min((i * 1000) + (retry * 2000), 8000);
          if (delay > 0) {
            console.log(`⏱️ Waiting ${delay}ms before generation...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          console.log(`🎯 Attempt ${retry + 1}: Using variety "${varietyPrompts[varietyIndex]}"`);
          
          // Generate recipe text
          const { data: recipeData, error: recipeError } = await supabase.functions.invoke(
            'generate-recipe',
            {
              body: enhancedRequest
            }
          );

          if (recipeError) {
            throw new Error(`Error generating recipe: ${recipeError.message}`);
          }

          const recipe = recipeData.recipe;
          
          if (recipe && 
              !sessionTitles.has(recipe.title) && 
              !allExistingTitles.has(recipe.title)) {
            
            // Add recipe with default image
            const newRecipe: Recipe = {
              ...recipe,
              image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=500&h=300&fit=crop'
            };
            
            recipes.push(newRecipe);
            sessionTitles.add(recipe.title);
            allExistingTitles.add(recipe.title);
            
            // Add to global registry
            registry.addRecipe(newRecipe);
            
            console.log(`✅ SUCCESS: Generated unique recipe: "${recipe.title}"`);
            recipeGenerated = true;
          } else if (recipe) {
            const isDuplicateSession = sessionTitles.has(recipe.title);
            const isDuplicateGlobal = allExistingTitles.has(recipe.title);
            console.log(`❌ DUPLICATE: "${recipe.title}" (${isDuplicateSession ? 'session' : 'global'} duplicate)`);
          } else {
            console.error(`❌ INVALID: No valid recipe returned on attempt ${retry + 1}`);
          }
        } catch (error) {
          console.error(`💥 ERROR: Recipe ${i + 1}, attempt ${retry + 1}:`, error);
          // Add longer delay on error
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      if (!recipeGenerated) {
        console.warn(`⚠️ FAILED: Could not generate unique recipe ${i + 1} after ${maxRetries} attempts`);
      }
    }
    
    // Now generate all images in batches
    if (recipes.length > 0) {
      console.log(`Generating images for ${recipes.length} recipes using batching...`);
      const recipeNames = recipes.map(recipe => recipe.title);
      const imageMap = await generateRecipeImages(recipeNames);
      
      // Update recipes with generated images
      recipes.forEach(recipe => {
        if (imageMap[recipe.title]) {
          recipe.image = imageMap[recipe.title];
        }
      });
    }
    
    // Save recipes to localStorage so they persist across page navigation
    if (recipes.length > 0) {
      localStorage.setItem('aiGeneratedRecipes', JSON.stringify(recipes));
      console.log(`Saved ${recipes.length} AI recipes to localStorage`);
    }
    
    console.log(`Completed generation. Total successful recipes: ${recipes.length} out of ${count} requested`);
    return recipes;
  };

  return {
    generateRecipe,
    generateMultipleRecipes,
    isGenerating
  };
};