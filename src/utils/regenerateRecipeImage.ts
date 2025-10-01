import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeInput } from "@/lib/validation";

export const regenerateRecipeImage = async (recipeId: string, recipeTitle: string) => {
  // TEMPORALMENTE DESHABILITADO: Generación de imágenes para ahorrar créditos
  toast.info('⚠️ La generación de imágenes está temporalmente deshabilitada para ahorrar créditos');
  console.log('⚠️ Regeneración de imágenes DESHABILITADA');
  return;
  
  /* CÓDIGO ORIGINAL COMENTADO
  try {
    toast.info('Regenerando imagen con mejor calidad...');
    
    // Sanitize recipe title before sending to edge function
    const sanitizedTitle = sanitizeInput.recipeName(recipeTitle);
    
    if (!sanitizedTitle) {
      throw new Error('Nombre de receta inválido');
    }
    
    // Llamar a la función edge para generar nueva imagen
    const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
      body: { recipeName: sanitizedTitle }
    });

    if (error) throw error;

    const newImageUrl = data.imageUrl;
    
    if (!newImageUrl) {
      throw new Error('No se pudo generar la nueva imagen');
    }

    // Actualizar la receta con la nueva imagen
    const { error: updateError } = await supabase
      .from('recipe_bank')
      .update({ image_url: newImageUrl })
      .eq('id', recipeId);

    if (updateError) throw updateError;

    toast.success('Imagen regenerada y actualizada exitosamente');
    
    // Recargar la página para mostrar la nueva imagen
    setTimeout(() => {
      window.location.reload();
    }, 1000);

  } catch (error) {
    console.error('Error regenerating image:', error);
    toast.error('Error al regenerar la imagen');
  }
  */
};