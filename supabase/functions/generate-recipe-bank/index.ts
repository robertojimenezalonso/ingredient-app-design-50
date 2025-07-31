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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting recipe bank generation...');
    
    if (!openAIApiKey) {
      console.error('Missing OpenAI API key');
      throw new Error('OpenAI API key not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client created successfully');

    // Test with just one simple recipe first
    const recipePrompt = `Crea una receta de desayuno para 1 persona.
Responde en formato JSON con esta estructura exacta:
{
  "title": "Tostadas con aguacate",
  "description": "Deliciosas tostadas con aguacate fresco",
  "ingredients": [{"name": "pan integral", "amount": "2", "unit": "rebanadas"}],
  "instructions": ["Tostar el pan", "Agregar aguacate"],
  "preparationTime": 10,
  "calories": 250,
  "macronutrients": {"protein": 8, "fat": 12, "carbs": 30},
  "micronutrients": {"vitamina_c": "10mg", "calcio": "100mg"}
}`;

    console.log('Making request to OpenAI...');
    
    const recipeResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'Eres un chef experto. Responde siempre en JSON válido.' },
          { role: 'user', content: recipePrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    console.log('OpenAI response status:', recipeResponse.status);

    if (!recipeResponse.ok) {
      const errorText = await recipeResponse.text();
      console.error('OpenAI error:', errorText);
      throw new Error(`Recipe generation failed: ${recipeResponse.status} - ${errorText}`);
    }

    const recipeData = await recipeResponse.json();
    const recipe = JSON.parse(recipeData.choices[0].message.content);
    
    console.log('Generated recipe:', recipe.title);

    // Use a placeholder image for now to avoid DALL-E rate limits
    const imageUrl = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1024&h=1024&fit=crop';
    
    console.log('Saving to database...');

    // Save to database
    const { data, error: insertError } = await supabase
      .from('recipe_bank')
      .insert({
        title: recipe.title,
        description: recipe.description,
        category: 'desayuno',
        image_url: imageUrl,
        preparation_time: recipe.preparationTime,
        calories: recipe.calories,
        servings: 1,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        macronutrients: recipe.macronutrients,
        micronutrients: recipe.micronutrients
      })
      .select();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error(`Failed to save recipe: ${insertError.message}`);
    }

    console.log('Recipe saved successfully:', data);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Generated 1 test recipe successfully',
      recipes: [{
        title: recipe.title,
        category: 'desayuno',
        imageUrl
      }]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-recipe-bank function:', error);
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