import { User } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export const TopHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Profile Photo */}
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
    </div>
  );
};