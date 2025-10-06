import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export const EditBirthDatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const existingBirthDate = location.state?.birthDate || '';
  const profileId = location.state?.profileId;
  const isEditing = !!existingBirthDate;
  
  // Parse existing date if available
  const parseExistingDate = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(parseExistingDate(existingBirthDate));
  
  const handleContinue = () => {
    if (!selectedDate) return;
    
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = selectedDate.getFullYear().toString();
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
  
  const isValid = selectedDate !== undefined;
  
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
      <div className="flex-1 p-4 flex flex-col items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full max-w-sm justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Selecciona tu fecha de nacimiento</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
              captionLayout="dropdown-buttons"
              fromYear={1900}
              toYear={new Date().getFullYear()}
            />
          </PopoverContent>
        </Popover>
        
        <p className="text-xs text-muted-foreground text-center px-4 mt-6">
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
