import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

export const EditHeightPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const existingHeight = location.state?.height || '';
  const existingUnit = location.state?.heightUnit || 'cm';
  const profileId = location.state?.profileId;
  const isEditing = !!existingHeight;
  
  const [height, setHeight] = useState(existingHeight);
  const [unit, setUnit] = useState<'cm' | 'ft'>(existingUnit);
  
  useEffect(() => {
    // Auto-focus the input
    inputRef.current?.focus();
  }, []);
  
  const handleContinue = () => {
    navigate('/recipe-preferences', { 
      state: { 
        editedField: 'height',
        editedValue: `${height} ${unit}`,
        profileId,
        nextField: 'sex'
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
          Actualiza tu altura
        </h3>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4">
        <div className="flex items-center gap-3">
          <Input
            ref={inputRef}
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="0"
            className="flex-1"
            inputMode="numeric"
          />
          <div className="flex gap-2">
            <Button
              variant={unit === 'cm' ? 'default' : 'outline'}
              onClick={() => setUnit('cm')}
              className="px-4"
            >
              cm
            </Button>
            <Button
              variant={unit === 'ft' ? 'default' : 'outline'}
              onClick={() => setUnit('ft')}
              className="px-4"
            >
              ft
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bottom Button */}
      <div className="p-4 border-t bg-background">
        <Button
          onClick={handleContinue}
          disabled={!height || parseFloat(height) <= 0}
          className="w-full"
        >
          Guardar y continuar
        </Button>
      </div>
    </div>
  );
};
