import { User, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import mercadonaLogo from '@/assets/mercadona-logo-new.png';

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
          <div className="w-full h-full flex items-center justify-center text-white font-medium text-lg opacity-90" style={{ backgroundColor: '#ec4899' }}>
            RJ
          </div>
        </div>
        
        {/* Mis listas and Filter buttons */}
        <div className="flex gap-2 items-center">
          <Button 
            size="sm" 
            className="rounded-full h-10 px-4 flex-shrink-0" 
            style={{ backgroundColor: '#E4E5E0' }}
            variant="ghost"
            onClick={() => navigate('/milista')}
          >
            <span className="text-sm text-black">Mis listas</span>
          </Button>
          <Button 
            size="sm" 
            className="rounded-full h-10 w-10 p-0 flex-shrink-0" 
            style={{ backgroundColor: '#E4E5E0' }}
            variant="ghost"
          >
            <SlidersHorizontal className="h-4 w-4 text-black" />
          </Button>
        </div>
        
      </div>
      
      {/* Mercadona and Better Price Container */}
      <div className="mx-4 mb-3 mt-4 border border-gray-300 rounded-lg">
        {/* Mercadona Section */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img 
              src={mercadonaLogo} 
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
        <div className="rounded-lg mx-4 mb-4 px-4 h-10 flex items-center" style={{ backgroundColor: '#E4E5E0' }}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">Mejor precio:</span>
              <span className="text-sm text-gray-500 line-through">
                {totalPrice.toFixed(2).replace('.', ',')} €
              </span>
              <span className="text-sm text-green-600">
                {(totalPrice * 0.8).toFixed(2).replace('.', ',')} €
              </span>
            </div>
            
            <div className="flex items-center gap-1 cursor-pointer ml-auto">
              <span className="text-sm text-foreground">Ver</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mx-4 mb-2 mt-8 flex justify-center items-center">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="rounded-full h-10 px-4 flex-shrink-0" 
            style={{ backgroundColor: '#000000' }}
            variant="ghost"
          >
            <span className="text-sm text-white">Recetas</span>
          </Button>
          <Button 
            size="sm" 
            className="rounded-full h-10 px-4 flex-shrink-0" 
            style={{ backgroundColor: '#E4E5E0' }}
            variant="ghost"
          >
            <span className="text-sm text-black">Carrito</span>
          </Button>
        </div>
      </div>
    </div>
  );
};