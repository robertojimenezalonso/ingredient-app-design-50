import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecipeRequest {
  people: number;
  days: string[];
  meals: string[];
  restrictions?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Edge function started, checking OpenAI API key...');
  
  if (!openAIApiKey) {
    console.error('OpenAI API key not found in environment variables');
    return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log('Parsing request body...');
    const { people, days, meals, restrictions = [] }: RecipeRequest = await req.json();

    const restrictionsText = restrictions.length > 0 
      ? `Restricciones: ${restrictions.join(', ')}. ` 
      : '';

    console.log('Request parsed:', { people, days: days.length, meals: meals.length, restrictions });

    const prompt = `Genera una receta personalizada con las siguientes especificaciones:
- Para ${people} persona${people > 1 ? 's' : ''}
- Días: ${days.join(', ')}
- Comidas: ${meals.join(', ')}
- ${restrictionsText}

Devuelve SOLO un JSON válido con la siguiente estructura:
{
  "id": "string único",
  "title": "nombre de la receta",
  "category": "breakfast|lunch|dinner|snacks|desserts",
  "servings": ${people},
  "time": "tiempo en minutos (número)",
  "calories": "calorías por porción (número)",
  "ingredients": [
    {
      "id": "string único",
      "name": "nombre del ingrediente",
      "amount": "cantidad",
      "unit": "unidad",
      "selected": true
    }
  ],
  "instructions": ["paso 1", "paso 2", "..."],
  "macros": {
    "carbs": "número",
    "protein": "número", 
    "fat": "número"
  },
  "nutrition": {
    "calories": "número",
    "protein": "número",
    "carbs": "número", 
    "fat": "número",
    "fiber": "número",
    "sugar": "número"
  }
}

La receta debe ser realista, saludable y adecuada para las especificaciones dadas.`;

    console.log('Generated prompt:', prompt.substring(0, 200) + '...');

    console.log('Making request to OpenAI...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'Eres un chef experto que genera recetas en formato JSON válido. Responde ÚNICAMENTE con JSON válido, sin texto adicional, sin comillas externas, sin markdown. Solo el objeto JSON puro.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    console.log('OpenAI response status:', response.status);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    const recipeText = data.choices[0].message.content;
    console.log('Raw OpenAI response:', recipeText);
    
    // Parse the JSON response
    let recipe;
    try {
      // Clean the response in case there are extra characters
      const cleanedText = recipeText.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
      recipe = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Error parsing recipe JSON:', parseError);
      console.error('Raw response:', recipeText);
      throw new Error(`Invalid JSON response from OpenAI: ${parseError.message}`);
    }

    return new Response(JSON.stringify({ recipe }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-recipe function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});