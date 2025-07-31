
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
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

// Function to download image from URL and upload to Supabase Storage
async function downloadAndUploadImage(imageUrl: string, fileName: string): Promise<string> {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipeName, recipeNames }: ImageRequest = await req.json();
    
    // Determine if this is a single recipe or batch request
    const isMultiple = recipeNames && recipeNames.length > 0;
    const recipesToProcess = isMultiple ? recipeNames! : [recipeName!];
    
    // Validate batch size (max 5 as per OpenAI limit)
    if (recipesToProcess.length > 5) {
      throw new Error('Maximum 5 recipes per batch allowed due to OpenAI API limits');
    }

    console.log(`Generating images for ${recipesToProcess.length} recipe(s):`, recipesToProcess);

    if (isMultiple && recipesToProcess.length > 1) {
      // Batch processing: generate multiple images in one API call
      const prompts = recipesToProcess.map(name => 
        `Foto realista de ${name}, preparada y servida en un plato, vista cenital, ingredientes principales visibles, estilo food photography profesional, alta calidad, iluminación natural`
      );

      console.log('Making batch request to OpenAI with prompts:', prompts);

      // For multiple images, we need to make separate calls as DALL-E doesn't support multiple different prompts in one call
      const imageResults = await Promise.all(
        prompts.map(async (prompt, index) => {
          try {
            const response = await fetch('https://api.openai.com/v1/images/generations', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openAIApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'dall-e-3',
                prompt: prompt,
                n: 1,
                size: '1024x1024',
                quality: 'hd',
                style: 'natural'
              }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error(`OpenAI API error for recipe ${recipesToProcess[index]}:`, errorText);
              throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            
            // Download and upload the image to Supabase Storage
            const permanentImageUrl = await downloadAndUploadImage(
              data.data[0].url, 
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
      const prompt = `Foto realista de ${recipesToProcess[0]}, preparada y servida en un plato, vista cenital, ingredientes principales visibles, estilo food photography profesional, alta calidad, iluminación natural`;

      console.log('Making single request to OpenAI with prompt:', prompt);

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          style: 'natural'
        }),
      });

      console.log('OpenAI response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('OpenAI response data:', JSON.stringify(data, null, 2));

      // Verificar que la respuesta tiene la estructura esperada
      if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
        console.error('Invalid response structure from OpenAI:', data);
        throw new Error('Invalid response structure from OpenAI API');
      }

      const imageUrl = data.data[0].url;
      
      if (!imageUrl) {
        console.error('No image URL in response:', data.data[0]);
        throw new Error('No image URL returned from OpenAI API');
      }

      console.log('Successfully generated image URL:', imageUrl);

      // Download and upload the image to Supabase Storage
      const permanentImageUrl = await downloadAndUploadImage(imageUrl, recipesToProcess[0]);

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
