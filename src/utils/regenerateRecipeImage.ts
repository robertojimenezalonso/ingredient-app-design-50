import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const regenerateRecipeImage = async (recipeId: string, recipeTitle: string) => {
  try {
    toast.info('Regenerando imagen con mejor calidad...');
    
    // Llamar a la función edge para generar nueva imagen
    const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
      body: { recipeName: recipeTitle }
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
};