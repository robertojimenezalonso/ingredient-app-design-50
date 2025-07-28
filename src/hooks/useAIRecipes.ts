import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types/recipe';
import { toast } from '@/hooks/use-toast';

interface GenerateRecipeRequest {
  people: number;
  days: string[];
  meals: string[];
  restrictions?: string[];
}

export const useAIRecipes = () => {
  const [isGenerating, setIsGenerating] = useState(false);

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
    
    // Split into batches of 5 (OpenAI limit)
    const batches = [];
    for (let i = 0; i < recipeNames.length; i += 5) {
      batches.push(recipeNames.slice(i, i + 5));
    }
    
    console.log(`Generating images for ${recipeNames.length} recipes in ${batches.length} batch(es)`);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} recipes:`, batch);
      
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const { data: imageData, error: imageError } = await supabase.functions.invoke(
            'generate-recipe-image',
            {
              body: { recipeNames: batch }
            }
          );

          if (imageError) {
            // If it's a rate limit error, wait and retry
            if (imageError.message.includes('rate_limit_exceeded') || imageError.message.includes('429')) {
              console.log(`Rate limit hit for batch ${batchIndex + 1}, waiting before retry ${retryCount + 1}/${maxRetries}`);
              await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 15000)); // Wait 15s, 30s, 45s
              retryCount++;
              continue;
            } else {
              console.warn(`Error generating images for batch ${batchIndex + 1}:`, imageError.message);
              // Use default images for this batch
              batch.forEach(recipeName => {
                imageMap[recipeName] = defaultImage;
              });
              break;
            }
          } else if (imageData?.images) {
            // Process batch results
            imageData.images.forEach((result: any) => {
              if (result.success && result.imageUrl) {
                imageMap[result.recipeName] = result.imageUrl;
              } else {
                console.warn(`Failed to generate image for ${result.recipeName}:`, result.error);
                imageMap[result.recipeName] = defaultImage;
              }
            });
            console.log(`Successfully processed batch ${batchIndex + 1}`);
            break;
          } else {
            console.warn(`No image data returned for batch ${batchIndex + 1}`);
            batch.forEach(recipeName => {
              imageMap[recipeName] = defaultImage;
            });
            break;
          }
        } catch (error) {
          console.warn(`Image generation attempt failed for batch ${batchIndex + 1}:`, error);
          retryCount++;
          if (retryCount >= maxRetries) {
            // Use default images for failed batch
            batch.forEach(recipeName => {
              imageMap[recipeName] = defaultImage;
            });
          }
        }
      }
      
      // Add delay between batches to respect rate limits
      if (batchIndex < batches.length - 1) {
        console.log('Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return imageMap;
  };

  const generateMultipleRecipes = async (request: GenerateRecipeRequest, count: number = 3, showToast: boolean = true): Promise<Recipe[]> => {
    const recipes: Recipe[] = [];
    const generatedTitles = new Set<string>();
    
    console.log(`Starting sequential generation of ${count} recipes`);
    
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
      "Diseña una receta brasileña tropical"
    ];
    
    // Generate recipes SEQUENTIALLY to avoid duplicates
    for (let i = 0; i < count; i++) {
      console.log(`Generating recipe ${i + 1} of ${count}`);
      
      const maxRetries = 5;
      let recipeGenerated = false;
      
      for (let retry = 0; retry < maxRetries && !recipeGenerated; retry++) {
        try {
          // Create unique request with strong variety constraints
          const varietyIndex = (i * 3 + retry) % varietyPrompts.length;
          const secondaryVarietyIndex = (i * 5 + retry + 7) % varietyPrompts.length;
          
          const uniquePrompts = [
            varietyPrompts[varietyIndex],
            varietyPrompts[secondaryVarietyIndex],
            `NUNCA generes estas recetas ya creadas: ${Array.from(generatedTitles).join(', ')}`,
            `Receta número ${i + 1}, debe ser completamente diferente`,
            `Usa ingredientes y técnicas totalmente distintas`
          ];
          
          const enhancedRequest = {
            ...request,
            restrictions: [...(request.restrictions || []), ...uniquePrompts]
          };
          
          // Add delay between requests to avoid rate limits and improve uniqueness
          if (i > 0 || retry > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          console.log(`Attempting recipe generation with variety: ${varietyPrompts[varietyIndex]}`);
          
          // Generate recipe text only
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
          
          if (recipe && !generatedTitles.has(recipe.title)) {
            // Add recipe with default image for now
            recipes.push({
              ...recipe,
              image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=500&h=300&fit=crop'
            });
            generatedTitles.add(recipe.title);
            console.log(`✅ Successfully generated unique recipe: ${recipe.title}`);
            recipeGenerated = true;
          } else if (recipe && generatedTitles.has(recipe.title)) {
            console.log(`❌ Duplicate recipe detected (${recipe.title}), retrying with different constraints...`);
          } else {
            console.error(`❌ Failed to generate valid recipe on attempt ${retry + 1}`);
          }
        } catch (error) {
          console.error(`Error generating recipe ${i + 1}, attempt ${retry + 1}:`, error);
          // Add longer delay on error
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      if (!recipeGenerated) {
        console.warn(`⚠️ Failed to generate unique recipe ${i + 1} after ${maxRetries} attempts`);
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