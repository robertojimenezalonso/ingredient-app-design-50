
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageRequest {
  recipeName?: string; // For single recipe (backward compatibility)
  recipeNames?: string[]; // For batch processing (up to 5)
}

// Sanitize recipe name to prevent injection attacks
function sanitizeRecipeName(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid recipe name');
  }
  
  return name
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/[^\w\s\-,.áéíóúñÁÉÍÓÚÑ]/g, '') // Allow only safe characters
    .trim()
    .slice(0, 200); // Limit length to 200 characters
}

// Function to upload base64 image to Supabase Storage
async function uploadBase64Image(base64Data: string, fileName: string): Promise<string> {
  console.log('Converting base64 image to buffer...');
  
  // Convert base64 to buffer
  const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  
  console.log('Image buffer size:', imageBuffer.byteLength, 'bytes');
  
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate request body size (max 10KB)
    const bodySize = JSON.stringify(body).length;
    if (bodySize > 10240) {
      throw new Error('Request body too large');
    }
    
    const { recipeName, recipeNames }: ImageRequest = body;
    
    // Sanitize inputs
    const sanitizedRecipeName = recipeName ? sanitizeRecipeName(recipeName) : undefined;
    const sanitizedRecipeNames = recipeNames?.map(name => sanitizeRecipeName(name));
    
    // Determine if this is a single recipe or batch request
    const isMultiple = sanitizedRecipeNames && sanitizedRecipeNames.length > 0;
    const recipesToProcess = isMultiple ? sanitizedRecipeNames : [sanitizedRecipeName!];
    
    // Validate batch size (max 5 as per OpenAI limit)
    if (recipesToProcess.length > 5) {
      throw new Error('Maximum 5 recipes per batch allowed due to OpenAI API limits');
    }

    console.log(`Generating images for ${recipesToProcess.length} recipe(s):`, recipesToProcess);

    if (isMultiple && recipesToProcess.length > 1) {
      // Batch processing: generate multiple images in one API call
      const prompts = recipesToProcess.map(name => 
        `Ultra-realistic, professional food photography of ${name}. Perfect golden-brown texture, beautifully melted cheese visible, fresh spinach leaves and sautéed mushrooms clearly shown. Served on elegant white ceramic plate, shot from slight angle to show thickness and layers. Restaurant-quality presentation with natural lighting, shallow depth of field, macro details showing appetizing textures. Photorealistic, award-winning culinary photography style, 8K resolution quality.`
      );

      console.log('Making batch request to Lovable AI with prompts:', prompts);

      // For multiple images, we need to make separate calls
      const imageResults = await Promise.all(
        prompts.map(async (prompt, index) => {
          try {
            const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${lovableApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash-image-preview',
                messages: [
                  { role: 'user', content: prompt }
                ],
                max_tokens: 1024
              }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Lovable AI error for recipe ${recipesToProcess[index]}:`, errorText);
              if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
              }
              if (response.status === 402) {
                throw new Error('Payment required. Please add credits to your Lovable workspace.');
              }
              throw new Error(`Lovable AI error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const base64Image = data.choices[0].message.content;
            
            // Upload base64 image to Supabase Storage
            const permanentImageUrl = await uploadBase64Image(
              base64Image, 
              recipesToProcess[index]
            );
            
            return {
              recipeName: recipesToProcess[index],
              imageUrl: permanentImageUrl,
              success: true
            };
          } catch (error) {
            console.error(`Error generating image for ${recipesToProcess[index]}:`, error);
            return {
              recipeName: recipesToProcess[index],
              imageUrl: null,
              success: false,
              error: error.message
            };
          }
        })
      );

      console.log('Batch generation completed. Results:', imageResults);

      return new Response(JSON.stringify({ images: imageResults }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Single recipe processing (backward compatibility)
      const prompt = `Ultra-realistic, professional food photography of ${recipesToProcess[0]}. Perfect golden-brown texture, beautifully melted cheese visible, fresh spinach leaves and sautéed mushrooms clearly shown. Served on elegant white ceramic plate, shot from slight angle to show thickness and layers. Restaurant-quality presentation with natural lighting, shallow depth of field, macro details showing appetizing textures. Photorealistic, award-winning culinary photography style, 8K resolution quality.`;

      console.log('Making single request to Lovable AI with prompt:', prompt);

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 1024
        }),
      });

      console.log('Lovable AI response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lovable AI error:', errorText);
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (response.status === 402) {
          throw new Error('Payment required. Please add credits to your Lovable workspace.');
        }
        throw new Error(`Lovable AI error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Lovable AI response data:', JSON.stringify(data, null, 2));

      // Verificar que la respuesta tiene la estructura esperada
      if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        console.error('Invalid response structure from Lovable AI:', data);
        throw new Error('Invalid response structure from Lovable AI Gateway');
      }

      const base64Image = data.choices[0].message.content;
      
      if (!base64Image) {
        console.error('No image data in response:', data.choices[0]);
        throw new Error('No image data returned from Lovable AI Gateway');
      }

      console.log('Successfully generated image');

      // Upload base64 image to Supabase Storage
      const permanentImageUrl = await uploadBase64Image(base64Image, recipesToProcess[0]);

      return new Response(JSON.stringify({ imageUrl: permanentImageUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-recipe-image function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
