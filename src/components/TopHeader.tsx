import { User } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export const TopHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Profile Circle */}
        <div 
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center cursor-pointer"
          onClick={() => navigate('/profile')}
        >
          <User className="w-5 h-5 text-muted-foreground" />
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