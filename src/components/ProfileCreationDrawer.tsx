import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { X, ChevronLeft, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Keyboard } from '@capacitor/keyboard';
interface ProfileCreationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: any) => void;
  editingProfile?: any;
  profileIndex?: number;
}
type Step = 'overview' | 'name' | 'diet' | 'allergies' | 'goal' | 'weight' | 'height' | 'birthdate' | 'sex' | 'activityLevel';
export const ProfileCreationDrawer = ({
  isOpen,
  onClose,
  onSave,
  editingProfile,
  profileIndex = 0
}: ProfileCreationDrawerProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('name');
  const [returnToOverview, setReturnToOverview] = useState(false);

  // Typewriter effect states for name step
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const fullText = "Escribe el nombre o alias para este comensal";

  // Typewriter effect states for diet step
  const [dietDisplayedText, setDietDisplayedText] = useState('');
  const [dietShowCursor, setDietShowCursor] = useState(false);
  const [dietShowOptions, setDietShowOptions] = useState(false);

  // Typewriter effect states for allergies step
  const [allergiesDisplayedText, setAllergiesDisplayedText] = useState('');
  const [allergiesShowCursor, setAllergiesShowCursor] = useState(false);
  const [allergiesShowOptions, setAllergiesShowOptions] = useState(false);

  // Typewriter effect states for goal step
  const [goalDisplayedText, setGoalDisplayedText] = useState('');
  const [goalSubtext, setGoalSubtext] = useState('');
  const [goalShowCursor, setGoalShowCursor] = useState(false);
  const [goalShowOptions, setGoalShowOptions] = useState(false);

  // Typewriter effect states for weight step
  const [weightDisplayedText, setWeightDisplayedText] = useState('');
  const [weightShowCursor, setWeightShowCursor] = useState(false);
  const [weightShowInput, setWeightShowInput] = useState(false);

  // Typewriter effect states for height step
  const [heightDisplayedText, setHeightDisplayedText] = useState('');
  const [heightShowCursor, setHeightShowCursor] = useState(false);
  const [heightShowInput, setHeightShowInput] = useState(false);

  // Typewriter effect states for birthdate step
  const [birthdateDisplayedText, setBirthdateDisplayedText] = useState('');
  const [birthdateShowCursor, setBirthdateShowCursor] = useState(false);
  const [birthdateShowInput, setBirthdateShowInput] = useState(false);

  // Typewriter effect states for sex step
  const [sexDisplayedText, setSexDisplayedText] = useState('');
  const [sexShowCursor, setSexShowCursor] = useState(false);
  const [sexShowOptions, setSexShowOptions] = useState(false);

  // Typewriter effect states for activityLevel step
  const [activityDisplayedText, setActivityDisplayedText] = useState('');
  const [activityShowCursor, setActivityShowCursor] = useState(false);
  const [activityShowOptions, setActivityShowOptions] = useState(false);

  // Parse existing data if editing
  const parseBirthDate = (birthDateStr?: string) => {
    if (!birthDateStr) return {
      day: '',
      month: '',
      year: ''
    };
    const parts = birthDateStr.split('/');
    if (parts.length === 3) {
      return {
        day: parts[0],
        month: parts[1],
        year: parts[2]
      };
    }
    return {
      day: '',
      month: '',
      year: ''
    };
  };
  const parseWeight = (weightStr?: string) => {
    if (!weightStr) return {
      value: '',
      unit: 'kg'
    };
    const parts = weightStr.split(' ');
    return {
      value: parts[0] || '',
      unit: parts[1] || 'kg'
    };
  };
  const parseHeight = (heightStr?: string) => {
    if (!heightStr) return {
      value: '',
      unit: 'cm'
    };
    const parts = heightStr.split(' ');
    return {
      value: parts[0] || '',
      unit: parts[1] || 'cm'
    };
  };
  const [profileData, setProfileData] = useState({
    name: editingProfile?.name || '',
    diet: editingProfile?.diet || '',
    allergies: editingProfile?.allergies || [],
    goal: editingProfile?.goal || '',
    weight: parseWeight(editingProfile?.weight).value,
    weightUnit: parseWeight(editingProfile?.weight).unit,
    height: parseHeight(editingProfile?.height).value,
    heightUnit: parseHeight(editingProfile?.height).unit,
    birthDate: editingProfile?.birthDate || '',
    sex: editingProfile?.sex || '',
    activityLevel: editingProfile?.activityLevel || ''
  });

  // Compute dietFullText based on profileData.name using useMemo
  const dietFullText = useMemo(() => 
    `¿${profileData.name || 'Este comensal'} tiene algún tipo de preferencia alimentaria?`,
    [profileData.name]
  );

  // Compute allergiesFullText based on profileData.name using useMemo
  const allergiesFullText = useMemo(() => 
    `¿${profileData.name || 'Este comensal'} tiene alguna alergia o intolerancia?`,
    [profileData.name]
  );

  // Compute goalFullText based on profileData.name using useMemo
  const goalFullText = useMemo(() => 
    `¿Cuál es el objetivo de ${profileData.name || 'este comensal'}?`,
    [profileData.name]
  );

  const goalSubtextFull = "Esto nos ayudará a generar un plan para su gesta calórica";

  // Text for weight step
  const weightFullText = useMemo(() => 
    `¿Cuál es el peso actual de ${profileData.name || 'este comensal'}?`,
    [profileData.name]
  );

  // Text for height step
  const heightFullText = useMemo(() => 
    `¿Cuál es la altura de ${profileData.name || 'este comensal'}?`,
    [profileData.name]
  );

  // Text for birthdate step
  const birthdateFullText = useMemo(() => 
    `¿Cuál es la fecha de nacimiento de ${profileData.name || 'este comensal'}?`,
    [profileData.name]
  );

  // Text for sex step
  const sexFullText = useMemo(() => 
    `¿Cuál es el sexo de ${profileData.name || 'este comensal'}?`,
    [profileData.name]
  );

  // Text for activity level step
  const activityFullText = useMemo(() => 
    `¿Cuál es el nivel de actividad física de ${profileData.name || 'este comensal'}?`,
    [profileData.name]
  );

  const nameInputRef = useRef<HTMLInputElement>(null);
  const weightInputRef = useRef<HTMLInputElement>(null);
  const heightInputRef = useRef<HTMLInputElement>(null);

  // Prevent background scroll and keyboard behavior when drawer is open
  useEffect(() => {
    if (isOpen) {
      // Configure keyboard to not resize viewport
      Keyboard.setResizeMode({
        mode: 'none' as any
      }).catch(err => {
        console.log('Keyboard plugin not available:', err);
      });

      // Fix body scroll and position
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.left = '0';
      document.body.style.right = '0';
      return () => {
        // Restore scroll position
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.left = '';
        document.body.style.right = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Typewriter effect for name step
  useEffect(() => {
    if (!isOpen || currentStep !== 'name') {
      setDisplayedText('');
      setShowCursor(false);
      setShowInput(false);
      return;
    }

    // Start typewriter
    if (displayedText.length === 0) {
      setTimeout(() => {
        setDisplayedText(fullText[0]);
        setShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep]);

  // Typewriter effect for diet step
  useEffect(() => {
    if (!isOpen || currentStep !== 'diet') {
      setDietDisplayedText('');
      setDietShowCursor(false);
      setDietShowOptions(false);
      return;
    }

    // Start typewriter
    if (dietDisplayedText.length === 0) {
      setTimeout(() => {
        setDietDisplayedText(dietFullText[0]);
        setDietShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, dietFullText]);
  useEffect(() => {
    if (!isOpen || currentStep !== 'name') return;
    if (displayedText.length > 0 && displayedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else if (displayedText.length === fullText.length && showCursor) {
      setTimeout(() => {
        setShowCursor(false);
        setShowInput(true);
      }, 200);
    }
  }, [displayedText, fullText, showCursor, isOpen, currentStep]);

  useEffect(() => {
    if (!isOpen || currentStep !== 'diet') return;
    if (dietDisplayedText.length > 0 && dietDisplayedText.length < dietFullText.length) {
      const timeout = setTimeout(() => {
        setDietDisplayedText(dietFullText.slice(0, dietDisplayedText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else if (dietDisplayedText.length === dietFullText.length && dietShowCursor) {
      setTimeout(() => {
        setDietShowCursor(false);
        setDietShowOptions(true);
      }, 200);
    }
  }, [dietDisplayedText, dietFullText, dietShowCursor, isOpen, currentStep]);

  // Typewriter effect for allergies step
  useEffect(() => {
    if (!isOpen || currentStep !== 'allergies') {
      setAllergiesDisplayedText('');
      setAllergiesShowCursor(false);
      setAllergiesShowOptions(false);
      return;
    }

    // Start typewriter
    if (allergiesDisplayedText.length === 0) {
      setTimeout(() => {
        setAllergiesDisplayedText(allergiesFullText[0]);
        setAllergiesShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, allergiesFullText]);

  useEffect(() => {
    if (!isOpen || currentStep !== 'allergies') return;
    if (allergiesDisplayedText.length > 0 && allergiesDisplayedText.length < allergiesFullText.length) {
      const timeout = setTimeout(() => {
        setAllergiesDisplayedText(allergiesFullText.slice(0, allergiesDisplayedText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else if (allergiesDisplayedText.length === allergiesFullText.length && allergiesShowCursor) {
      setTimeout(() => {
        setAllergiesShowCursor(false);
        setAllergiesShowOptions(true);
      }, 200);
    }
  }, [allergiesDisplayedText, allergiesFullText, allergiesShowCursor, isOpen, currentStep]);

  // Typewriter effect for goal step
  useEffect(() => {
    if (!isOpen || currentStep !== 'goal') {
      setGoalDisplayedText('');
      setGoalSubtext('');
      setGoalShowCursor(false);
      setGoalShowOptions(false);
      return;
    }

    // Start typewriter for main text
    if (goalDisplayedText.length === 0) {
      setTimeout(() => {
        setGoalDisplayedText(goalFullText[0]);
        setGoalShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, goalFullText]);

  useEffect(() => {
    if (!isOpen || currentStep !== 'goal') return;
    
    // Type main text
    if (goalDisplayedText.length > 0 && goalDisplayedText.length < goalFullText.length) {
      const timeout = setTimeout(() => {
        setGoalDisplayedText(goalFullText.slice(0, goalDisplayedText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } 
    // When main text is complete, start subtext
    else if (goalDisplayedText.length === goalFullText.length && goalSubtext.length === 0) {
      setTimeout(() => {
        setGoalShowCursor(false);
        setGoalSubtext(goalSubtextFull[0]);
      }, 200);
    }
    // Type subtext
    else if (goalSubtext.length > 0 && goalSubtext.length < goalSubtextFull.length) {
      const timeout = setTimeout(() => {
        setGoalSubtext(goalSubtextFull.slice(0, goalSubtext.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    }
    // When all text is complete, show options
    else if (goalSubtext.length === goalSubtextFull.length) {
      setTimeout(() => {
        setGoalShowOptions(true);
      }, 200);
    }
  }, [goalDisplayedText, goalFullText, goalSubtext, goalSubtextFull, isOpen, currentStep]);

  // Typewriter effect for weight step
  useEffect(() => {
    if (!isOpen || currentStep !== 'weight') {
      setWeightDisplayedText('');
      setWeightShowCursor(false);
      setWeightShowInput(false);
      return;
    }

    if (weightDisplayedText.length === 0) {
      setTimeout(() => {
        setWeightDisplayedText(weightFullText[0]);
        setWeightShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, weightFullText]);

  useEffect(() => {
    if (!isOpen || currentStep !== 'weight') return;
    if (weightDisplayedText.length > 0 && weightDisplayedText.length < weightFullText.length) {
      const timeout = setTimeout(() => {
        setWeightDisplayedText(weightFullText.slice(0, weightDisplayedText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else if (weightDisplayedText.length === weightFullText.length && weightShowCursor) {
      setTimeout(() => {
        setWeightShowCursor(false);
        setWeightShowInput(true);
      }, 200);
    }
  }, [weightDisplayedText, weightFullText, weightShowCursor, isOpen, currentStep]);

  // Typewriter effect for height step
  useEffect(() => {
    if (!isOpen || currentStep !== 'height') {
      setHeightDisplayedText('');
      setHeightShowCursor(false);
      setHeightShowInput(false);
      return;
    }

    if (heightDisplayedText.length === 0) {
      setTimeout(() => {
        setHeightDisplayedText(heightFullText[0]);
        setHeightShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, heightFullText]);

  useEffect(() => {
    if (!isOpen || currentStep !== 'height') return;
    if (heightDisplayedText.length > 0 && heightDisplayedText.length < heightFullText.length) {
      const timeout = setTimeout(() => {
        setHeightDisplayedText(heightFullText.slice(0, heightDisplayedText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else if (heightDisplayedText.length === heightFullText.length && heightShowCursor) {
      setTimeout(() => {
        setHeightShowCursor(false);
        setHeightShowInput(true);
      }, 200);
    }
  }, [heightDisplayedText, heightFullText, heightShowCursor, isOpen, currentStep]);

  // Typewriter effect for birthdate step
  useEffect(() => {
    if (!isOpen || currentStep !== 'birthdate') {
      setBirthdateDisplayedText('');
      setBirthdateShowCursor(false);
      setBirthdateShowInput(false);
      return;
    }

    if (birthdateDisplayedText.length === 0) {
      setTimeout(() => {
        setBirthdateDisplayedText(birthdateFullText[0]);
        setBirthdateShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, birthdateFullText]);

  useEffect(() => {
    if (!isOpen || currentStep !== 'birthdate') return;
    if (birthdateDisplayedText.length > 0 && birthdateDisplayedText.length < birthdateFullText.length) {
      const timeout = setTimeout(() => {
        setBirthdateDisplayedText(birthdateFullText.slice(0, birthdateDisplayedText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else if (birthdateDisplayedText.length === birthdateFullText.length && birthdateShowCursor) {
      setTimeout(() => {
        setBirthdateShowCursor(false);
        setBirthdateShowInput(true);
      }, 200);
    }
  }, [birthdateDisplayedText, birthdateFullText, birthdateShowCursor, isOpen, currentStep]);

  // Typewriter effect for sex step
  useEffect(() => {
    if (!isOpen || currentStep !== 'sex') {
      setSexDisplayedText('');
      setSexShowCursor(false);
      setSexShowOptions(false);
      return;
    }

    if (sexDisplayedText.length === 0) {
      setTimeout(() => {
        setSexDisplayedText(sexFullText[0]);
        setSexShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, sexFullText]);

  useEffect(() => {
    if (!isOpen || currentStep !== 'sex') return;
    if (sexDisplayedText.length > 0 && sexDisplayedText.length < sexFullText.length) {
      const timeout = setTimeout(() => {
        setSexDisplayedText(sexFullText.slice(0, sexDisplayedText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else if (sexDisplayedText.length === sexFullText.length && sexShowCursor) {
      setTimeout(() => {
        setSexShowCursor(false);
        setSexShowOptions(true);
      }, 200);
    }
  }, [sexDisplayedText, sexFullText, sexShowCursor, isOpen, currentStep]);

  // Typewriter effect for activity level step
  useEffect(() => {
    if (!isOpen || currentStep !== 'activityLevel') {
      setActivityDisplayedText('');
      setActivityShowCursor(false);
      setActivityShowOptions(false);
      return;
    }

    if (activityDisplayedText.length === 0) {
      setTimeout(() => {
        setActivityDisplayedText(activityFullText[0]);
        setActivityShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, activityFullText]);

  useEffect(() => {
    if (!isOpen || currentStep !== 'activityLevel') return;
    if (activityDisplayedText.length > 0 && activityDisplayedText.length < activityFullText.length) {
      const timeout = setTimeout(() => {
        setActivityDisplayedText(activityFullText.slice(0, activityDisplayedText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else if (activityDisplayedText.length === activityFullText.length && activityShowCursor) {
      setTimeout(() => {
        setActivityShowCursor(false);
        setActivityShowOptions(true);
      }, 200);
    }
  }, [activityDisplayedText, activityFullText, activityShowCursor, isOpen, currentStep]);

  // Show keyboard immediately when drawer opens for name step
  useEffect(() => {
    if (!isOpen) return;

    if (currentStep === 'name') {
      // Show keyboard immediately
      Keyboard.show().catch(err => {
        console.log('Keyboard show not available:', err);
      });
    }
  }, [isOpen, currentStep]);

  // Focus input when it appears
  useEffect(() => {
    if (!isOpen) return;

    requestAnimationFrame(() => {
      const input = (() => {
        switch (currentStep) {
          case 'name':
            return showInput ? nameInputRef.current : null;
          case 'weight':
            return weightInputRef.current;
          case 'height':
            return heightInputRef.current;
          default:
            return null;
        }
      })();
      if (input) {
        input.focus({
          preventScroll: true
        });
      }
    });
  }, [isOpen, currentStep, showInput]);
  const getStepTitle = () => {
    const isEditing = editingProfile;
    switch (currentStep) {
      case 'name':
        return isEditing?.name ? 'Actualizar nombre' : 'Añadir nombre';
      case 'diet':
        return isEditing?.diet ? 'Actualizar dieta' : 'Añadir dieta';
      case 'allergies':
        return isEditing?.allergies ? 'Actualizar alergias' : 'Añadir alergias';
      case 'goal':
        return isEditing?.goal ? 'Actualizar objetivo' : 'Añadir objetivo';
      case 'weight':
        return isEditing?.weight ? 'Actualizar peso' : 'Añadir peso';
      case 'height':
        return isEditing?.height ? 'Actualizar altura' : 'Añadir altura';
      case 'birthdate':
        return isEditing?.birthDate ? 'Actualizar fecha de nacimiento' : 'Añadir fecha de nacimiento';
      case 'sex':
        return isEditing?.sex ? 'Actualizar sexo' : 'Añadir sexo';
      case 'activityLevel':
        return isEditing?.activityLevel ? 'Actualizar nivel de actividad' : 'Añadir nivel de actividad';
      default:
        return '';
    }
  };
  const canContinue = () => {
    switch (currentStep) {
      case 'name':
        return profileData.name.trim().length > 0;
      case 'diet':
        return profileData.diet !== '';
      case 'allergies':
        return profileData.allergies.length > 0;
      case 'goal':
        return profileData.goal !== '';
      case 'weight':
        return profileData.weight && parseFloat(profileData.weight) > 0;
      case 'height':
        return profileData.height && parseFloat(profileData.height) > 0;
      case 'birthdate':
        return profileData.birthDate !== '';
      case 'sex':
        return profileData.sex !== '';
      case 'activityLevel':
        return profileData.activityLevel !== '';
      default:
        return false;
    }
  };
  const handleContinue = () => {
    const steps: Step[] = ['name', 'diet', 'allergies', 'goal', 'weight', 'height', 'birthdate', 'sex', 'activityLevel'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
      setReturnToOverview(false);
    } else {
      // Last step - save profile
      onSave(profileData);
    }
  };
  const handleBack = () => {
    if (currentStep === 'overview') {
      return;
    }
    
    if (returnToOverview) {
      setCurrentStep('overview');
      setReturnToOverview(false);
      return;
    }

    const steps: Step[] = ['name', 'diet', 'allergies', 'goal', 'weight', 'height', 'birthdate', 'sex', 'activityLevel'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };
  const getCompletionPercentage = () => {
    const steps: Step[] = ['name', 'diet', 'allergies', 'goal', 'weight', 'height', 'birthdate', 'sex', 'activityLevel'];
    const completedSteps = steps.filter(step => {
      switch (step) {
        case 'name':
          return profileData.name.trim().length > 0;
        case 'diet':
          return profileData.diet !== '';
        case 'allergies':
          return true; // Always considered complete
        case 'goal':
          return profileData.goal !== '';
        case 'weight':
          return profileData.weight && parseFloat(profileData.weight) > 0;
        case 'height':
          return profileData.height && parseFloat(profileData.height) > 0;
        case 'birthdate':
          return profileData.birthDate !== '';
        case 'sex':
          return profileData.sex !== '';
        case 'activityLevel':
          return profileData.activityLevel !== '';
        default:
          return false;
      }
    }).length;
    return Math.round(completedSteps / steps.length * 100);
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

  const handleQuickEdit = (step: Step) => {
    setCurrentStep(step);
    setReturnToOverview(true);
  };

  const menuItems = [
    { step: 'name' as Step, label: 'Nombre', value: profileData.name },
    { step: 'diet' as Step, label: 'Preferencia alimentaria', value: profileData.diet },
    { step: 'allergies' as Step, label: 'Alergias e intolerancias', value: profileData.allergies.length > 0 ? `${profileData.allergies.length}` : '' },
    { step: 'goal' as Step, label: 'Objetivo', value: profileData.goal },
    { step: 'weight' as Step, label: 'Peso', value: profileData.weight ? `${profileData.weight} ${profileData.weightUnit}` : '' },
    { step: 'height' as Step, label: 'Altura', value: profileData.height ? `${profileData.height} ${profileData.heightUnit}` : '' },
    { step: 'sex' as Step, label: 'Sexo', value: profileData.sex },
    { step: 'activityLevel' as Step, label: 'Nivel de actividad', value: profileData.activityLevel },
  ];
  if (!isOpen) return null;
  return <div className="fixed z-50 flex justify-center" style={{
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: '16px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}>
        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      <Card className="relative w-full max-w-md flex flex-col rounded-3xl border-0 shadow-2xl mx-4 self-start overflow-hidden" style={{
      marginTop: '100px',
      maxHeight: 'calc(100% - 116px)'
    }}>
        {/* Header with profile info */}
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b flex-shrink-0">
          <button 
            onClick={() => setCurrentStep('overview')}
            className="flex items-center gap-3 flex-1 hover:bg-accent/50 rounded-lg p-1 -m-1 transition-colors"
          >
            <div className="relative flex-shrink-0 w-12 h-12">
              <svg className="absolute inset-0 w-12 h-12" style={{
              transform: 'rotate(-90deg)'
            }}>
                <circle cx="24" cy="24" r="22" stroke="#E5E5E5" strokeWidth="2.5" fill="none" />
                <circle cx="24" cy="24" r="22" stroke="#10B981" strokeWidth="2.5" fill="none" strokeDasharray={`${2 * Math.PI * 22}`} strokeDashoffset={`${2 * Math.PI * 22 * (1 - getCompletionPercentage() / 100)}`} strokeLinecap="round" className="transition-all duration-300" />
              </svg>
              <div className="absolute inset-[5px] rounded-full flex items-center justify-center text-xs font-medium" style={{
              backgroundColor: getProfileColor(profileIndex),
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
                {getInitials(profileData.name)}
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">
                {profileData.name || getDefaultName()}
              </p>
              <p className="text-xs text-muted-foreground">
                {getCompletionPercentage()}% completado
              </p>
            </div>
          </button>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        {/* Content */}
        <CardContent className="flex-1 overflow-y-auto p-4" style={{
        paddingBottom: (currentStep === 'name' || currentStep === 'diet' || currentStep === 'allergies' || currentStep === 'goal' || currentStep === 'weight' || currentStep === 'height' || currentStep === 'birthdate' || currentStep === 'sex' || currentStep === 'activityLevel') ? '120px' : '16px'
      }}>
          <div className="space-y-4">
            
            {/* Overview menu */}
            {currentStep === 'overview' && (
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.step}
                    onClick={() => handleQuickEdit(item.step)}
                    className="w-full flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-accent text-left"
                  >
                    <span className="text-sm font-medium flex-shrink-0">{item.label}</span>
                    <span className="text-sm text-muted-foreground text-right ml-4">
                      {item.value || 'Añadir'}
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            {currentStep === 'name' && <div className="space-y-6">
                {/* Bot message with typewriter */}
                <div className="mb-6">
                  <div className="flex justify-start">
                    <div className="max-w-xs">
                      <p className="text-base leading-relaxed text-left text-[#1C1C1C]">
                        {displayedText}
                        {showCursor && <span className="animate-pulse">|</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Input field - appears after typewriter completes */}
                {showInput && <div className="mb-6 animate-fade-in">
                    <Input ref={nameInputRef} type="text" value={profileData.name} onChange={e => setProfileData({
                ...profileData,
                name: e.target.value
              })} placeholder="Escribe aqui" className="w-full border-0 focus:border focus-visible:ring-0 focus-visible:ring-offset-0" style={{
                backgroundColor: '#F4F4F4',
                borderColor: 'transparent'
              }} onFocus={(e) => {
                e.target.style.borderColor = '#020817';
                e.target.style.borderWidth = '1px';
              }} onBlur={e => {
                e.target.style.borderColor = 'transparent';
                e.preventDefault();
                setTimeout(() => e.target.focus({
                  preventScroll: true
                }), 0);
              }} autoFocus />
                  </div>}

                {/* User tag bubble - appears when typing */}
                {profileData.name && showInput}
              </div>}

            {currentStep === 'diet' && <div className="space-y-6">
                {/* Bot message with typewriter */}
                <div className="mb-6">
                  <div className="flex justify-start">
                    <div className="max-w-xs">
                      <p className="text-base leading-relaxed text-left text-[#1C1C1C]">
                        {dietDisplayedText}
                        {dietShowCursor && <span className="animate-pulse">|</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Diet options - appears after typewriter completes */}
                {dietShowOptions && <div className="mb-6 space-y-2">
                    {['Sin preferencia alimentaria', 'Pescetariano', 'Vegetariano', 'Vegano'].map((option, index) => {
                      const isSelected = profileData.diet === option;
                      return (
                        <button 
                          key={option} 
                          onClick={() => setProfileData({
                            ...profileData,
                            diet: profileData.diet === option ? '' : option
                          })} 
                          className={cn("w-full px-4 py-3 rounded-lg text-left text-base font-medium", isSelected ? "" : "border-0")} 
                          style={{
                            opacity: 0,
                            transform: 'translateY(10px)',
                            animation: `fadeInUp 0.4s ease-out ${index * 0.15}s forwards`,
                            ...(isSelected ? { backgroundColor: '#D9DADC', border: '1px solid #020817', color: '#020817' } : { backgroundColor: '#F4F4F4' })
                          }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>}
              </div>}

            {currentStep === 'allergies' && <div className="space-y-6">
                {/* Bot message with typewriter */}
                <div className="mb-6">
                  <div className="flex justify-start">
                    <div className="max-w-xs">
                      <p className="text-base leading-relaxed text-left text-[#1C1C1C]">
                        {allergiesDisplayedText}
                        {allergiesShowCursor && <span className="animate-pulse">|</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Allergies options - appears after typewriter completes */}
                {allergiesShowOptions && <div className="mb-6 space-y-0 -mx-4">
                    {[
                      'Sin alergias',
                      'Intolerancias al gluten',
                      'Intolerancias al trigo',
                      'Intolerancias a la lactosa',
                      'Alergia a la leche',
                      'Alergia al huevo',
                      'Alergia al marisco',
                      'Alergia al pescado',
                      'Alergia a las nueces'
                    ].map((option, index, array) => {
                      const isChecked = profileData.allergies.includes(option);
                      return (
                        <div key={option} style={{
                          opacity: 0,
                          transform: 'translateY(10px)',
                          animation: `fadeInUp 0.4s ease-out ${index * 0.1}s forwards`
                        }}>
                          <div
                            className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => {
                              let newAllergies;
                              if (option === 'Sin alergias') {
                                // If selecting "Sin alergias", clear all others
                                newAllergies = isChecked ? [] : ['Sin alergias'];
                              } else {
                                // If selecting another option, remove "Sin alergias" if present
                                if (isChecked) {
                                  newAllergies = profileData.allergies.filter((a: string) => a !== option);
                                } else {
                                  const withoutNoAllergies = profileData.allergies.filter((a: string) => a !== 'Sin alergias');
                                  newAllergies = [option, ...withoutNoAllergies];
                                }
                              }
                              setProfileData({
                                ...profileData,
                                allergies: newAllergies
                              });
                            }}
                          >
                            <span className="text-base font-normal">{option}</span>
                            <Switch 
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                let newAllergies;
                                if (option === 'Sin alergias') {
                                  // If selecting "Sin alergias", clear all others
                                  newAllergies = checked ? ['Sin alergias'] : [];
                                } else {
                                  // If selecting another option, remove "Sin alergias" if present
                                  if (checked) {
                                    const withoutNoAllergies = profileData.allergies.filter((a: string) => a !== 'Sin alergias');
                                    newAllergies = [option, ...withoutNoAllergies];
                                  } else {
                                    newAllergies = profileData.allergies.filter((a: string) => a !== option);
                                  }
                                }
                                setProfileData({
                                  ...profileData,
                                  allergies: newAllergies
                                });
                              }}
                            />
                          </div>
                          {index < array.length - 1 && (
                            <div className="border-b border-border mx-4" />
                          )}
                        </div>
                      );
                    })}
                  </div>}
              </div>}

            {currentStep === 'goal' && <div className="space-y-6">
                {/* Bot message with typewriter */}
                <div className="mb-6">
                  <div className="flex justify-start">
                    <div className="max-w-xs">
                      <p className="text-base leading-relaxed text-left text-[#1C1C1C]">
                        {goalDisplayedText}
                        {goalShowCursor && <span className="animate-pulse">|</span>}
                      </p>
                      {goalSubtext && (
                        <p className="text-sm leading-relaxed text-left text-muted-foreground mt-2">
                          {goalSubtext}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Goal options - appears after typewriter completes */}
                {goalShowOptions && <div className="mb-6 space-y-2">
                    {['Perder peso', 'Mantenerse', 'Aumentar peso', 'Aumentar músculo'].map((option, index) => {
                      const isSelected = profileData.goal === option;
                      return (
                        <button 
                          key={option} 
                          onClick={() => setProfileData({
                            ...profileData,
                            goal: profileData.goal === option ? '' : option
                          })} 
                          className={cn("w-full px-4 py-3 rounded-lg text-left text-base font-medium", isSelected ? "" : "border-0")} 
                          style={{
                            opacity: 0,
                            transform: 'translateY(10px)',
                            animation: `fadeInUp 0.4s ease-out ${index * 0.15}s forwards`,
                            ...(isSelected ? { backgroundColor: '#D9DADC', border: '1px solid #020817', color: '#020817' } : { backgroundColor: '#F4F4F4' })
                          }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>}
              </div>}

            {currentStep === 'weight' && <div className="space-y-6">
                {/* Bot message with typewriter */}
                <div className="mb-6">
                  <div className="flex justify-start">
                    <div className="max-w-xs">
                      <p className="text-base leading-relaxed text-left text-[#1C1C1C]">
                        {weightDisplayedText}
                        {weightShowCursor && <span className="animate-pulse">|</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Weight input - appears after typewriter completes */}
                {weightShowInput && <div className="relative">
                    <Input 
                      ref={weightInputRef} 
                      type="text" 
                      inputMode="numeric" 
                      pattern="[0-9]*" 
                      value={profileData.weight} 
                      onChange={e => setProfileData({
                        ...profileData,
                        weight: e.target.value.replace(/\D/g, '')
                      })} 
                      placeholder="Escribe el peso" 
                      className="w-full pr-16" 
                      autoFocus 
                      onBlur={e => {
                        e.preventDefault();
                        setTimeout(() => e.target.focus({
                          preventScroll: true
                        }), 0);
                      }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const units = ['kg', 'lb'];
                        const currentIndex = units.indexOf(profileData.weightUnit);
                        const nextIndex = (currentIndex + 1) % units.length;
                        setProfileData({
                          ...profileData,
                          weightUnit: units[nextIndex]
                        });
                      }} 
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm font-medium text-primary hover:bg-accent rounded-md transition-colors"
                    >
                      {profileData.weightUnit}
                    </button>
                  </div>}
              </div>}

            {currentStep === 'height' && <div className="space-y-6">
                {/* Bot message with typewriter */}
                <div className="mb-6">
                  <div className="flex justify-start">
                    <div className="max-w-xs">
                      <p className="text-base leading-relaxed text-left text-[#1C1C1C]">
                        {heightDisplayedText}
                        {heightShowCursor && <span className="animate-pulse">|</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Height input - appears after typewriter completes */}
                {heightShowInput && <div className="relative">
                    <Input 
                      ref={heightInputRef} 
                      type="text" 
                      inputMode="numeric" 
                      pattern="[0-9]*" 
                      value={profileData.height} 
                      onChange={e => setProfileData({
                        ...profileData,
                        height: e.target.value.replace(/\D/g, '')
                      })} 
                      placeholder="Escribe la altura" 
                      className="w-full pr-16" 
                      autoFocus 
                      onBlur={e => {
                        e.preventDefault();
                        setTimeout(() => e.target.focus({
                          preventScroll: true
                        }), 0);
                      }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const units = ['cm', 'ft'];
                        const currentIndex = units.indexOf(profileData.heightUnit);
                        const nextIndex = (currentIndex + 1) % units.length;
                        setProfileData({
                          ...profileData,
                          heightUnit: units[nextIndex]
                        });
                      }} 
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm font-medium text-primary hover:bg-accent rounded-md transition-colors"
                    >
                      {profileData.heightUnit}
                    </button>
                  </div>}
              </div>}

            {currentStep === 'birthdate' && <div className="space-y-6">
                {/* Bot message with typewriter */}
                <div className="mb-6">
                  <div className="flex justify-start">
                    <div className="max-w-xs">
                      <p className="text-base leading-relaxed text-left text-[#1C1C1C]">
                        {birthdateDisplayedText}
                        {birthdateShowCursor && <span className="animate-pulse">|</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Birthdate input - appears after typewriter completes */}
                {birthdateShowInput && <div className="relative">
                    <Input 
                      type="date" 
                      inputMode="numeric"
                      value={profileData.birthDate} 
                      onChange={e => setProfileData({
                        ...profileData,
                        birthDate: e.target.value
                      })} 
                      className="w-full" 
                      autoFocus
                      onBlur={e => {
                        e.preventDefault();
                        setTimeout(() => e.target.focus({
                          preventScroll: true
                        }), 0);
                      }}
                    />
                  </div>}
              </div>}

            {currentStep === 'sex' && <div className="space-y-6">
                {/* Bot message with typewriter */}
                <div className="mb-6">
                  <div className="flex justify-start">
                    <div className="max-w-xs">
                      <p className="text-base leading-relaxed text-left text-[#1C1C1C]">
                        {sexDisplayedText}
                        {sexShowCursor && <span className="animate-pulse">|</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sex options - appears after typewriter completes */}
                {sexShowOptions && <div className="mb-6 space-y-2">
                    {['Masculino', 'Femenino', 'Otro'].map((option, index) => {
                      const isSelected = profileData.sex === option;
                      return (
                        <button 
                          key={option} 
                          onClick={() => setProfileData({
                            ...profileData,
                            sex: profileData.sex === option ? '' : option
                          })} 
                          className={cn("w-full px-4 py-3 rounded-lg text-left text-base font-medium", isSelected ? "" : "border-0")} 
                          style={{
                            opacity: 0,
                            transform: 'translateY(10px)',
                            animation: `fadeInUp 0.4s ease-out ${index * 0.15}s forwards`,
                            ...(isSelected ? { backgroundColor: '#D9DADC', border: '1px solid #020817', color: '#020817' } : { backgroundColor: '#F4F4F4' })
                          }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>}
              </div>}

            {currentStep === 'activityLevel' && <div className="space-y-6">
                {/* Bot message with typewriter */}
                <div className="mb-6">
                  <div className="flex justify-start">
                    <div className="max-w-xs">
                      <p className="text-base leading-relaxed text-left text-[#1C1C1C]">
                        {activityDisplayedText}
                        {activityShowCursor && <span className="animate-pulse">|</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activity level options - appears after typewriter completes */}
                {activityShowOptions && <div className="mb-6 space-y-2">
                    {['Bajo', 'Moderado', 'Alto', 'Muy alto'].map((option, index) => {
                      const isSelected = profileData.activityLevel === option;
                      return (
                        <button 
                          key={option} 
                          onClick={() => setProfileData({
                            ...profileData,
                            activityLevel: profileData.activityLevel === option ? '' : option
                          })} 
                          className={cn("w-full px-4 py-3 rounded-lg text-left text-base font-medium", isSelected ? "" : "border-0")} 
                          style={{
                            opacity: 0,
                            transform: 'translateY(10px)',
                            animation: `fadeInUp 0.4s ease-out ${index * 0.15}s forwards`,
                            ...(isSelected ? { backgroundColor: '#D9DADC', border: '1px solid #020817', color: '#020817' } : { backgroundColor: '#F4F4F4' })
                          }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>}
              </div>}
          </div>
        </CardContent>

        {/* Bottom area - chat send style for name, diet, allergies, goal, weight, height, birthdate, sex, activityLevel steps */}
        {(currentStep === 'name' || currentStep === 'diet' || currentStep === 'allergies' || currentStep === 'goal' || currentStep === 'weight' || currentStep === 'height' || currentStep === 'birthdate' || currentStep === 'sex' || currentStep === 'activityLevel') && <div className="absolute left-0 right-0 bottom-0 z-[9999] rounded-b-3xl overflow-hidden" style={{
        backgroundColor: '#FFFFFF'
      }}>
            <div className="px-4 pt-4 flex items-center gap-2 border-t" style={{
          paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom) + 16px))'
        }}>
              {((currentStep === 'name' && profileData.name) || 
                (currentStep === 'diet' && profileData.diet) || 
                (currentStep === 'allergies' && profileData.allergies.length > 0) ||
                (currentStep === 'goal' && profileData.goal) ||
                (currentStep === 'weight' && profileData.weight) ||
                (currentStep === 'height' && profileData.height) ||
                (currentStep === 'birthdate' && profileData.birthDate) ||
                (currentStep === 'sex' && profileData.sex) ||
                (currentStep === 'activityLevel' && profileData.activityLevel)) &&
                <div className="flex-1 flex items-center gap-2 px-4 h-10 rounded-full overflow-x-auto scrollbar-hide" style={{
                  backgroundColor: '#F2F2F2',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}>
                  {currentStep === 'name' && (
                    <Badge variant="secondary" className="font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" style={{
                      backgroundColor: '#D9DADC',
                      color: '#020818',
                      borderRadius: '8px'
                    }}>
                      {profileData.name}
                    </Badge>
                  )}
                  {currentStep === 'diet' && (
                    <Badge variant="secondary" className="font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" style={{
                      backgroundColor: '#D9DADC',
                      color: '#020818',
                      borderRadius: '8px'
                    }}>
                      {profileData.diet}
                    </Badge>
                  )}
                  {currentStep === 'allergies' && profileData.allergies.map((allergy: string) => (
                    <Badge key={allergy} variant="secondary" className="font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" style={{
                      backgroundColor: '#D9DADC',
                      color: '#020818',
                      borderRadius: '8px'
                    }}>
                      {allergy}
                    </Badge>
                  ))}
                  {currentStep === 'goal' && (
                    <Badge variant="secondary" className="font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" style={{
                      backgroundColor: '#D9DADC',
                      color: '#020818',
                      borderRadius: '8px'
                    }}>
                      {profileData.goal}
                    </Badge>
                  )}
                  {currentStep === 'weight' && (
                    <Badge variant="secondary" className="font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" style={{
                      backgroundColor: '#D9DADC',
                      color: '#020818',
                      borderRadius: '8px'
                    }}>
                      {profileData.weight} {profileData.weightUnit}
                    </Badge>
                  )}
                  {currentStep === 'height' && (
                    <Badge variant="secondary" className="font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" style={{
                      backgroundColor: '#D9DADC',
                      color: '#020818',
                      borderRadius: '8px'
                    }}>
                      {profileData.height} {profileData.heightUnit}
                    </Badge>
                  )}
                  {currentStep === 'birthdate' && (
                    <Badge variant="secondary" className="font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" style={{
                      backgroundColor: '#D9DADC',
                      color: '#020818',
                      borderRadius: '8px'
                    }}>
                      {profileData.birthDate}
                    </Badge>
                  )}
                  {currentStep === 'sex' && (
                    <Badge variant="secondary" className="font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" style={{
                      backgroundColor: '#D9DADC',
                      color: '#020818',
                      borderRadius: '8px'
                    }}>
                      {profileData.sex}
                    </Badge>
                  )}
                  {currentStep === 'activityLevel' && (
                    <Badge variant="secondary" className="font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" style={{
                      backgroundColor: '#D9DADC',
                      color: '#020818',
                      borderRadius: '8px'
                    }}>
                      {profileData.activityLevel}
                    </Badge>
                  )}
                </div>
              }
              <button onClick={handleContinue} disabled={!canContinue()} className="w-10 h-10 rounded-full flex items-center justify-center border-0 p-0 flex-shrink-0 ml-auto" style={{
            backgroundColor: canContinue() ? '#000000' : '#898885',
            color: canContinue() ? '#ffffff' : '#F9F8F2',
            border: 'none',
            opacity: 1
          }}>
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>}

        {/* Save button for overview */}
        {currentStep === 'overview' && getCompletionPercentage() === 100 && (
          <div className="p-4 border-t flex-shrink-0">
            <Button onClick={() => onSave(profileData)} className="w-full">
              Guardar perfil
            </Button>
          </div>
        )}
      </Card>
    </div>;
};