import { User } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TopHeaderProps {
  selectedDate: Date;
}

export const TopHeader = ({ selectedDate }: TopHeaderProps) => {
  const navigate = useNavigate();

  const formattedDate = format(selectedDate, "EEEE, d 'de' MMMM", { locale: es });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Profile Section */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer"
            onClick={() => navigate('/profile')}
          >
            <img 
              src="/profile-photo.jpeg" 
              alt="Perfil" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-foreground">Roberto J.</h1>
            <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>
          </div>
        </div>
        
        {/* Mis listas button */}
        <Button 
          variant="outline" 
          className="text-sm font-medium"
          onClick={() => navigate('/milista')}
        >
          Mis listas
        </Button>
      </div>
    </div>
  );
};