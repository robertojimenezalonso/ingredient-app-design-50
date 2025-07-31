import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecipeData {
  title: string;
  description: string;
  category: string;
  ingredients: Array<{name: string, amount: string, unit: string}>;
  instructions: string[];
  preparationTime: number;
  calories: number;
  macronutrients: {
    protein: number;
    fat: number;
    carbs: number;
  };
  micronutrients: Record<string, string>;
}

// Rate limiting helper
async function rateLimitedFetch(url: string, options: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '60');
        console.log(`Rate limited. Waiting ${retryAfter} seconds before retry ${attempt}/${maxRetries}`);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }
      }
      
      return response;
    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error.message);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
      } else {
        throw error;
      }
    }
  }
  
  throw new Error('Max retries exceeded');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting recipe bank generation...');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate fewer recipes at a time to avoid rate limiting
    const recipePlan = [
      { category: 'desayuno', count: 2 },
      { category: 'comida', count: 2 },
      { category: 'cena', count: 2 },
      { category: 'snack', count: 1 },
      { category: 'aperitivo', count: 1 },
      { category: 'merienda', count: 1 }
    ];

    const allGeneratedRecipes = [];

    for (const plan of recipePlan) {
      console.log(`Generating ${plan.count} recipes for category: ${plan.category}`);
      
      for (let i = 0; i < plan.count; i++) {
        try {
          console.log(`Generating recipe ${i + 1}/${plan.count} for ${plan.category}`);
          
          // Generate recipe text with improved retry logic
          const recipePrompt = `Crea una receta de ${plan.category} para 1 persona.
Incluye:
• Título atractivo de la receta
• Descripción breve y apetecible
• Ingredientes con cantidades exactas para 1 persona
• Pasos numerados para preparar la receta
• Tiempo estimado de preparación (en minutos)
• Calorías aproximadas
• Macronutrientes (proteínas, grasas, carbohidratos, en gramos)
• Micronutrientes (al menos vitaminas y minerales principales)

Responde en formato JSON con esta estructura exacta:
{
  "title": "Nombre de la receta",
  "description": "Descripción breve",
  "ingredients": [{"name": "ingrediente", "amount": "cantidad", "unit": "unidad"}],
  "instructions": ["paso 1", "paso 2"],
  "preparationTime": número_en_minutos,
  "calories": número_calorías,
  "macronutrients": {"protein": gramos, "fat": gramos, "carbs": gramos},
  "micronutrients": {"vitamina_c": "valor mg", "calcio": "valor mg", "hierro": "valor mg"}
}

La receta debe ser original y diferente de las anteriores.`;

          const recipeResponse = await rateLimitedFetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4.1-2025-04-14',
              messages: [
                { role: 'system', content: 'Eres un chef experto que crea recetas nutritivas y deliciosas. Responde siempre en JSON válido.' },
                { role: 'user', content: recipePrompt }
              ],
              temperature: 0.8,
              response_format: { type: "json_object" }
            }),
          });

          if (!recipeResponse.ok) {
            throw new Error(`Recipe generation failed: ${recipeResponse.status}`);
          }

          const recipeData = await recipeResponse.json();
          const recipe: RecipeData = JSON.parse(recipeData.choices[0].message.content);
          
          console.log(`Generated recipe: ${recipe.title}`);

          // Generate image with improved retry logic
          const imagePrompt = `Foto hiperrealista de ${recipe.title}, preparada y servida en un plato, vista cenital, fondo claro y luminoso, ingredientes principales visibles, estilo food photography profesional, alta calidad, iluminación natural, sin texto ni marcas de agua`;

          const imageResponse = await rateLimitedFetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'dall-e-3',
              prompt: imagePrompt,
              n: 1,
              size: '1024x1024',
              quality: 'hd',
              style: 'natural'
            }),
          });

          if (!imageResponse.ok) {
            throw new Error(`Image generation failed: ${imageResponse.status}`);
          }

          const imageData = await imageResponse.json();
          const imageUrl = imageData.data[0].url;
          
          console.log(`Generated image for: ${recipe.title}`);

          // Save to database
          const { error: insertError } = await supabase
            .from('recipe_bank')
            .insert({
              title: recipe.title,
              description: recipe.description,
              category: plan.category,
              image_url: imageUrl,
              preparation_time: recipe.preparationTime,
              calories: recipe.calories,
              servings: 1,
              ingredients: recipe.ingredients,
              instructions: recipe.instructions,
              macronutrients: recipe.macronutrients,
              micronutrients: recipe.micronutrients
            });

          if (insertError) {
            console.error('Database insert error:', insertError);
            throw new Error(`Failed to save recipe: ${insertError.message}`);
          }

          allGeneratedRecipes.push({
            title: recipe.title,
            category: plan.category,
            imageUrl
          });

          console.log(`Successfully saved recipe: ${recipe.title}`);
          
          // Longer delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds

        } catch (error) {
          console.error(`Error generating recipe ${i + 1} for ${plan.category}:`, error);
          
          // If rate limited, wait longer before continuing
          if (error.message.includes('429')) {
            console.log('Rate limited, waiting 2 minutes before continuing...');
            await new Promise(resolve => setTimeout(resolve, 120000)); // 2 minutes
          }
          
          // Continue with next recipe
        }
      }
      
      // Delay between categories
      console.log(`Completed ${plan.category}, waiting before next category...`);
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds
    }

    console.log(`Recipe bank generation completed. Generated ${allGeneratedRecipes.length} recipes.`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Generated ${allGeneratedRecipes.length} recipes`,
      recipes: allGeneratedRecipes
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-recipe-bank function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});