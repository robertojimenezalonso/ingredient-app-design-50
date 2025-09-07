import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface MacroNutrients {
  protein: number;
  carbs: number;
  fat: number;
}

interface MicroNutrients {
  fiber: number;
  sugar: number;
  sodium: number;
  calcium: number;
  iron: number;
  vitaminC: number;
}

const AddRecipePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    servings: 1,
    preparation_time: 0,
    calories: 0,
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: '', unit: '' }
  ]);

  const [instructions, setInstructions] = useState<string[]>(['']);

  const [macroNutrients, setMacroNutrients] = useState<MacroNutrients>({
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const [microNutrients, setMicroNutrients] = useState<MicroNutrients>({
    fiber: 0,
    sugar: 0,
    sodium: 0,
    calcium: 0,
    iron: 0,
    vitaminC: 0,
  });

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = ingredients.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    );
    setIngredients(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = instructions.map((inst, i) => 
      i === index ? value : inst
    );
    setInstructions(updated);
  };

  const generateRecipeImage = async (recipeTitle: string, ingredients: Ingredient[]): Promise<string> => {
    try {
      const ingredientNames = ingredients
        .filter(ing => ing.name.trim())
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
    
    if (!formData.title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    if (ingredients.some(ing => !ing.name.trim())) {
      toast.error('Todos los ingredientes deben tener nombre');
      return;
    }

    if (instructions.some(inst => !inst.trim())) {
      toast.error('Todas las instrucciones deben estar completas');
      return;
    }

    setIsLoading(true);

    try {
      // Generar imagen
      toast.info('Generando imagen de la receta...');
      const imageUrl = await generateRecipeImage(formData.title, ingredients);

      // Preparar datos para guardar
      const recipeData = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        servings: formData.servings,
        preparation_time: formData.preparation_time,
        calories: formData.calories,
        image_url: imageUrl,
        ingredients: ingredients.filter(ing => ing.name.trim()) as any,
        instructions: instructions.filter(inst => inst.trim()),
        macronutrients: macroNutrients as any,
        micronutrients: microNutrients as any,
      };

      // Guardar en Supabase
      const { error } = await supabase
        .from('recipe_bank')
        .insert(recipeData);

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
          <h1 className="text-lg font-semibold">Nueva Receta</h1>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título de la Receta *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Paella Valenciana"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción opcional de la receta"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Desayuno</SelectItem>
                      <SelectItem value="lunch">Almuerzo</SelectItem>
                      <SelectItem value="dinner">Cena</SelectItem>
                      <SelectItem value="appetizer">Aperitivo</SelectItem>
                      <SelectItem value="snacks">Tentempié</SelectItem>
                      <SelectItem value="desserts">Postres</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="servings">Porciones</Label>
                  <Input
                    id="servings"
                    type="number"
                    min="1"
                    value={formData.servings}
                    onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preparation_time">Tiempo (minutos)</Label>
                  <Input
                    id="preparation_time"
                    type="number"
                    min="0"
                    value={formData.preparation_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, preparation_time: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <Label htmlFor="calories">Calorías totales</Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    value={formData.calories}
                    onChange={(e) => setFormData(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredientes */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Ingrediente</Label>
                    <Input
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      placeholder="Ej: Arroz bomba"
                    />
                  </div>
                  <div className="w-20">
                    <Label>Cantidad</Label>
                    <Input
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                      placeholder="300"
                    />
                  </div>
                  <div className="w-20">
                    <Label>Unidad</Label>
                    <Select value={ingredient.unit} onValueChange={(value) => updateIngredient(index, 'unit', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="gr" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gr">gr</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="l">l</SelectItem>
                        <SelectItem value="ud">ud</SelectItem>
                        <SelectItem value="cucharada">cda</SelectItem>
                        <SelectItem value="cucharadita">cdta</SelectItem>
                        <SelectItem value="taza">taza</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredients.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addIngredient} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Ingrediente
              </Button>
            </CardContent>
          </Card>

          {/* Instrucciones */}
          <Card>
            <CardHeader>
              <CardTitle>Instrucciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Label>Paso {index + 1}</Label>
                    <Textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder={`Describe el paso ${index + 1}...`}
                      rows={2}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeInstruction(index)}
                    disabled={instructions.length === 1}
                    className="mt-6"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addInstruction} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Paso
              </Button>
            </CardContent>
          </Card>

          {/* Información Nutricional */}
          <Card>
            <CardHeader>
              <CardTitle>Información Nutricional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Macronutrientes (por porción)</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label className="text-xs">Proteínas (g)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={macroNutrients.protein}
                      onChange={(e) => setMacroNutrients(prev => ({ ...prev, protein: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Carbohidratos (g)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={macroNutrients.carbs}
                      onChange={(e) => setMacroNutrients(prev => ({ ...prev, carbs: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Grasas (g)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={macroNutrients.fat}
                      onChange={(e) => setMacroNutrients(prev => ({ ...prev, fat: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Micronutrientes (por porción)</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label className="text-xs">Fibra (g)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={microNutrients.fiber}
                      onChange={(e) => setMicroNutrients(prev => ({ ...prev, fiber: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Azúcar (g)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={microNutrients.sugar}
                      onChange={(e) => setMicroNutrients(prev => ({ ...prev, sugar: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Sodio (mg)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={microNutrients.sodium}
                      onChange={(e) => setMicroNutrients(prev => ({ ...prev, sodium: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Calcio (mg)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={microNutrients.calcium}
                      onChange={(e) => setMicroNutrients(prev => ({ ...prev, calcium: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Hierro (mg)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={microNutrients.iron}
                      onChange={(e) => setMicroNutrients(prev => ({ ...prev, iron: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Vitamina C (mg)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={microNutrients.vitaminC}
                      onChange={(e) => setMicroNutrients(prev => ({ ...prev, vitaminC: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
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