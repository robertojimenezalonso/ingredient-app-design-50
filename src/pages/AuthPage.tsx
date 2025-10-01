import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authSchemas } from '@/lib/validation';

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get('returnTo');
      
      if (returnTo === 'expanded') {
        navigate('/?expanded=true');
      } else {
        navigate('/');
      }
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form data with Zod
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
          const urlParams = new URLSearchParams(window.location.search);
          const returnTo = urlParams.get('returnTo');
          
          if (returnTo === 'expanded') {
            navigate('/?expanded=true');
          } else {
            navigate('/');
          }
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
    setError(''); // Clear error when user starts typing
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F7F7' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F7F7' }}>
      {/* Header */}
      <div className="flex items-center p-4">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white mr-4"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-medium">
          {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#C3C3C3]">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-neutral-950">
              {isSignUp ? 'Crear cuenta' : 'Bienvenido'}
            </CardTitle>
            <p className="text-muted-foreground">
              {isSignUp 
                ? 'Crea tu cuenta para guardar tus listas' 
                : 'Inicia sesión para acceder a tus listas'
              }
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
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

            <div className="text-center pt-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;