import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const IngredientEntryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    supermarket: 'Mercadona',
    section_department: '',
    product_name: '',
    quantity: '',
    unit_type: '',
    price: '',
    image_url: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const supermarkets = [
    'Mercadona',
    'Lidl', 
    'Carrefour',
    'El Corte Inglés',
    'Ahorramas',
    'Día'
  ];

  const unitTypes = [
    'gramos',
    'kilos',
    'miligramos',
    'unidad',
    'litros',
    'mililitros',
    'paquete',
    'lata',
    'botella'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error);
      throw new Error('Error al subir la imagen');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.supermarket || !formData.product_name || !formData.quantity || 
        !formData.unit_type || !formData.price || !formData.section_department) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = '';
      
      // Upload image if selected
      if (selectedFile) {
        imageUrl = await uploadImageToSupabase(selectedFile);
      }
      const { error } = await supabase
        .from('supermarket_ingredients')
        .insert({
          supermarket: formData.supermarket,
          section_department: formData.section_department,
          product_name: formData.product_name,
          quantity: parseFloat(formData.quantity),
          unit_type: formData.unit_type,
          price: parseFloat(formData.price),
          image_url: imageUrl || null
        });

      if (error) {
        console.error('Error inserting ingredient:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar el ingrediente",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Éxito",
        description: "Ingrediente guardado correctamente"
      });

      // Reset form
      setFormData({
        supermarket: '',
        section_department: '',
        product_name: '',
        quantity: '',
        unit_type: '',
        price: '',
        image_url: ''
      });
      setSelectedFile(null);
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al guardar",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-background border-b border-border z-50">
        <div className="flex items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">Añadir Ingrediente</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="pt-20 pb-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Información del Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Supermarket */}
              <div className="space-y-2">
                <Label htmlFor="supermarket">Supermercado *</Label>
                <Select value={formData.supermarket} onValueChange={(value) => handleInputChange('supermarket', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un supermercado" />
                  </SelectTrigger>
                  <SelectContent>
                    {supermarkets.map(supermarket => (
                      <SelectItem key={supermarket} value={supermarket}>
                        {supermarket}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Section/Department */}
              <div className="space-y-2">
                <Label htmlFor="section">Sección/Departamento *</Label>
                <Input
                  id="section"
                  value={formData.section_department}
                  onChange={(e) => handleInputChange('section_department', e.target.value)}
                  placeholder="Ej: Lácteos, Carnicería, Panadería..."
                />
              </div>

              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="product_name">Nombre del Producto *</Label>
                <Input
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e) => handleInputChange('product_name', e.target.value)}
                  placeholder="Ej: Leche desnatada, Pechuga de pollo..."
                />
              </div>

              {/* Quantity and Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="1.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit_type">Tipo de Medida *</Label>
                  <Select value={formData.unit_type} onValueChange={(value) => handleInputChange('unit_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitTypes.map(unit => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Precio (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="2.99"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Imagen del Producto</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4">
                        <Button 
                          type="button" 
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Seleccionar Imagen
                        </Button>
                        <p className="mt-2 text-sm text-muted-foreground">
                          PNG, JPG, WEBP hasta 10MB
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Ingrediente'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IngredientEntryPage;