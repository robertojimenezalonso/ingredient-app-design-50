import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const EditBirthDatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const existingBirthDate = location.state?.birthDate || '';
  const profileId = location.state?.profileId;
  const isEditing = !!existingBirthDate;
  
  const [day, setDay] = useState(existingBirthDate ? existingBirthDate.split('/')[0] : '');
  const [month, setMonth] = useState(existingBirthDate ? existingBirthDate.split('/')[1] : '');
  const [year, setYear] = useState(existingBirthDate ? existingBirthDate.split('/')[2] : '');
  
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  
  const handleDayChange = (value: string) => {
    const numValue = value.replace(/\D/g, '').slice(0, 2);
    setDay(numValue);
    
    // Auto-advance to month when day is complete
    if (numValue.length === 2 && parseInt(numValue) >= 1 && parseInt(numValue) <= 31) {
      monthRef.current?.focus();
    }
  };
  
  const handleMonthChange = (value: string) => {
    const numValue = value.replace(/\D/g, '').slice(0, 2);
    setMonth(numValue);
    
    // Auto-advance to year when month is complete
    if (numValue.length === 2 && parseInt(numValue) >= 1 && parseInt(numValue) <= 12) {
      yearRef.current?.focus();
    }
  };
  
  const handleYearChange = (value: string) => {
    const numValue = value.replace(/\D/g, '').slice(0, 4);
    setYear(numValue);
  };
  
  const handleContinue = () => {
    const birthDate = `${day}/${month}/${year}`;
    navigate('/recipe-preferences', { 
      state: { 
        editedField: 'birthDate',
        editedValue: birthDate,
        profileId,
        nextField: 'weight'
      } 
    });
  };
  
  const handleBack = () => {
    navigate('/recipe-preferences');
  };
  
  const isValid = day && month && year && 
                  parseInt(day) >= 1 && parseInt(day) <= 31 &&
                  parseInt(month) >= 1 && parseInt(month) <= 12 &&
                  parseInt(year) >= 1900 && parseInt(year) <= new Date().getFullYear();
  
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
          {isEditing ? 'Actualizar fecha de nacimiento' : 'Añadir fecha de nacimiento'}
        </h3>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-4">
        <div className="flex gap-2 justify-center items-center mb-4 max-w-md mx-auto w-full">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={day}
            onChange={(e) => handleDayChange(e.target.value)}
            placeholder="DD"
            className="w-20 text-center text-lg"
            maxLength={2}
            autoFocus
          />
          <span className="text-muted-foreground text-lg">/</span>
          <Input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={month}
            onChange={(e) => handleMonthChange(e.target.value)}
            placeholder="MM"
            className="w-20 text-center text-lg"
            maxLength={2}
          />
          <span className="text-muted-foreground text-lg">/</span>
          <Input
            ref={yearRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={year}
            onChange={(e) => handleYearChange(e.target.value)}
            placeholder="AAAA"
            className="w-24 text-center text-lg"
            maxLength={4}
          />
        </div>
        
        <p className="text-xs text-muted-foreground text-center px-4 max-w-md mx-auto">
          Te preguntamos esto porque la edad afecta la composición del cuerpo. Usamos esta información para ofrecerte recetas personalizadas.
        </p>
      </div>
      
      {/* Bottom Button */}
      <div className="p-4 border-t bg-background">
        <Button
          onClick={handleContinue}
          disabled={!isValid}
          className="w-full"
        >
          Guardar y continuar
        </Button>
      </div>
    </div>
  );
};
