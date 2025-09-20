import { User, ChevronRight, SlidersHorizontal, Check, ShoppingBasket } from 'lucide-react';
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
        
        {/* Carrito button */}
        <Button size="sm" className="rounded-full h-10 px-4 flex-shrink-0" style={{
          backgroundColor: '#E4E5E0'
        }} variant="ghost">
          <span className="text-sm text-black">Carrito</span>
        </Button>
      </div>
    </div>

    {/* Scrollable content */}
    <div className="pt-20" style={{
      backgroundColor: '#F7F7F7'
    }}>
      
      {/* Mercadona Section */}
      <div className="flex flex-col items-center mx-4 mb-6">
         <div className="flex items-center gap-3 mb-2">
           <img src={mercadonaLogo} alt="Mercadona" className="w-12 h-12 object-contain" />
            <div className="flex flex-col">
              <span className="text-lg font-medium">Mercadona</span>
            </div>
         </div>
        
        <div className="text-5xl text-primary">
          {totalPrice.toFixed(2).replace('.', ',')} €
        </div>
      </div>

      {/* Better Price Section */}
      <div className="mx-4 mb-8">
        <div className="rounded-lg px-3 py-2 flex items-center justify-center" style={{
          backgroundColor: '#FFDCC5'
        }}>
          <span className="text-sm whitespace-nowrap text-center" style={{
            color: '#FA6916'
          }}><span className="underline decoration-offset-2">Mejor precio:</span> <span className="font-semibold">{(totalPrice * 0.8).toFixed(2).replace('.', ',')} €</span></span>
        </div>
      </div>

      {/* Supermercados Button */}
      <div className="mx-4 mb-8 flex justify-center">
        <Button size="sm" className="rounded-full h-10 px-4 flex-shrink-0" style={{
          backgroundColor: '#E4E5E0'
        }} variant="ghost" onClick={() => navigate('/milista')}>
          <span className="text-sm text-black">Supermercados</span>
        </Button>
      </div>

    </div>
  </>;
};