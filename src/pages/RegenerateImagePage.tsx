import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { regenerateRecipeImage } from "@/utils/regenerateRecipeImage";

const RegenerateImagePage = () => {
  const handleRegenerateImage = () => {
    regenerateRecipeImage(
      '93012452-060e-45ad-b094-6173bd97afdb', 
      'Tortilla de champiñones, espinacas y queso'
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Regenerar Imagen de Tortilla</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRegenerateImage} className="w-full">
            Regenerar Imagen con Mejor Calidad
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegenerateImagePage;