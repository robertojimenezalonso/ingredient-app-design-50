import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
const WelcomePage = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-slate-100">
      <p className="absolute top-4 right-4 text-muted-foreground">Iniciar sesión</p>
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Oliv.ai</h1>
          <p className="text-muted-foreground text-lg text-center font-normal">Compara precios en diferentes supermercados y consigue recetas personalizadas al mejor precio.</p>
        </div>

        <Button onClick={() => navigate('/calendar-selection')} className="w-full bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_25px_rgba(0,0,0,0.15)] transition-shadow text-foreground border-0 py-4 h-auto" variant="outline">
          <Search className="h-5 w-5 mr-3" />
          <div className="text-center">
            <div className="font-semibold">Empezar a buscar</div>
          </div>
        </Button>
      </div>
    </div>;
};
export default WelcomePage;