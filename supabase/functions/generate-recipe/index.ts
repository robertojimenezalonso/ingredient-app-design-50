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

  try {
    const { people, days, meals, restrictions = [] }: RecipeRequest = await req.json();

    const restrictionsText = restrictions.length > 0 
      ? `Restricciones: ${restrictions.join(', ')}. ` 
      : '';

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'Eres un chef experto que genera recetas en formato JSON válido. Siempre responde SOLO con JSON válido, sin texto adicional.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const recipeText = data.choices[0].message.content;
    
    // Parse the JSON response
    let recipe;
    try {
      recipe = JSON.parse(recipeText);
    } catch (parseError) {
      console.error('Error parsing recipe JSON:', parseError);
      throw new Error('Invalid JSON response from OpenAI');
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