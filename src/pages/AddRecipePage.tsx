import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AddRecipePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [recipeJson, setRecipeJson] = useState('');

  const generateRecipeImage = async (recipeTitle: string, ingredients: any[]): Promise<string> => {
    try {
      const ingredientNames = ingredients
        .filter(ing => ing.name?.trim())
        .map(ing => ing.name)
        .join(', ');

      const prompt = `Ultra-realistic, professional food photography of ${recipeTitle}. Beautiful plating, appetizing presentation, natural lighting, restaurant quality, high detail, photorealistic. Main ingredients: ${ingredientNames}. Make it look delicious and visually appealing.`;

      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: { recipeNames: [recipeTitle], prompt }
      });

      if (error) throw error;
      
      return data.imageUrls?.[recipeTitle] || data.imageUrl || '';
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Error al generar la imagen');
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipeJson.trim()) {
      toast.error('Debes pegar el JSON de la receta');
      return;
    }

    setIsLoading(true);

    try {
      // Parsear el JSON
      let recipeData;
      try {
        recipeData = JSON.parse(recipeJson);
      } catch (parseError) {
        toast.error('JSON inválido. Verifica el formato');
        setIsLoading(false);
        return;
      }

      // Validar campos requeridos
      if (!recipeData.title?.trim()) {
        toast.error('El título es obligatorio en el JSON');
        setIsLoading(false);
        return;
      }

      if (!recipeData.category) {
        toast.error('La categoría es obligatoria en el JSON');
        setIsLoading(false);
        return;
      }

      if (!recipeData.ingredients || !Array.isArray(recipeData.ingredients)) {
        toast.error('Los ingredientes son obligatorios y deben ser un array en el JSON');
        setIsLoading(false);
        return;
      }

      if (!recipeData.instructions || !Array.isArray(recipeData.instructions)) {
        toast.error('Las instrucciones son obligatorias y deben ser un array en el JSON');
        setIsLoading(false);
        return;
      }

      // Intentar generar imagen (opcional)
      let imageUrl = '';
      try {
        toast.info('Generando imagen de la receta...');
        imageUrl = await generateRecipeImage(recipeData.title, recipeData.ingredients);
      } catch (imageError) {
        console.warn('Error generating image, proceeding without it:', imageError);
        toast.warning('No se pudo generar la imagen, pero la receta se guardará');
      }

      // Preparar datos para guardar con valores por defecto
      const finalRecipeData = {
        title: recipeData.title,
        description: recipeData.description || null,
        category: recipeData.category,
        servings: recipeData.servings || 1,
        preparation_time: recipeData.preparation_time || 0,
        calories: recipeData.calories || 0,
        image_url: imageUrl,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        macronutrients: recipeData.macronutrients || { protein: 0, carbs: 0, fat: 0 },
        micronutrients: recipeData.micronutrients || { fiber: 0, sugar: 0, sodium: 0, calcium: 0, iron: 0, vitaminC: 0 },
      };

      // Guardar en Supabase
      const { error } = await supabase
        .from('recipe_bank')
        .insert(finalRecipeData);

      if (error) throw error;

      toast.success('Receta guardada exitosamente');
      navigate('/');
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Error al guardar la receta');
    } finally {
      setIsLoading(false);
    }
  };

  const jsonExample = `{
  "title": "Paella Valenciana",
  "description": "Auténtica paella valenciana con pollo y verduras",
  "category": "comida",
  "servings": 4,
  "preparation_time": 45,
  "calories": 350,
  "ingredients": [
    { "name": "Arroz bomba", "amount": "300", "unit": "gr" },
    { "name": "Pollo", "amount": "500", "unit": "gr" },
    { "name": "Pimiento rojo", "amount": "1", "unit": "ud" }
  ],
  "instructions": [
    "Calentar el aceite en la paellera",
    "Dorar el pollo por ambos lados",
    "Añadir las verduras y sofreír"
  ],
  "macronutrients": {
    "protein": 25,
    "carbs": 45,
    "fat": 8
  },
  "micronutrients": {
    "fiber": 3,
    "sugar": 2,
    "sodium": 800,
    "calcium": 50,
    "iron": 2,
    "vitaminC": 15
  }
}`;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center gap-4 h-16 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Nueva Receta (JSON)</h1>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ejemplo de JSON */}
          <Card>
            <CardHeader>
              <CardTitle>Ejemplo de formato JSON</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                {jsonExample}
              </pre>
            </CardContent>
          </Card>

          {/* Campo de JSON */}
          <Card>
            <CardHeader>
              <CardTitle>JSON de la Receta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipeJson">Pega aquí el JSON con los datos de la receta *</Label>
                <Textarea
                  id="recipeJson"
                  value={recipeJson}
                  onChange={(e) => setRecipeJson(e.target.value)}
                  placeholder="Pega aquí el JSON de la receta..."
                  rows={20}
                  className="font-mono text-sm"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Botón de guardar */}
          <div className="sticky bottom-0 bg-background border-t pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>Generando imagen y guardando...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Receta
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddRecipePage;