import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useUserConfig } from '@/contexts/UserConfigContext';

const PostalCodePage = () => {
  const navigate = useNavigate();
  const { config, updateConfig } = useUserConfig();
  const [postalCode, setPostalCode] = useState(config.postalCode);

  const handleContinue = () => {
    updateConfig({ postalCode });
    navigate('/calendar-selection');
  };

  const isValidPostalCode = postalCode.length === 5 && /^\d+$/.test(postalCode);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex-1 mx-4">
            <Progress value={25} className="h-1" />
          </div>
        </div>

        <div className="mb-12">
          <h1 className="text-2xl font-bold text-foreground">
            ¿Cuál es tu código postal?
          </h1>
          <p className="text-muted-foreground mt-2">
            Esto se utilizará para mostrarte precios reales
          </p>
        </div>

        <div className="mb-10">
          <Input
            type="tel"
            placeholder="12345"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="text-2xl py-6 text-center border rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0"
            maxLength={5}
            inputMode="numeric"
            pattern="[0-9]*"
            autoFocus
          />
        </div>

        <div style={{ marginTop: '80px' }}>
          <Button
            onClick={handleContinue}
            disabled={!isValidPostalCode}
            className="w-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-100 disabled:bg-[#81838B] disabled:text-white rounded-lg py-4 h-auto text-lg font-semibold"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostalCodePage;