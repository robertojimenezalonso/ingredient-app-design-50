import { RecipeBankManager } from '@/components/RecipeBankManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RecipeBankAdminPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold">Administración del Banco de Recetas</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p>
                  El banco de recetas es un sistema optimizado que pre-genera recetas usando OpenAI 
                  para evitar llamadas costosas en cada plan de comidas.
                </p>
                <ul className="mt-3">
                  <li><strong>39 recetas únicas:</strong> 10 desayunos, 10 almuerzos, 10 cenas, 3 snacks, 3 aperitivos, 3 meriendas</li>
                  <li><strong>Imágenes generadas:</strong> Cada receta incluye una imagen hiperrealista creada con DALL-E</li>
                  <li><strong>Información nutricional completa:</strong> Macros, micros, calorías y tiempo de preparación</li>
                  <li><strong>Escalabilidad automática:</strong> Las cantidades se ajustan según el número de personas</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <RecipeBankManager />
        </div>
      </div>
    </div>
  );
}