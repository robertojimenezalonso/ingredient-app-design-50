import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authSchemas } from '@/lib/validation';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const validationResult = authSchemas.signUp.safeParse(formData);
        
        if (!validationResult.success) {
          const firstError = validationResult.error.errors[0];
          setError(firstError.message);
          setLoading(false);
          return;
        }

        const { email, password, displayName } = validationResult.data;
        const { error } = await signUp(email, password, displayName);
        
        if (error) {
          if (error.message.includes('already registered')) {
            setError('Este email ya está registrado. Intenta iniciar sesión.');
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: "Cuenta creada",
            description: "Revisa tu email para confirmar tu cuenta."
          });
          onOpenChange(false);
        }
      } else {
        const validationResult = authSchemas.signIn.safeParse(formData);
        
        if (!validationResult.success) {
          const firstError = validationResult.error.errors[0];
          setError(firstError.message);
          setLoading(false);
          return;
        }

        const { email, password } = validationResult.data;
        const { error } = await signIn(email, password);
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Email o contraseña incorrectos.');
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: "Sesión iniciada",
            description: "Bienvenido de vuelta"
          });
          onOpenChange(false);
        }
      }
    } catch (err) {
      setError('Ha ocurrido un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({ email: '', password: '', displayName: '' });
      setError('');
      setIsSignUp(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl border border-[#C3C3C3]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-neutral-950 text-center">
            {isSignUp ? 'Crear cuenta' : 'Bienvenido'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSignUp 
              ? 'Crea tu cuenta para guardar tus perfiles' 
              : 'Inicia sesión para guardar tus perfiles'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Nombre (opcional)"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="pl-10 h-12 rounded-lg border-2"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="pl-10 h-12 rounded-lg border-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 h-12 rounded-lg border-2"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-btnFloating text-btnFloating-foreground hover:bg-btnFloating/90 rounded-lg text-base font-semibold"
            >
              {loading 
                ? 'Cargando...' 
                : isSignUp 
                  ? 'Crear cuenta' 
                  : 'Iniciar sesión'
              }
            </Button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setFormData({ email: '', password: '', displayName: '' });
              }}
              className="text-primary hover:underline text-sm"
            >
              {isSignUp 
                ? '¿Ya tienes cuenta? Inicia sesión' 
                : '¿No tienes cuenta? Créala aquí'
              }
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
