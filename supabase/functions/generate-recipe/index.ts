import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

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

  console.log('Edge function started, checking Lovable AI API key...');
  
  if (!lovableApiKey) {
    console.error('Lovable AI API key not found in environment variables');
    return new Response(JSON.stringify({ error: 'Lovable AI API key not configured' }), {
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

    // Crear prompt más específico para cada comida
    const mealType = meals[0]; // Tomar la primera comida
    const dateStr = days[0]; // Tomar el primer día
    
    const prompt = `Genera UNA receta de ${mealType.toLowerCase()} para ${people} persona${people > 1 ? 's' : ''} para el día ${dateStr}. ${restrictionsText}

Devuelve SOLO un JSON válido con esta estructura EXACTA:
{
  "id": "string-único-con-fecha-y-comida",
  "title": "Nombre específico de la receta",
  "category": "${mealType === 'Desayuno' ? 'breakfast' : mealType === 'Almuerzo' ? 'lunch' : mealType === 'Cena' ? 'dinner' : 'snacks'}",
  "servings": ${people},
  "time": número_en_minutos,
  "calories": número_de_calorías,
  "ingredients": [
    {
      "id": "id-único-ingrediente",
      "name": "Nombre del ingrediente",
      "amount": "cantidad",
      "unit": "unidad",
      "selected": true
    }
  ],
  "instructions": [
    "Paso 1...",
    "Paso 2..."
  ],
  "macros": {
    "carbs": número,
    "protein": número,
    "fat": número
  },
  "nutrition": {
    "calories": número,
    "protein": número,
    "carbs": número,
    "fat": número,
    "fiber": número,
    "sugar": número
  }
}

IMPORTANTE: 
- Incluye 4-7 ingredientes realistas y específicos
- Haz que cada receta sea DIFERENTE a otras que puedas haber generado
- El título debe ser específico y atractivo
- Las cantidades deben ser realistas para ${people} persona${people > 1 ? 's' : ''}
- Los pasos deben ser claros y concisos (máximo 7 pasos)

La receta debe ser realista, saludable y adecuada para ${mealType.toLowerCase()}.`;

    console.log('Generated prompt:', prompt.substring(0, 200) + '...');

    console.log('Making request to Lovable AI Gateway...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'Eres un chef experto que genera recetas en formato JSON válido. Responde ÚNICAMENTE con JSON válido, sin texto adicional, sin comillas externas, sin markdown. Solo el objeto JSON puro.' 
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    console.log('Lovable AI response status:', response.status);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Lovable AI Gateway error:', data);
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits to your Lovable workspace.');
      }
      throw new Error(`Lovable AI Gateway error: ${data.error?.message || 'Unknown error'}`);
    }
    
    const recipeText = data.choices[0].message.content;
    console.log('Raw Lovable AI response:', recipeText);
    
    // Parse the JSON response
    let recipe;
    try {
      // Clean the response in case there are extra characters
      const cleanedText = recipeText.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
      recipe = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Error parsing recipe JSON:', parseError);
      console.error('Raw response:', recipeText);
      throw new Error(`Invalid JSON response from Lovable AI: ${parseError.message}`);
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