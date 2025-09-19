import { User, ChevronRight, SlidersHorizontal, Check } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import mercadonaLogo from '@/assets/mercadona-logo-new.png';

interface TopHeaderProps {
  selectedDate: Date;
  totalPrice?: number;
}

export const TopHeader = ({
  selectedDate,
  totalPrice = 0
}: TopHeaderProps) => {
  const navigate = useNavigate();
  const formattedDate = format(selectedDate, "EEEE, d 'de' MMMM", {
    locale: es
  });

  return <>
    {/* Fixed top section */}
    <div className="fixed top-0 left-0 right-0 z-50" style={{
      backgroundColor: '#F7F7F7'
    }}>
      <div className="flex items-center justify-between px-4 py-3 pb-8">
        {/* Profile Section */}
        <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer" onClick={() => navigate('/profile')}>
          <div className="w-full h-full flex items-center justify-center text-white font-medium text-lg opacity-90" style={{
          backgroundColor: '#ec4899'
        }}>
            RJ
          </div>
        </div>
        
        {/* Mis listas and Filter buttons */}
        <div className="flex gap-2 items-center">
          <Button size="sm" className="rounded-full h-10 px-4 flex-shrink-0" style={{
          backgroundColor: '#E4E5E0'
        }} variant="ghost" onClick={() => navigate('/milista')}>
            <span className="text-sm text-black">Mis listas</span>
          </Button>
          <Button size="sm" className="rounded-full h-10 w-10 p-0 flex-shrink-0" style={{
          backgroundColor: '#E4E5E0'
        }} variant="ghost">
            <SlidersHorizontal className="h-4 w-4 text-black" />
          </Button>
        </div>
      </div>
    </div>

    {/* Scrollable content */}
    <div className="pt-20" style={{
      backgroundColor: '#F7F7F7'
    }}>
      {/* Title */}
      <div className="mx-4 mb-2">
        <h2 className="text-lg font-medium text-black">Lista semana saludable</h2>
      </div>
      
      {/* Mercadona and Better Price Container */}
      <div className="mx-4 mb-8 mt-1 rounded-lg bg-white pb-1">
        {/* Mercadona Section */}
        <div className="flex items-center justify-between px-4 py-3 pb-6">
           <div className="flex items-center gap-3">
             <img src={mercadonaLogo} alt="Mercadona" className="w-12 h-12 object-contain" />
             <div className="flex flex-col">
               <span className="text-lg font-medium">Mercadona</span>
               <span className="text-sm text-gray-500">16 ingredientes</span>
             </div>
           </div>
          
          <div className="text-xl font-medium text-primary">
            {totalPrice.toFixed(2).replace('.', ',')} €
          </div>
        </div>

        {/* Parallel sections */}
        <div className="flex gap-2 mx-4 mb-4 items-center">
          {/* Objetivo section */}
          <div className="rounded-lg py-2 px-3 flex-1 flex items-center justify-center" style={{
            backgroundColor: '#E8F5E8'
          }}>
            <span className="text-sm text-green-600 text-center underline decoration-offset-2">Comer saludable</span>
          </div>

          {/* Better Price Section */}
          <div className="rounded-lg px-3 py-2 flex-1 flex items-center justify-center" style={{
            backgroundColor: '#FFDCC5'
          }}>
            <span className="text-sm whitespace-nowrap text-center" style={{
              color: '#FA6916'
            }}><span className="underline decoration-offset-2">Mejor precio:</span> <span className="font-semibold">{(totalPrice * 0.8).toFixed(2).replace('.', ',')} €</span></span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mx-4 mb-2 mt-8 flex justify-center items-center">
        <div className="flex gap-2">
          <Button size="sm" className="rounded-full h-10 px-4 flex-shrink-0" style={{
          backgroundColor: '#000000'
        }} variant="ghost">
            <span className="text-sm text-white">Recetas</span>
          </Button>
          <Button size="sm" className="rounded-full h-10 px-4 flex-shrink-0" style={{
          backgroundColor: '#E4E5E0'
        }} variant="ghost">
            <span className="text-sm text-black">Carrito</span>
          </Button>
        </div>
      </div>
    </div>
  </>;
};