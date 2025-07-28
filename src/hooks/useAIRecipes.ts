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

      // Generate recipe image with retry logic for rate limits
      let imageUrl = 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=500&h=300&fit=crop';
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const { data: imageData, error: imageError } = await supabase.functions.invoke(
            'generate-recipe-image',
            {
              body: { recipeName: recipe.title }
            }
          );

          if (imageError) {
            // If it's a rate limit error, wait and retry
            if (imageError.message.includes('rate_limit_exceeded') || imageError.message.includes('429')) {
              console.log(`Rate limit hit, waiting before retry ${retryCount + 1}/${maxRetries}`);
              await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 15000)); // Wait 15s, 30s, 45s
              retryCount++;
              continue;
            } else {
              console.warn('Error generating image:', imageError.message);
              break;
            }
          } else if (imageData?.imageUrl) {
            imageUrl = imageData.imageUrl;
            break;
          }
        } catch (error) {
          console.warn('Image generation attempt failed:', error);
          retryCount++;
        }
      }

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
    const defaultImage = 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=500&h=300&fit=crop';
    
    console.log(`🖼️ Starting image generation for ${recipeNames.length} recipes`);
    
    // Generate images one by one to avoid rate limits completely
    for (let i = 0; i < recipeNames.length; i++) {
      const recipeName = recipeNames[i];
      console.log(`\n🎨 Generating image ${i + 1}/${recipeNames.length}: "${recipeName}"`);
      
      let imageGenerated = false;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries && !imageGenerated) {
        try {
          const { data: imageData, error: imageError } = await supabase.functions.invoke(
            'generate-recipe-image',
            {
              body: { recipeName }
            }
          );

          if (imageError) {
            if (imageError.message.includes('rate_limit_exceeded') || imageError.message.includes('429')) {
              const waitTime = (retryCount + 1) * 60000; // Wait 1min, 2min, 3min
              console.log(`⏳ Rate limit hit for "${recipeName}", waiting ${waitTime/1000}s (attempt ${retryCount + 1}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              retryCount++;
              continue;
            } else {
              console.warn(`❌ Error generating image for "${recipeName}":`, imageError.message);
              imageMap[recipeName] = defaultImage;
              imageGenerated = true;
            }
          } else if (imageData?.imageUrl) {
            console.log(`✅ Successfully generated image for "${recipeName}"`);
            imageMap[recipeName] = imageData.imageUrl;
            imageGenerated = true;
          } else {
            console.warn(`⚠️ No image URL returned for "${recipeName}"`);
            imageMap[recipeName] = defaultImage;
            imageGenerated = true;
          }
        } catch (error) {
          console.warn(`💥 Image generation failed for "${recipeName}":`, error);
          retryCount++;
          if (retryCount >= maxRetries) {
            imageMap[recipeName] = defaultImage;
            imageGenerated = true;
          }
        }
      }
      
      // Add delay between individual requests to respect rate limits
      if (i < recipeNames.length - 1) {
        const delay = 15000; // 15 seconds between each image
        console.log(`⏱️ Waiting ${delay/1000}s before next image...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    const successCount = Object.values(imageMap).filter(url => url !== defaultImage).length;
    console.log(`🏁 Image generation complete: ${successCount}/${recipeNames.length} successful`);
    
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