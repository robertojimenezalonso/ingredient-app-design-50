import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

export const EditActivityLevelPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const existingLevel = location.state?.activityLevel || '';
  const profileId = location.state?.profileId;
  
  const [activityLevel, setActivityLevel] = useState(existingLevel);
  
  const handleSave = () => {
    // This is the last field, so we just save
    navigate('/recipe-preferences', { 
      state: { 
        editedField: 'activityLevel',
        editedValue: activityLevel,
        profileId
      } 
    });
  };
  
  const handleBack = () => {
    navigate('/recipe-preferences');
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h3 className="flex-1 text-center text-base font-medium text-foreground">
          Nivel de actividad
        </h3>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4">
        <RadioGroup value={activityLevel} onValueChange={setActivityLevel} className="space-y-3">
          <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent"
               onClick={() => setActivityLevel('Bajo')}>
            <RadioGroupItem value="Bajo" id="bajo" />
            <Label htmlFor="bajo" className="flex-1 cursor-pointer">
              Bajo
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent"
               onClick={() => setActivityLevel('Moderado')}>
            <RadioGroupItem value="Moderado" id="moderado" />
            <Label htmlFor="moderado" className="flex-1 cursor-pointer">
              Moderado
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent"
               onClick={() => setActivityLevel('Alto')}>
            <RadioGroupItem value="Alto" id="alto" />
            <Label htmlFor="alto" className="flex-1 cursor-pointer">
              Alto
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent"
               onClick={() => setActivityLevel('Muy alto')}>
            <RadioGroupItem value="Muy alto" id="muy-alto" />
            <Label htmlFor="muy-alto" className="flex-1 cursor-pointer">
              Muy alto
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Bottom Button */}
      <div className="p-4 border-t bg-background">
        <Button
          onClick={handleSave}
          disabled={!activityLevel}
          className="w-full"
        >
          Guardar
        </Button>
      </div>
    </div>
  );
};
