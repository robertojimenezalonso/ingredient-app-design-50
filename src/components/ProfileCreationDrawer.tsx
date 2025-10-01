import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileCreationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: any) => void;
  editingProfile?: any;
  profileIndex?: number;
}

type Step = 'name' | 'birthDate' | 'weight' | 'height' | 'sex' | 'activityLevel';

export const ProfileCreationDrawer = ({ 
  isOpen, 
  onClose, 
  onSave,
  editingProfile,
  profileIndex = 0
}: ProfileCreationDrawerProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('name');
  
  // Parse existing data if editing
  const parseBirthDate = (birthDateStr?: string) => {
    if (!birthDateStr) return { day: '', month: '', year: '' };
    const parts = birthDateStr.split('/');
    if (parts.length === 3) {
      return { day: parts[0], month: parts[1], year: parts[2] };
    }
    return { day: '', month: '', year: '' };
  };

  const parseWeight = (weightStr?: string) => {
    if (!weightStr) return { value: '', unit: 'kg' };
    const parts = weightStr.split(' ');
    return { value: parts[0] || '', unit: parts[1] || 'kg' };
  };

  const parseHeight = (heightStr?: string) => {
    if (!heightStr) return { value: '', unit: 'cm' };
    const parts = heightStr.split(' ');
    return { value: parts[0] || '', unit: parts[1] || 'cm' };
  };

  const [profileData, setProfileData] = useState({
    name: editingProfile?.name || '',
    birthDate: editingProfile?.birthDate || '',
    weight: parseWeight(editingProfile?.weight).value,
    weightUnit: parseWeight(editingProfile?.weight).unit,
    height: parseHeight(editingProfile?.height).value,
    heightUnit: parseHeight(editingProfile?.height).unit,
    sex: editingProfile?.sex || '',
    activityLevel: editingProfile?.activityLevel || ''
  });

  const nameInputRef = useRef<HTMLInputElement>(null);
  const birthDateInputRef = useRef<HTMLInputElement>(null);
  const weightInputRef = useRef<HTMLInputElement>(null);
  const heightInputRef = useRef<HTMLInputElement>(null);

  const formatBirthDate = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Format as DD/MM/YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBirthDate(e.target.value);
    setProfileData({ ...profileData, birthDate: formatted });
  };

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    
    const focusInput = () => {
      switch (currentStep) {
        case 'name':
          nameInputRef.current?.focus();
          break;
        case 'birthDate':
          birthDateInputRef.current?.focus();
          break;
        case 'weight':
          weightInputRef.current?.focus();
          break;
        case 'height':
          heightInputRef.current?.focus();
          break;
      }
    };
    
    setTimeout(focusInput, 100);
  }, [isOpen, currentStep]);

  const getStepTitle = () => {
    const isEditing = editingProfile;
    switch (currentStep) {
      case 'name': return isEditing?.name ? 'Actualizar nombre' : 'Añadir nombre';
      case 'birthDate': return isEditing?.birthDate ? 'Actualizar fecha de nacimiento' : 'Añadir fecha de nacimiento';
      case 'weight': return isEditing?.weight ? 'Actualizar peso' : 'Añadir peso';
      case 'height': return isEditing?.height ? 'Actualizar altura' : 'Añadir altura';
      case 'sex': return isEditing?.sex ? 'Actualizar sexo' : 'Añadir sexo';
      case 'activityLevel': return isEditing?.activityLevel ? 'Actualizar nivel de actividad' : 'Añadir nivel de actividad';
      default: return '';
    }
  };

  const canContinue = () => {
    switch (currentStep) {
      case 'name': return profileData.name.trim().length > 0;
      case 'birthDate': {
        const date = profileData.birthDate.replace(/\D/g, '');
        if (date.length !== 8) return false;
        const day = parseInt(date.slice(0, 2));
        const month = parseInt(date.slice(2, 4));
        const year = parseInt(date.slice(4, 8));
        return day >= 1 && day <= 31 && 
               month >= 1 && month <= 12 && 
               year >= 1900 && year <= new Date().getFullYear();
      }
      case 'weight': return profileData.weight && parseFloat(profileData.weight) > 0;
      case 'height': return profileData.height && parseFloat(profileData.height) > 0;
      case 'sex': return profileData.sex !== '';
      case 'activityLevel': return profileData.activityLevel !== '';
      default: return false;
    }
  };

  const handleContinue = () => {
    const steps: Step[] = ['name', 'birthDate', 'weight', 'height', 'sex', 'activityLevel'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      // Last step - save profile
      onSave(profileData);
    }
  };

  const handleBack = () => {
    const steps: Step[] = ['name', 'birthDate', 'weight', 'height', 'sex', 'activityLevel'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const getCompletionPercentage = () => {
    const steps: Step[] = ['name', 'birthDate', 'weight', 'height', 'sex', 'activityLevel'];
    const completedSteps = steps.filter(step => {
      switch (step) {
        case 'name': return profileData.name.trim().length > 0;
        case 'birthDate': {
          const date = profileData.birthDate.replace(/\D/g, '');
          return date.length === 8;
        }
        case 'weight': return profileData.weight && parseFloat(profileData.weight) > 0;
        case 'height': return profileData.height && parseFloat(profileData.height) > 0;
        case 'sex': return profileData.sex !== '';
        case 'activityLevel': return profileData.activityLevel !== '';
        default: return false;
      }
    }).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const getDefaultName = () => `Comensal ${profileIndex + 1}`;

  const getInitials = (name: string) => {
    if (!name) return `C${profileIndex + 1}`;
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getProfileColor = (index: number) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    return colors[index % colors.length];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end p-4" style={{ paddingTop: '120px', paddingBottom: '16px' }}>
      <Card className="w-full max-w-md max-h-[calc(100vh-136px)] flex flex-col rounded-3xl border-0 shadow-2xl mx-auto">
        {/* Header with profile info */}
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-shrink-0 w-12 h-12">
              <svg className="absolute inset-0 w-12 h-12" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="24" cy="24" r="22" stroke="#E5E5E5" strokeWidth="2.5" fill="none" />
                <circle
                  cx="24" cy="24" r="22" stroke="#10B981" strokeWidth="2.5" fill="none"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - getCompletionPercentage() / 100)}`}
                  strokeLinecap="round" className="transition-all duration-300"
                />
              </svg>
              <div 
                className="absolute inset-[5px] rounded-full flex items-center justify-center text-xs font-medium"
                style={{ 
                  backgroundColor: getProfileColor(profileIndex), 
                  color: 'rgba(255, 255, 255, 0.8)' 
                }}
              >
                {getInitials(profileData.name)}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">
                {profileData.name || getDefaultName()}
              </p>
              <p className="text-xs text-muted-foreground">
                {getCompletionPercentage()}% completado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        {/* Content */}
        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {currentStep !== 'name' && (
                <button
                  onClick={handleBack}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-accent rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <h3 className="text-base font-medium">{getStepTitle()}</h3>
            </div>
            
            {currentStep === 'name' && (
              <Input
                ref={nameInputRef}
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Escribe tu nombre"
                className="w-full"
                autoFocus
              />
            )}

            {currentStep === 'birthDate' && (
              <Input
                ref={birthDateInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={profileData.birthDate}
                onChange={handleBirthDateChange}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className="w-full"
                autoFocus
              />
            )}

            {currentStep === 'weight' && (
              <div className="space-y-4">
                <Input
                  ref={weightInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={profileData.weight}
                  onChange={(e) => setProfileData({ ...profileData, weight: e.target.value.replace(/\D/g, '') })}
                  placeholder="Escribe tu peso"
                  className="w-full"
                  autoFocus
                />
                <div className="flex gap-2">
                  {['kg', 'lb', 'st'].map(unit => (
                    <button
                      key={unit}
                      onClick={() => setProfileData({ ...profileData, weightUnit: unit })}
                      className={cn(
                        "px-4 py-2 rounded-lg border transition-colors",
                        profileData.weightUnit === unit 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-background hover:bg-accent"
                      )}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'height' && (
              <div className="space-y-4">
                <Input
                  ref={heightInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={profileData.height}
                  onChange={(e) => setProfileData({ ...profileData, height: e.target.value.replace(/\D/g, '') })}
                  placeholder="Escribe tu altura"
                  className="w-full"
                  autoFocus
                />
                <div className="flex gap-2">
                  {['cm', 'ft'].map(unit => (
                    <button
                      key={unit}
                      onClick={() => setProfileData({ ...profileData, heightUnit: unit })}
                      className={cn(
                        "px-4 py-2 rounded-lg border transition-colors",
                        profileData.heightUnit === unit 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-background hover:bg-accent"
                      )}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'sex' && (
              <div className="space-y-2">
                {['Masculino', 'Femenino', 'Otro'].map(option => (
                  <button
                    key={option}
                    onClick={() => setProfileData({ ...profileData, sex: option })}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border transition-colors text-left",
                      profileData.sex === option 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-background hover:bg-accent"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentStep === 'activityLevel' && (
              <div className="space-y-2">
                {['Bajo', 'Moderado', 'Alto', 'Muy alto'].map(option => (
                  <button
                    key={option}
                    onClick={() => setProfileData({ ...profileData, activityLevel: option })}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border transition-colors text-left",
                      profileData.activityLevel === option 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-background hover:bg-accent"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        {/* Bottom button - part of the card */}
        <div className="p-4 border-t flex-shrink-0">
          <Button
            onClick={handleContinue}
            disabled={!canContinue()}
            className="w-full"
          >
            Continuar
          </Button>
        </div>
      </Card>
    </div>
  );
};
