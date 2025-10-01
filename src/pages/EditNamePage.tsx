import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

export const EditNamePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const existingName = location.state?.name || '';
  const profileId = location.state?.profileId;
  const isEditing = !!existingName;
  
  const [name, setName] = useState(existingName);
  
  useEffect(() => {
    // Auto-focus the input
    inputRef.current?.focus();
  }, []);
  
  const handleContinue = () => {
    navigate('/recipe-preferences', { 
      state: { 
        editedField: 'name',
        editedValue: name,
        profileId,
        nextField: 'birthDate'
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
          {isEditing ? 'Actualizar nombre' : 'Añadir nombre'}
        </h3>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4">
        <Input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Escribe tu nombre"
          className="w-full"
        />
      </div>
      
      {/* Bottom Button - Fixed above keyboard */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-background">
        <Button
          onClick={handleContinue}
          disabled={!name.trim()}
          className="w-full"
        >
          Guardar y continuar
        </Button>
      </div>
    </div>
  );
};
