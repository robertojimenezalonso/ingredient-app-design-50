import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
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
    protein: { grams: number; percentage: number };
    fat: { grams: number; percentage: number };
    carbs: { grams: number; percentage: number };
  };
  micronutrients: Record<string, string>;
}

// Function to download image from URL and upload to Supabase Storage
async function downloadAndUploadImage(supabase: any, imageUrl: string, fileName: string): Promise<string> {
  console.log('Downloading image from OpenAI URL:', imageUrl);
  
  // Download the image from OpenAI
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.status}`);
  }
  
  const imageBlob = await imageResponse.blob();
  const imageBuffer = await imageBlob.arrayBuffer();
  
  console.log('Image downloaded, size:', imageBuffer.byteLength, 'bytes');
  
  // Generate unique filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const uniqueFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
  
  console.log('Uploading to Supabase Storage with filename:', uniqueFileName);
  
  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('recipe-images')
    .upload(uniqueFileName, imageBuffer, {
      contentType: 'image/png',
      upsert: false
    });
    
  if (uploadError) {
    console.error('Error uploading to Supabase Storage:', uploadError);
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }
  
  console.log('Successfully uploaded to Storage:', uploadData.path);
  
  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from('recipe-images')
    .getPublicUrl(uploadData.path);
    
  const publicUrl = publicUrlData.publicUrl;
  console.log('Public URL:', publicUrl);
  
  return publicUrl;
}

// Rate limiting helper with exponential backoff
async function rateLimitedFetch(url: string, options: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '60');
        const backoffTime = Math.min(retryAfter * 1000, Math.pow(2, attempt) * 30000); // Max 30s
        console.log(`Rate limited. Waiting ${backoffTime/1000} seconds before retry ${attempt}/${maxRetries}`);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          continue;
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return response;
    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error.message);
      if (attempt < maxRetries) {
        const backoffTime = Math.pow(2, attempt) * 5000; // 5s, 10s, 20s
        await new Promise(resolve => setTimeout(resolve, backoffTime));
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
    let category = null;
    
    // Try to parse request body if it exists
    try {
      const body = await req.text();
      if (body) {
        const parsed = JSON.parse(body);
        category = parsed.category;
      }
    } catch (e) {
      // No body or invalid JSON, use default (all categories)
    }
    
    console.log('Starting recipe bank generation with Lovable AI...', category ? `for category: ${category}` : 'for all categories');
    
    if (!lovableApiKey) {
      throw new Error('Lovable AI API key not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Recipe plan - reduced to 5 recipes per category for efficient quota usage
    const allCategories = [
      { category: 'desayuno', count: 5 },
      { category: 'comida', count: 5 },
      { category: 'cena', count: 5 },
      { category: 'snack', count: 5 },
      { category: 'aperitivo', count: 5 },
      { category: 'merienda', count: 5 }
    ];

    // Filter recipe plan based on category parameter
    const recipePlan = category 
      ? allCategories.filter(plan => plan.category === category)
      : allCategories;

    const allGeneratedRecipes = [];
    let totalProcessed = 0;
    const totalToGenerate = recipePlan.reduce((sum, plan) => sum + plan.count, 0);

    for (const plan of recipePlan) {
      console.log(`\n=== Generating ${plan.count} recipes for category: ${plan.category} ===`);
      
      for (let i = 0; i < plan.count; i++) {
        try {
          totalProcessed++;
          console.log(`\n[${totalProcessed}/${totalToGenerate}] Generating recipe ${i + 1}/${plan.count} for ${plan.category}`);
          
          // Generate recipe text with variety enforcement
          const categoryInstructions = {
            'desayuno': 'Crea recetas variadas como: smoothie bowls, tortillas, huevos revueltos, avena, yogur con granola, pancakes, etc. EVITA repetir tostadas.',
            'comida': 'Crea recetas variadas como: ensaladas, sopas, pasta, arroz, pollo, pescado, legumbres, verduras salteadas, etc.',
            'cena': 'Crea recetas variadas como: cremas, carnes magras, pescados, verduras al horno, ensaladas tibias, sopas ligeras, etc.',
            'snack': 'Crea snacks saludables como: frutos secos, yogur, frutas, barritas caseras, etc.',
            'aperitivo': 'Crea aperitivos como: hummus con vegetales, rollos de verduras, bruschettas variadas, etc.',
            'merienda': 'Crea meriendas como: batidos, frutas con frutos secos, galletas caseras, etc.'
          };

          const currentCategory = plan.category;
          const recipePrompt = `Crea una receta ÚNICA y VARIADA de ${currentCategory} para 1 persona.

IMPORTANTE: ${categoryInstructions[currentCategory] || 'Crea una receta original y variada.'}

Cada receta debe ser completamente diferente en:
- Tipo de preparación (NO solo tostadas)
- Ingredientes principales
- Técnica de cocción
- Estilo culinario

Incluye:
• Título atractivo y específico de la receta
• Descripción breve y apetecible
• Ingredientes con cantidades exactas para 1 persona
• Pasos numerados para preparar la receta
• Tiempo estimado de preparación (en minutos)
• Calorías aproximadas
• Macronutrientes en gramos Y en porcentaje del aporte calórico total
• Micronutrientes (al menos vitaminas y minerales principales)

IMPORTANTE para macronutrientes:
- Proporciona los valores en gramos por ración
- Calcula también el porcentaje del aporte calórico total de cada macro
- Recuerda: 1g proteína = 4 kcal, 1g carbohidratos = 4 kcal, 1g grasa = 9 kcal

Responde en formato JSON con esta estructura exacta:
{
  "title": "Nombre específico de la receta",
  "description": "Descripción breve",
  "ingredients": [{"name": "ingrediente", "amount": "cantidad", "unit": "unidad"}],
  "instructions": ["paso 1", "paso 2"],
  "preparationTime": número_en_minutos,
  "calories": número_calorías,
  "macronutrients": {
    "protein": {"grams": gramos, "percentage": porcentaje_calorico},
    "fat": {"grams": gramos, "percentage": porcentaje_calorico},
    "carbs": {"grams": gramos, "percentage": porcentaje_calorico}
  },
  "micronutrients": {"vitamina_c": "valor mg", "calcio": "valor mg", "hierro": "valor mg"}
}

RECUERDA: Debe ser una receta totalmente original y diferente a cualquier tostada.`;

          console.log('Calling Lovable AI for recipe generation...');
          const recipeResponse = await rateLimitedFetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: 'Eres un chef experto que crea recetas nutritivas y deliciosas. Responde siempre en JSON válido.' },
                { role: 'user', content: recipePrompt }
              ],
              response_format: { type: "json_object" }
            }),
          });

          const recipeData = await recipeResponse.json();
          const recipe: RecipeData = JSON.parse(recipeData.choices[0].message.content);
          
          console.log(`✓ Generated recipe: "${recipe.title}"`);

          // Generate detailed, realistic image prompt based on actual ingredients
          const ingredientsList = recipe.ingredients.map(ing => ing.name).join(', ');
          const imagePrompt = `Fotografía profesional ultra realista de ${recipe.title}, servidas en una mesa de madera rústica, ángulo lateral ligeramente elevado (3/4), luz natural cálida y suave, colores ricos y vibrantes. Ingredientes claramente visibles y enfocados: ${ingredientsList}. Ambiente acogedor de restaurante, textura y detalles de los alimentos en primer plano, presentación elegante pero casera, sombras naturales, colores saturados pero realistas, estilo de fotografía gastronómica profesional, alta definición. Sin texto, logotipos, personas, cubiertos ni objetos ajenos a la comida.`;

          console.log('Calling Lovable AI for realistic image generation...');
          console.log('Image prompt:', imagePrompt);
          const imageResponse = await rateLimitedFetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-image-preview',
              messages: [
                { role: 'user', content: imagePrompt }
              ],
              max_tokens: 1024
            }),
          });

          const imageData = await imageResponse.json();
          // Gemini image model returns base64 encoded image in the content
          const base64Image = imageData.choices[0].message.content;
          
          // Convert base64 to blob and upload
          const imageBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const uniqueFileName = `${timestamp}-${recipe.title.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('recipe-images')
            .upload(uniqueFileName, imageBuffer, {
              contentType: 'image/png',
              upsert: false
            });
            
          if (uploadError) {
            throw new Error(`Failed to upload image: ${uploadError.message}`);
          }
          
          const { data: publicUrlData } = supabase.storage
            .from('recipe-images')
            .getPublicUrl(uploadData.path);
            
          const temporaryImageUrl = publicUrlData.publicUrl;
          
          console.log(`✓ Generated temporary image for: "${recipe.title}"`);

          // Download and upload the image to Supabase Storage for permanent storage
          console.log('Downloading and uploading image to Supabase Storage...');
          const permanentImageUrl = await downloadAndUploadImage(supabase, temporaryImageUrl, recipe.title);
          console.log(`✓ Image permanently stored: ${permanentImageUrl}`);

          // Save to database with permanent image URL
          console.log('Saving to database...');
          console.log(`Saving recipe "${recipe.title}" with category: ${currentCategory}`);
          const { error: insertError } = await supabase
            .from('recipe_bank')
            .insert({
              title: recipe.title,
              description: recipe.description,
              category: currentCategory,
              image_url: permanentImageUrl,
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
            category: currentCategory,
            imageUrl: permanentImageUrl
          });

          console.log(`✓ Successfully saved recipe: "${recipe.title}"`);
          console.log(`Progress: ${totalProcessed}/${totalToGenerate} recipes completed`);
          
          // Smart delay: shorter for different categories, longer for same API calls
          if (i < plan.count - 1) {
            console.log('Waiting 8 seconds before next recipe...');
            await new Promise(resolve => setTimeout(resolve, 8000)); // 8 seconds between recipes
          }

        } catch (error) {
          console.error(`❌ Error generating recipe ${i + 1} for ${plan.category}:`, error.message);
          
          // If rate limited, wait longer before continuing
          if (error.message.includes('429') || error.message.includes('Rate limit')) {
            console.log('Rate limited, waiting 90 seconds before continuing...');
            await new Promise(resolve => setTimeout(resolve, 90000)); // 90 seconds
          } else {
            // For other errors, continue with shorter delay
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds
          }
        }
      }
      
      // Longer delay between categories
      if (recipePlan.indexOf(plan) < recipePlan.length - 1) {
        console.log(`\n✓ Completed ${plan.category} category. Waiting 15 seconds before next category...`);
        await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds
      }
    }

    console.log(`\n🎉 Recipe bank generation completed! Generated ${allGeneratedRecipes.length}/${totalToGenerate} recipes successfully.`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Generated ${allGeneratedRecipes.length} recipes with Lovable AI images`,
      total: allGeneratedRecipes.length,
      target: totalToGenerate,
      recipes: allGeneratedRecipes
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Critical error in generate-recipe-bank function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});