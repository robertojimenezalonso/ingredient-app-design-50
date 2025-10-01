import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

export const EditSexPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const existingSex = location.state?.sex || '';
  const profileId = location.state?.profileId;
  
  const [sex, setSex] = useState(existingSex);
  
  const handleContinue = () => {
    navigate('/recipe-preferences', { 
      state: { 
        editedField: 'sex',
        editedValue: sex,
        profileId,
        nextField: 'activityLevel'
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
          Sexo
        </h3>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4">
        <RadioGroup value={sex} onValueChange={setSex} className="space-y-3">
          <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent"
               onClick={() => setSex('Masculino')}>
            <RadioGroupItem value="Masculino" id="masculino" />
            <Label htmlFor="masculino" className="flex-1 cursor-pointer">
              Masculino
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent"
               onClick={() => setSex('Femenino')}>
            <RadioGroupItem value="Femenino" id="femenino" />
            <Label htmlFor="femenino" className="flex-1 cursor-pointer">
              Femenino
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent"
               onClick={() => setSex('Otro')}>
            <RadioGroupItem value="Otro" id="otro" />
            <Label htmlFor="otro" className="flex-1 cursor-pointer">
              Otro
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Bottom Button */}
      <div className="p-4 border-t bg-background">
        <Button
          onClick={handleContinue}
          disabled={!sex}
          className="w-full"
        >
          Guardar y continuar
        </Button>
      </div>
    </div>
  );
};
