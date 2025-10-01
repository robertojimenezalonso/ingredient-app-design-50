import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

export const EditWeightPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const existingWeight = location.state?.weight || '';
  const existingUnit = location.state?.weightUnit || 'kg';
  const profileId = location.state?.profileId;
  const isEditing = !!existingWeight;
  
  const [weight, setWeight] = useState(existingWeight);
  const [unit, setUnit] = useState<'kg' | 'lbs' | 'st'>(existingUnit);
  
  useEffect(() => {
    // Auto-focus the input
    inputRef.current?.focus();
  }, []);
  
  const handleContinue = () => {
    navigate('/recipe-preferences', { 
      state: { 
        editedField: 'weight',
        editedValue: `${weight} ${unit}`,
        profileId,
        nextField: 'height'
      } 
    });
  };
  
  const handleBack = () => {
    navigate('/recipe-preferences');
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h3 className="flex-1 text-center text-base font-medium text-foreground">
          Actualiza tu peso
        </h3>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4">
        <div className="flex items-center gap-3">
          <Input
            ref={inputRef}
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0"
            className="flex-1"
            inputMode="numeric"
          />
          <div className="flex gap-2">
            <Button
              variant={unit === 'kg' ? 'default' : 'outline'}
              onClick={() => setUnit('kg')}
              className="px-4"
            >
              kg
            </Button>
            <Button
              variant={unit === 'lbs' ? 'default' : 'outline'}
              onClick={() => setUnit('lbs')}
              className="px-4"
            >
              lbs
            </Button>
            <Button
              variant={unit === 'st' ? 'default' : 'outline'}
              onClick={() => setUnit('st')}
              className="px-4"
            >
              st
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bottom Button - Fixed above keyboard */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-background">
        <Button
          onClick={handleContinue}
          disabled={!weight || parseFloat(weight) <= 0}
          className="w-full"
        >
          Guardar y continuar
        </Button>
      </div>
    </div>
  );
};
