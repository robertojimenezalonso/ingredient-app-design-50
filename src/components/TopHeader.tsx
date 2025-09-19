import { User, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TopHeaderProps {
  selectedDate: Date;
  totalPrice?: number;
}

export const TopHeader = ({ selectedDate, totalPrice = 0 }: TopHeaderProps) => {
  const navigate = useNavigate();

  const formattedDate = format(selectedDate, "EEEE, d 'de' MMMM", { locale: es });

  return (
    <div className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: '#F7F7F7' }}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Profile Section */}
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
        
        {/* Mis listas button */}
        <Button 
          variant="outline" 
          className="text-sm font-medium"
          onClick={() => navigate('/milista')}
        >
          Mis listas
        </Button>
      </div>
      
      {/* Mercadona Section */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <img 
            src="/src/assets/mercadona-logo-new.png" 
            alt="Mercadona" 
            className="w-8 h-8 object-contain"
          />
          <span className="text-lg font-medium">Mercadona</span>
        </div>
        
        <div className="text-xl font-bold text-primary">
          {totalPrice.toFixed(2).replace('.', ',')} €
        </div>
      </div>

      {/* Better Price Section */}
      <div className="mx-4 mb-3 bg-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">Mejor precio</span>
            <span className="text-sm text-gray-500 line-through">
              {totalPrice.toFixed(2).replace('.', ',')} €
            </span>
            <span className="text-sm text-green-600">
              {(totalPrice * 0.8).toFixed(2).replace('.', ',')} €
            </span>
          </div>
          
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-foreground">Alternativas</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
};