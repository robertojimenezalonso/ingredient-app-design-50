import { useState, useEffect, useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X, ChevronLeft, ChevronRight, ArrowUp, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Keyboard } from '@capacitor/keyboard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AvatarOptionsSheet } from '@/components/AvatarOptionsSheet';
import { ImageCropDialog } from '@/components/ImageCropDialog';
import { useMealProfiles } from '@/hooks/useMealProfiles';
interface ProfileCreationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: any) => void;
  editingProfile?: any;
  profileIndex?: number;
  onDelete?: () => void;
}

export interface ProfileCreationDrawerRef {
  focusNameInput: () => void;
}

type Step = 'overview' | 'name' | 'diet' | 'allergies' | 'gustos' | 'goal' | 'weight' | 'height' | 'birthdate' | 'sex' | 'activityLevel' | 'loading' | 'macros';

export const ProfileCreationDrawer = forwardRef<ProfileCreationDrawerRef, ProfileCreationDrawerProps>(({
  isOpen,
  onClose,
  onSave,
  editingProfile,
  profileIndex = 0,
  onDelete
}, ref) => {
  const [currentStep, setCurrentStep] = useState<Step>('name');
  const [returnToOverview, setReturnToOverview] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarIcon, setShowAvatarIcon] = useState(false);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { createProfile, updateProfile, deleteProfile } = useMealProfiles();
  
  // Estado para trackear el ID del perfil en creación
  const [createdProfileId, setCreatedProfileId] = useState<string | null>(null);

  // Exponer método para hacer focus en el input de nombre desde el componente padre
  useImperativeHandle(ref, () => ({
    focusNameInput: () => {
      console.log('=== focusNameInput llamado ===');
      // Usar requestAnimationFrame para ejecutar después del próximo repaint
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (nameInputRef.current) {
            console.log('Haciendo focus y mostrando teclado');
            nameInputRef.current.focus();
            // Forzar apertura del teclado en móvil
            Keyboard.show().catch(err => console.log('Keyboard.show error (expected on web):', err));
          }
        });
      });
    }
  }), []);

  // Efecto para crear perfil inmediatamente cuando se abre el drawer en modo "crear nuevo"
  useEffect(() => {
    const initializeProfile = async () => {
      // Solo crear si el drawer está abierto, no hay editingProfile, y no hemos creado ya un perfil
      if (isOpen && !editingProfile && !createdProfileId) {
        console.log('=== Creando perfil inicial en BD ===');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const colors = ['#A4243B', '#BD632F', '#273E47', '#6E9075', '#EB6534', '#6494AA', '#90A959', '#64B6AC', '#6E8898', '#26A96C'];
        const defaultName = `Comensal ${profileIndex + 1}`;
        
        const newProfile = await createProfile({
          name: defaultName,
          profile_color: colors[profileIndex % colors.length]
        });

        if (newProfile) {
          console.log('Perfil creado con ID:', newProfile.id);
          setCreatedProfileId(newProfile.id);
        }
      }
    };

    initializeProfile();
  }, [isOpen, editingProfile, createdProfileId, profileIndex]);

  // Set initial step based on editingProfile when drawer opens
  useEffect(() => {
    if (isOpen && editingProfile?.name) {
      setCurrentStep('overview');
    } else if (isOpen) {
      setCurrentStep('name');
    }
    
    // Limpiar el ID creado cuando se cierra el drawer
    if (!isOpen) {
      setCreatedProfileId(null);
    }
  }, [isOpen, editingProfile?.name]);

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

  // Typewriter effect states for gustos step
  const [gustosDisplayedText, setGustosDisplayedText] = useState('');
  const [gustosShowCursor, setGustosShowCursor] = useState(false);
  const [gustosShowOptions, setGustosShowOptions] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  // State to track if gustos section has been submitted
  const [gustosSubmitted, setGustosSubmitted] = useState(false);
  
  // State to track if macros have been modified
  const [macrosModified, setMacrosModified] = useState(false);

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
      kg: '',
      grams: '',
      unit: 'kg'
    };
    
    // Extract unit (kg or lb)
    const parts = weightStr.split(' ');
    const value = parts[0] || '';
    const unit = parts[1] || 'kg';
    
    // Split kg and grams by decimal point
    const [kg, grams = ''] = value.split('.');
    
    return {
      kg,
      grams,
      unit
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
    name: '',
    diet: '',
    allergies: [],
    gustos: [],
    goal: '',
    weight: '',
    weightUnit: 'kg',
    height: '',
    heightUnit: 'cm',
    birthDate: '',
    sex: '',
    activityLevel: '',
    calories: 2000,
    carbs: 40,
    protein: 30,
    fat: 30,
  });

  // States for birthdate inputs
  const [birthdateDay, setBirthdateDay] = useState('');
  const [birthdateMonth, setBirthdateMonth] = useState('');
  const [birthdateYear, setBirthdateYear] = useState('');
  
  // States for weight inputs
  const [weightKg, setWeightKg] = useState('');
  const [weightGrams, setWeightGrams] = useState('');

  // Update profileData when editingProfile changes
  useEffect(() => {
    if (isOpen && editingProfile) {
      // Handle allergies: convert to array if it's a string
      let allergiesArray: string[] = [];
      if (editingProfile.allergies) {
        if (Array.isArray(editingProfile.allergies)) {
          allergiesArray = editingProfile.allergies;
        } else if (typeof editingProfile.allergies === 'string') {
          allergiesArray = editingProfile.allergies.split(',').map(a => a.trim()).filter(a => a.length > 0);
        }
      }
      
      // Handle gustos: convert to array if it's a string
      let gustosArray: string[] = [];
      if (editingProfile.gustos) {
        if (Array.isArray(editingProfile.gustos)) {
          gustosArray = editingProfile.gustos;
        } else if (typeof editingProfile.gustos === 'string') {
          gustosArray = editingProfile.gustos.split(',').map(g => g.trim()).filter(g => g.length > 0);
        }
      }
      
      // Set gustosSubmitted if editing profile has gustos
      setGustosSubmitted(gustosArray.length > 0);
      
      // Parse birthdate
      const birthDateParts = parseBirthDate(editingProfile.birthDate);
      setBirthdateDay(birthDateParts.day);
      setBirthdateMonth(birthDateParts.month);
      setBirthdateYear(birthDateParts.year);
      
      // Parse weight
      const weightParts = parseWeight(editingProfile.weight);
      setWeightKg(weightParts.kg);
      setWeightGrams(weightParts.grams);
      
      setProfileData({
        name: editingProfile.name || '',
        diet: editingProfile.diet || '',
        allergies: allergiesArray,
        gustos: gustosArray,
        goal: editingProfile.goal || editingProfile.healthGoal || '',
        weight: `${weightParts.kg}.${weightParts.grams}`,
        weightUnit: weightParts.unit,
        height: parseHeight(editingProfile.height).value,
        heightUnit: parseHeight(editingProfile.height).unit,
        birthDate: editingProfile.birthDate || '',
        sex: editingProfile.sex || '',
        activityLevel: editingProfile.activityLevel || '',
        calories: editingProfile.calories || 2000,
        carbs: editingProfile.carbs || 40,
        protein: editingProfile.protein || 30,
        fat: editingProfile.fat || 30,
      });
    } else if (isOpen && !editingProfile) {
      // Reset to default when adding new profile
      setBirthdateDay('');
      setBirthdateMonth('');
      setBirthdateYear('');
      setWeightKg('');
      setWeightGrams('');
      setGustosSubmitted(false);
      setMacrosModified(false);
      
      setProfileData({
        name: '',
        diet: '',
        allergies: [],
        gustos: [],
        goal: '',
        weight: '',
        weightUnit: 'kg',
        height: '',
        heightUnit: 'cm',
        birthDate: '',
        sex: '',
        activityLevel: '',
        calories: 2000,
        carbs: 40,
        protein: 30,
        fat: 30,
      });
    }
  }, [isOpen, editingProfile]);

  // Loading progress
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Store recommended macros
  const [recommendedMacros, setRecommendedMacros] = useState({
    carbs: 40,
    protein: 30,
    fat: 30,
    calories: 2000
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

  // Text for gustos step
  const gustosFullText = useMemo(() => 
    `Ayúdanos a entender un poco más qué tipos de comida le podría gustar a ${profileData.name || 'este comensal'}`,
    [profileData.name]
  );

  // Calculate recommended macros and calories based on profile data
  const calculateRecommendedMacros = () => {
    // Basic calorie calculation (simplified Harris-Benedict equation)
    const weight = parseFloat(profileData.weight) || 70;
    const height = parseFloat(profileData.height) || 170;
    const age = profileData.birthDate ? new Date().getFullYear() - new Date(profileData.birthDate).getFullYear() : 30;
    
    let bmr = 0;
    if (profileData.sex === 'Masculino') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multiplier
    let activityMultiplier = 1.2;
    switch (profileData.activityLevel) {
      case 'Bajo': activityMultiplier = 1.2; break;
      case 'Moderado': activityMultiplier = 1.55; break;
      case 'Alto': activityMultiplier = 1.725; break;
      case 'Muy alto': activityMultiplier = 1.9; break;
    }

    let calories = Math.round(bmr * activityMultiplier);

    // Adjust based on goal
    const goal = profileData.goal.toLowerCase();
    if (goal.includes('perder')) {
      calories = Math.round(calories * 0.8); // 20% deficit
    } else if (goal.includes('aumentar peso')) {
      calories = Math.round(calories * 1.15); // 15% surplus
    } else if (goal.includes('músculo')) {
      calories = Math.round(calories * 1.1); // 10% surplus
    }

    // Macro distribution based on goal
    let carbs = 40, protein = 30, fat = 30;
    if (goal.includes('perder')) {
      carbs = 35;
      protein = 35;
      fat = 30;
    } else if (goal.includes('músculo')) {
      carbs = 40;
      protein = 35;
      fat = 25;
    } else if (goal.includes('aumentar peso')) {
      carbs = 45;
      protein = 25;
      fat = 30;
    }

    return { carbs, protein, fat, calories };
  };

  const nameInputRef = useRef<HTMLInputElement>(null);
  const weightKgInputRef = useRef<HTMLInputElement>(null);
  const weightGramsInputRef = useRef<HTMLInputElement>(null);
  const heightInputRef = useRef<HTMLInputElement>(null);
  const dayInputRef = useRef<HTMLInputElement>(null);
  const monthInputRef = useRef<HTMLInputElement>(null);
  const yearInputRef = useRef<HTMLInputElement>(null);

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

  // Typewriter effect for name step - MODIFICADO para mostrar input inmediatamente
  useEffect(() => {
    if (!isOpen || currentStep !== 'name') {
      setDisplayedText('');
      setShowCursor(false);
      setShowInput(false);
      return;
    }

    // NUEVO: Mostrar input INMEDIATAMENTE para que el usuario pueda hacer tap
    setShowInput(true);

    // Skip animation if profile already has a name (editing existing profile)
    if (profileData.name) {
      setDisplayedText(fullText);
      setShowCursor(false);
      return;
    }

    // Start typewriter - pero el input YA está visible
    if (displayedText.length === 0) {
      setTimeout(() => {
        setDisplayedText(fullText[0]);
        setShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, profileData.name]);

  // Typewriter effect for diet step
  useEffect(() => {
    if (!isOpen || currentStep !== 'diet') {
      setDietDisplayedText('');
      setDietShowCursor(false);
      setDietShowOptions(false);
      return;
    }

    // Skip animation if diet is already selected
    if (profileData.diet) {
      setDietDisplayedText(dietFullText);
      setDietShowCursor(false);
      setDietShowOptions(true);
      return;
    }

    // Start typewriter
    if (dietDisplayedText.length === 0) {
      setTimeout(() => {
        setDietDisplayedText(dietFullText[0]);
        setDietShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, dietFullText, profileData.diet]);
  // Typewriter animation loop for name - YA NO establece showInput
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
        // YA NO hace setShowInput(true) aquí porque se hace inmediatamente
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

    // Skip animation if allergies are already set
    if (profileData.allergies && profileData.allergies.length > 0) {
      setAllergiesDisplayedText(allergiesFullText);
      setAllergiesShowCursor(false);
      setAllergiesShowOptions(true);
      return;
    }

    // Start typewriter
    if (allergiesDisplayedText.length === 0) {
      setTimeout(() => {
        setAllergiesDisplayedText(allergiesFullText[0]);
        setAllergiesShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, allergiesFullText, profileData.allergies]);

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

    // Skip animation if goal is already set
    if (profileData.goal) {
      setGoalDisplayedText(goalFullText);
      setGoalSubtext(goalSubtextFull);
      setGoalShowCursor(false);
      setGoalShowOptions(true);
      return;
    }

    // Start typewriter for main text
    if (goalDisplayedText.length === 0) {
      setTimeout(() => {
        setGoalDisplayedText(goalFullText[0]);
        setGoalShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, goalFullText, profileData.goal]);

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

    // Mostrar input inmediatamente
    setWeightShowInput(true);

    // Skip animation if weight is already set
    if (profileData.weight) {
      setWeightDisplayedText(weightFullText);
      setWeightShowCursor(false);
      return;
    }

    if (weightDisplayedText.length === 0) {
      setTimeout(() => {
        setWeightDisplayedText(weightFullText[0]);
        setWeightShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, weightFullText, profileData.weight]);

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

    // Mostrar input inmediatamente
    setHeightShowInput(true);

    // Skip animation if height is already set
    if (profileData.height) {
      setHeightDisplayedText(heightFullText);
      setHeightShowCursor(false);
      return;
    }

    if (heightDisplayedText.length === 0) {
      setTimeout(() => {
        setHeightDisplayedText(heightFullText[0]);
        setHeightShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, heightFullText, profileData.height]);

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

    // Mostrar input inmediatamente
    setBirthdateShowInput(true);

    // Skip animation if birthdate is already set
    if (profileData.birthDate) {
      setBirthdateDisplayedText(birthdateFullText);
      setBirthdateShowCursor(false);
      return;
    }

    if (birthdateDisplayedText.length === 0) {
      setTimeout(() => {
        setBirthdateDisplayedText(birthdateFullText[0]);
        setBirthdateShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, birthdateFullText, profileData.birthDate]);

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

    // Skip animation if sex is already set
    if (profileData.sex) {
      setSexDisplayedText(sexFullText);
      setSexShowCursor(false);
      setSexShowOptions(true);
      return;
    }

    if (sexDisplayedText.length === 0) {
      setTimeout(() => {
        setSexDisplayedText(sexFullText[0]);
        setSexShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, sexFullText, profileData.sex]);

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

    // Skip animation if activity level is already set
    if (profileData.activityLevel) {
      setActivityDisplayedText(activityFullText);
      setActivityShowCursor(false);
      setActivityShowOptions(true);
      return;
    }

    if (activityDisplayedText.length === 0) {
      setTimeout(() => {
        setActivityDisplayedText(activityFullText[0]);
        setActivityShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, activityFullText, profileData.activityLevel]);

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

  // Typewriter effect for gustos step
  useEffect(() => {
    if (!isOpen || currentStep !== 'gustos') {
      setGustosDisplayedText('');
      setGustosShowCursor(false);
      setGustosShowOptions(false);
      setCurrentImageIndex(0); // Reset image index when leaving step
      return;
    }

    // Reset image index when entering gustos step
    setCurrentImageIndex(0);

    // Skip animation if gustos are already set
    if (profileData.gustos && profileData.gustos.length > 0) {
      setGustosDisplayedText(gustosFullText);
      setGustosShowCursor(false);
      setGustosShowOptions(true);
      return;
    }

    if (gustosDisplayedText.length === 0) {
      setTimeout(() => {
        setGustosDisplayedText(gustosFullText[0]);
        setGustosShowCursor(true);
      }, 300);
    }
  }, [isOpen, currentStep, gustosFullText, profileData.gustos]);

  useEffect(() => {
    if (!isOpen || currentStep !== 'gustos') return;
    if (gustosDisplayedText.length > 0 && gustosDisplayedText.length < gustosFullText.length) {
      const timeout = setTimeout(() => {
        setGustosDisplayedText(gustosFullText.slice(0, gustosDisplayedText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else if (gustosDisplayedText.length === gustosFullText.length && gustosShowCursor) {
      setTimeout(() => {
        setGustosShowCursor(false);
        setGustosShowOptions(true);
      }, 200);
    }
  }, [gustosDisplayedText, gustosFullText, gustosShowCursor, isOpen, currentStep]);

  // Loading progress effect
  useEffect(() => {
    if (!isOpen || currentStep !== 'loading') {
      setLoadingProgress(0);
      return;
    }

    // Animate progress from 0 to 100 over 3 seconds
    const duration = 3000;
    const steps = 60;
    const increment = 100 / steps;
    const intervalTime = duration / steps;

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        setLoadingProgress(100);
        clearInterval(interval);
        // Calculate recommended macros
        const recommended = calculateRecommendedMacros();
        setRecommendedMacros(recommended);
        setProfileData(prev => ({
          ...prev,
          calories: recommended.calories,
          carbs: recommended.carbs,
          protein: recommended.protein,
          fat: recommended.fat
        }));
        // Move to macros step after a brief delay
        setTimeout(() => {
          setCurrentStep('macros');
        }, 500);
      } else {
        setLoadingProgress(currentProgress);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isOpen, currentStep]);

  // Avatar icon animation - alternate between initials and camera icon every 3 seconds
  useEffect(() => {
    if (!isOpen) {
      setShowAvatarIcon(false);
      return;
    }

    const interval = setInterval(() => {
      setShowAvatarIcon(prev => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen]);

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

  // Focus input when it appears - SIMPLIFICADO
  useEffect(() => {
    if (!isOpen || !showInput) return;

    // Delay mínimo para asegurar que el DOM esté renderizado
    const timer = setTimeout(() => {
      if (currentStep === 'name' && nameInputRef.current) {
        nameInputRef.current.focus();
      } else if (currentStep === 'weight' && weightKgInputRef.current) {
        weightKgInputRef.current.focus();
      } else if (currentStep === 'height' && heightInputRef.current) {
        heightInputRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
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
      case 'gustos':
        return isEditing?.gustos ? 'Actualizar gustos' : 'Añadir gustos';
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
      case 'loading':
        return '';
      case 'macros':
        return 'Ajustar Macronutrientes';
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
      case 'gustos':
        return true; // Siempre puede continuar, la selección es opcional
      case 'goal':
        return profileData.goal !== '';
      case 'weight':
        // Require at least kg field to be filled
        return weightKg && parseInt(weightKg) > 0;
      case 'height':
        return profileData.height && parseFloat(profileData.height) > 0;
      case 'birthdate':
        // Require all three fields to be filled and valid
        // Accept 1 or 2 digits for day and month
        if (!birthdateDay || !birthdateMonth || birthdateYear.length !== 4) {
          return false;
        }
        
        const day = parseInt(birthdateDay);
        const month = parseInt(birthdateMonth);
        const year = parseInt(birthdateYear);
        const today = new Date();
        
        // Validate ranges (minimum year is 1915)
        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1915 || year > today.getFullYear()) {
          return false;
        }
        
        // Check if date is not in the future
        const selectedDate = new Date(year, month - 1, day);
        return selectedDate <= today;
      case 'sex':
        return profileData.sex !== '';
      case 'activityLevel':
        return profileData.activityLevel !== '';
      case 'macros':
        return profileData.carbs + profileData.protein + profileData.fat === 100;
      default:
        return false;
    }
  };
  const handleContinue = async () => {
    console.log('=== HandleContinue Debug ===');
    console.log('Current step:', currentStep);
    console.log('Has editingProfile.id:', !!editingProfile?.id);
    
    // Mark gustos as submitted when advancing from gustos step
    if (currentStep === 'gustos') {
      setGustosSubmitted(true);
    }
    
    // CRITICAL: When creating a NEW profile and on activityLevel step, go to loading
    if (currentStep === 'activityLevel' && !editingProfile?.id && !createdProfileId) {
      console.log('Activity level complete for NEW profile - going to loading!');
      setCurrentStep('loading');
      return;
    }
    
    const isProfileComplete = getCompletionPercentage() === 100;
    console.log('Is profile complete:', isProfileComplete);
    console.log('Profile data:', profileData);
    
    // Determine which profile ID to use (editing existing or newly created)
    const profileId = editingProfile?.id || createdProfileId;
    
    // AUTO-SAVE: Save current step data to database before continuing
    if (profileId && canContinue()) {
      const stepDataToSave: any = {};
      
      // Map current step data to database fields
      switch (currentStep) {
        case 'name':
          stepDataToSave.name = profileData.name;
          if (editingProfile) editingProfile.name = profileData.name;
          break;
        case 'diet':
          stepDataToSave.diet = profileData.diet;
          if (editingProfile) editingProfile.diet = profileData.diet;
          break;
        case 'allergies':
          stepDataToSave.allergies = profileData.allergies;
          if (editingProfile) editingProfile.allergies = profileData.allergies;
          break;
        case 'gustos':
          stepDataToSave.gustos = profileData.gustos;
          if (editingProfile) editingProfile.gustos = profileData.gustos;
          break;
        case 'goal':
          stepDataToSave.health_goal = profileData.goal;
          if (editingProfile) {
            editingProfile.goal = profileData.goal;
            editingProfile.healthGoal = profileData.goal;
          }
          break;
        case 'weight':
          stepDataToSave.weight = profileData.weight && profileData.weightUnit 
            ? `${profileData.weight} ${profileData.weightUnit}` 
            : undefined;
          if (editingProfile) editingProfile.weight = stepDataToSave.weight;
          break;
        case 'height':
          stepDataToSave.height = profileData.height && profileData.heightUnit 
            ? `${profileData.height} ${profileData.heightUnit}` 
            : undefined;
          if (editingProfile) editingProfile.height = stepDataToSave.height;
          break;
        case 'birthdate':
          stepDataToSave.birth_date = profileData.birthDate;
          if (editingProfile) editingProfile.birthDate = profileData.birthDate;
          break;
        case 'sex':
          stepDataToSave.sex = profileData.sex;
          if (editingProfile) editingProfile.sex = profileData.sex;
          break;
        case 'activityLevel':
          stepDataToSave.activity_level = profileData.activityLevel;
          if (editingProfile) editingProfile.activityLevel = profileData.activityLevel;
          break;
      }
      
      // Save to database if there's data to save
      if (Object.keys(stepDataToSave).length > 0) {
        console.log('=== AUTO-SAVING step data to ID:', profileId, '===', stepDataToSave);
        await updateProfile(profileId, stepDataToSave);
        window.dispatchEvent(new CustomEvent('meal-profile-updated'));
      }
    }
    
    // If editing from overview and profile is complete, return to overview
    if (returnToOverview && isProfileComplete) {
      setCurrentStep('overview');
      setReturnToOverview(false);
      return;
    }

    // If profile is NOT complete, find first incomplete step from the beginning
    if (!isProfileComplete) {
      console.log('Profile not complete, checking steps...');
      const steps: Step[] = ['name', 'diet', 'allergies', 'gustos', 'goal', 'weight', 'height', 'birthdate', 'sex', 'activityLevel'];
      
      // Check if current step can continue (is valid)
      if (!canContinue()) {
        console.log('Cannot continue from current step');
        return;
      }
      
      // Find first incomplete step from the beginning
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        // Check if this step is complete
        const isStepComplete = (() => {
          switch (step) {
            case 'name':
              return profileData.name.trim().length > 0 && profileData.name !== getDefaultName();
            case 'diet':
              return profileData.diet !== '';
            case 'allergies':
              return editingProfile?.allergies !== undefined || profileData.allergies.length > 0;
            case 'gustos':
              return editingProfile?.gustos !== undefined || profileData.gustos.length > 0;
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
        })();
        
        console.log(`Step ${step} complete:`, isStepComplete);
        
        if (!isStepComplete) {
          console.log('Going to incomplete step:', step);
          setCurrentStep(step);
          setReturnToOverview(false);
          return;
        }
      }
      
      // All steps complete, go to loading
      console.log('All steps complete! Going to loading screen');
      setCurrentStep('loading');
      setReturnToOverview(false);
      return;
    }

    // If profile is complete, return to overview
    if (isProfileComplete) {
      setCurrentStep('overview');
      setReturnToOverview(false);
      return;
    }

    // Fallback: normal flow progression
    const steps: Step[] = ['name', 'diet', 'allergies', 'gustos', 'goal', 'weight', 'height', 'birthdate', 'sex', 'activityLevel', 'loading', 'macros'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentStep === 'activityLevel') {
      // Solo ir a loading y macros cuando se está CREANDO un perfil nuevo
      if (!editingProfile?.id) {
        setCurrentStep('loading');
        return;
      } else {
        // Si está editando, volver al overview
        setCurrentStep('overview');
        return;
      }
    }
    
    if (currentIndex < steps.length - 1 && currentStep !== 'loading') {
      setCurrentStep(steps[currentIndex + 1]);
      setReturnToOverview(false);
    } else {
      onSave(profileData);
    }
  };
  const handleBack = () => {
    // Prevent going back if current step is incomplete
    if (currentStep !== 'overview' && currentStep !== 'loading' && currentStep !== 'macros' && !canContinue()) {
      // toast({
      //   title: 'Campo requerido',
      //   description: 'Por favor completa este campo antes de continuar',
      //   variant: 'destructive',
      // });
      return;
    }
    
    if (currentStep === 'overview') {
      return;
    }
    
    if (returnToOverview) {
      setCurrentStep('overview');
      setReturnToOverview(false);
      return;
    }

    const steps: Step[] = ['name', 'diet', 'allergies', 'gustos', 'goal', 'weight', 'height', 'birthdate', 'sex', 'activityLevel'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };
  const getCompletionPercentage = () => {
    // If we're on activityLevel and it's filled, OR on loading/macros, show 100%
    if (currentStep === 'activityLevel' && profileData.activityLevel !== '') {
      return 100;
    }
    
    if (currentStep === 'macros' || currentStep === 'loading') {
      return 100;
    }
    
    // 10 steps total, each worth 10%
    const steps: Step[] = ['name', 'diet', 'allergies', 'gustos', 'goal', 'weight', 'height', 'birthdate', 'sex', 'activityLevel'];
    const completedSteps = steps.filter(step => {
      switch (step) {
        case 'name':
          return profileData.name.trim().length > 0 && profileData.name !== getDefaultName();
        case 'diet':
          return profileData.diet !== '';
        case 'allergies':
          return editingProfile?.allergies !== undefined || profileData.allergies.length > 0;
        case 'gustos':
          // Only count as complete when user has submitted (moved to next screen)
          return gustosSubmitted;
        case 'goal':
          return profileData.goal !== '';
        case 'weight':
          return weightKg && parseInt(weightKg) > 0;
        case 'height':
          return profileData.height && parseFloat(profileData.height) > 0;
        case 'birthdate':
          return birthdateDay && birthdateMonth && birthdateYear;
        case 'sex':
          return profileData.sex !== '';
        case 'activityLevel':
          return profileData.activityLevel !== '';
        default:
          return false;
      }
    }).length;
    // Each step is worth 10%
    return completedSteps * 10;
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
  const getProfileColor = () => {
    // Use saved color from editingProfile if available
    if (editingProfile?.profileColor) {
      return editingProfile.profileColor;
    }
    // Otherwise assign based on index
    const colors = ['#A4243B', '#BD632F', '#273E47', '#6E9075', '#EB6534', '#6494AA', '#90A959', '#64B6AC', '#6E8898', '#26A96C'];
    return colors[profileIndex % colors.length];
  };

  const handleQuickEdit = (step: Step) => {
    setCurrentStep(step);
    // Only set returnToOverview if profile is complete
    const isProfileComplete = getCompletionPercentage() === 100;
    setReturnToOverview(isProfileComplete);
  };

  const hasRequiredDataForMacros = profileData.weight && profileData.height && profileData.birthDate && profileData.sex && profileData.activityLevel && profileData.goal;
  const hasMacrosCalculated = profileData.calories && profileData.carbs && profileData.protein && profileData.fat;
  
  const menuItems = [
    { step: 'name' as Step, label: 'Nombre', value: profileData.name },
    { step: 'diet' as Step, label: 'Preferencia alimentaria', value: profileData.diet },
    { step: 'allergies' as Step, label: 'Alergias e intolerancias', value: profileData.allergies.length > 0 ? `${profileData.allergies.length}` : '' },
    { step: 'gustos' as Step, label: 'Gustos', value: profileData.gustos.length > 0 ? `${profileData.gustos.length}` : '' },
    { step: 'goal' as Step, label: 'Objetivo', value: profileData.goal },
    { step: 'weight' as Step, label: 'Peso', value: weightKg ? `${weightKg}${weightGrams ? `,${weightGrams}` : ''} ${profileData.weightUnit}` : '' },
    { step: 'height' as Step, label: 'Altura', value: profileData.height ? `${profileData.height} ${profileData.heightUnit}` : '' },
    { step: 'birthdate' as Step, label: 'Fecha de nacimiento', value: profileData.birthDate },
    { step: 'sex' as Step, label: 'Sexo', value: profileData.sex },
    { step: 'activityLevel' as Step, label: 'Nivel de actividad', value: profileData.activityLevel },
    ...(hasRequiredDataForMacros ? [{ step: 'macros' as Step, label: 'Macros y calorías', value: hasMacrosCalculated ? 'Ver plan' : '' }] : []),
  ];
  
  if (!isOpen) {
    return null;
  }
  
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
            className="flex items-center gap-3 flex-1 rounded-lg p-1 -m-1"
          >
            <div className="relative flex-shrink-0 w-16 h-16">
              {true && (
                <svg className="absolute inset-0 w-16 h-16" style={{
                  transform: 'rotate(-90deg)'
                }}>
                  <circle cx="32" cy="32" r="30" stroke="#E5E5E5" strokeWidth="3" fill="none" />
                  <circle cx="32" cy="32" r="30" stroke="#10B981" strokeWidth="3" fill="none" strokeDasharray={`${2 * Math.PI * 30}`} strokeDashoffset={`${2 * Math.PI * 30 * (1 - getCompletionPercentage() / 100)}`} strokeLinecap="round" className="transition-all duration-300" />
                </svg>
              )}
              <div 
                className="absolute inset-[5px] rounded-full flex items-center justify-center text-lg font-medium overflow-hidden cursor-pointer" 
                style={{
                  backgroundColor: getProfileColor(),
                  color: '#FFFFFF'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // En móvil, abrir directamente el selector de archivos
                  if (window.innerWidth < 768 || 'ontouchstart' in window) {
                    setUseCamera(false);
                    fileInputRef.current?.click();
                  } else {
                    setShowAvatarOptions(true);
                  }
                }}
              >
                {editingProfile?.avatarUrl ? (
                  <img src={editingProfile.avatarUrl} alt={profileData.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div 
                      className={cn(
                        "absolute inset-0 flex items-center justify-center transition-all duration-500 text-lg font-medium",
                        showAvatarIcon ? "translate-x-[-100%] opacity-0" : "translate-x-0 opacity-100"
                      )}
                      style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                    >
                      {getInitials(profileData.name)}
                    </div>
                    <div 
                      className={cn(
                        "absolute inset-0 flex items-center justify-center transition-all duration-500",
                        showAvatarIcon ? "translate-x-0 opacity-100" : "translate-x-[100%] opacity-0"
                      )}
                    >
                      <Camera className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-left flex-1">
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">
                  {profileData.name || getDefaultName()}
                </p>
                {currentStep !== 'overview' && (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              {getCompletionPercentage() <= 100 && (
                <p className="text-xs text-muted-foreground">
                  {getCompletionPercentage()}% completado
                </p>
              )}
            </div>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => {
              // Si editamos perfil existente, simplemente cerrar
              if (editingProfile?.id) {
                onClose();
              } else {
                // Si es perfil nuevo, mostrar diálogo de confirmación
                setShowCancelDialog(true);
              }
            }} className="w-8 h-8 rounded-full flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="flex-1 overflow-y-auto p-4" style={{
        paddingBottom: (currentStep === 'name' || currentStep === 'diet' || currentStep === 'allergies' || currentStep === 'goal' || currentStep === 'weight' || currentStep === 'height' || currentStep === 'birthdate' || currentStep === 'sex' || currentStep === 'activityLevel') ? '120px' : (currentStep === 'macros' ? '150px' : '16px')
      }}>
          <div className="space-y-4">
            
            {/* Overview menu */}
            {currentStep === 'overview' && (
              <div className="relative">
                {menuItems.map((item, index) => (
                  <div key={item.step}>
                    <button
                      onClick={() => handleQuickEdit(item.step)}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                      <span className="text-base text-muted-foreground flex-shrink-0">{item.label}</span>
                      <span className="text-base text-right ml-4">
                        {item.value || 'Añadir'}
                      </span>
                    </button>
                    {index < menuItems.length - 1 && <Separator />}
                  </div>
                ))}
                
                {/* Delete profile button */}
                {onDelete && (
                  <>
                    <Separator className="my-6" />
                    <button
                      type="button"
                      onClick={() => {
                        if (onDelete) {
                          onDelete();
                          onClose();
                        }
                      }}
                      className="w-full text-center py-3 text-sm font-medium text-destructive"
                    >
                      Eliminar perfil
                    </button>
                  </>
                )}
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

                {/* Input field - siempre visible desde el inicio */}
                <div className="mb-6">
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
              }} autoFocus />
                  </div>
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
                            className="flex items-center justify-between py-3 px-4 cursor-pointer"
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

            {currentStep === 'gustos' && <div className="space-y-6">
                {/* Bot message with typewriter */}
                <div className="mb-6">
                  <div className="flex justify-start">
                    <div className="max-w-xs">
                      <p className="text-base leading-relaxed text-left text-[#1C1C1C]">
                        {gustosDisplayedText}
                        {gustosShowCursor && <span className="animate-pulse">|</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gustos - Swipeable image view */}
                {gustosShowOptions && (() => {
                  const foodTypes = [
                    { id: 'desayunos', label: 'Desayunos', image: '/food-types/desayunos.jpg' },
                    { id: 'arroces', label: 'Arroces', image: '/food-types/arroces.jpg' },
                    { id: 'pasta', label: 'Pasta', image: '/food-types/pasta.jpg' },
                    { id: 'ensaladas', label: 'Ensaladas', image: '/food-types/ensaladas.jpg' },
                  ];
                  
                  const currentFood = foodTypes[currentImageIndex];
                  
                  const handleLikeDislike = (liked: boolean) => {
                    // Trigger swipe animation
                    setSwipeDirection(liked ? 'right' : 'left');
                    
                    // Wait for animation to complete, then update state
                    setTimeout(() => {
                      // Si le gusta, añadirlo a gustos
                      if (liked && !profileData.gustos.includes(currentFood.id)) {
                        setProfileData({
                          ...profileData,
                          gustos: [...profileData.gustos, currentFood.id],
                        });
                      }
                      
                      // Reset swipe direction
                      setSwipeDirection(null);
                      
                      // Avanzar a la siguiente imagen
                      if (currentImageIndex < foodTypes.length - 1) {
                        setCurrentImageIndex(currentImageIndex + 1);
                      } else {
                        // Última imagen - avanzar al siguiente paso automáticamente
                        setTimeout(() => {
                          handleContinue();
                        }, 100);
                      }
                    }, 300);
                  };

                  return (
                    <div className="flex flex-col items-center gap-6 pb-2">
                      {/* Imagen grande - container permite overflow para ver el swipe completo */}
                      <div className="w-full max-w-md aspect-square rounded-2xl relative">
                        <img 
                          key={currentImageIndex}
                          src={currentFood.image} 
                          alt={currentFood.label}
                          className={`absolute inset-0 w-full h-full object-cover rounded-2xl transition-all duration-300 ${
                            swipeDirection === 'right' 
                              ? 'translate-x-[120%] rotate-[25deg] opacity-0' 
                              : swipeDirection === 'left' 
                              ? '-translate-x-[120%] -rotate-[25deg] opacity-0' 
                              : 'translate-x-0 rotate-0 opacity-100 scale-100'
                          }`}
                        />
                      </div>
                      
                      {/* Botones de me gusta / no me gusta */}
                      <div className="flex items-center justify-center gap-8 w-full px-8">
                        {/* No me gusta - izquierda */}
                        <button
                          type="button"
                          onClick={() => handleLikeDislike(false)}
                          className="flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-gray-300 transition-all"
                        >
                          <X className="w-8 h-8 text-red-500" strokeWidth={2.5} />
                        </button>
                        
                        {/* Me gusta - derecha */}
                        <button
                          type="button"
                          onClick={() => handleLikeDislike(true)}
                          className="flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-gray-300 transition-all"
                        >
                          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })()}
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

                {/* Weight input - siempre visible desde el inicio */}
                <div className="flex gap-3 justify-start items-center w-full">
                    <Input 
                      ref={weightKgInputRef} 
                      type="tel" 
                      inputMode="numeric" 
                      pattern="[0-9]*" 
                      value={weightKg}
                      autoFocus
                       onChange={e => {
                        const numValue = e.target.value.replace(/\D/g, '').slice(0, 3);
                        
                        // Don't allow just "0"
                        if (numValue === '0') return;
                        
                        setWeightKg(numValue);
                        
                        // Update main profile data
                        const grams = weightGrams || '0';
                        const totalWeight = `${numValue}.${grams.padStart(3, '0')}`;
                        setProfileData({
                          ...profileData,
                          weight: totalWeight
                        });
                        
                        // Auto-advance logic:
                        // If starts with 1: need 3 digits to advance
                        // If starts with 2-9: 2 digits to advance
                        const numInt = parseInt(numValue);
                        const firstDigit = numValue[0];
                        if (firstDigit === '1' && numValue.length === 3) {
                          weightGramsInputRef.current?.focus();
                        } else if (firstDigit !== '1' && numValue.length === 2 && numInt >= 10) {
                          weightGramsInputRef.current?.focus();
                        }
                      }} 
                      placeholder={profileData.weightUnit === 'kg' ? 'kg' : 'lbs'} 
                      className="flex-1 text-center text-lg border-0 focus:border focus-visible:ring-0 focus-visible:ring-offset-0" 
                      style={{
                        backgroundColor: '#F4F4F4',
                        borderColor: 'transparent'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#020817';
                        e.target.style.borderWidth = '1px';
                      }}
                       onBlur={e => {
                        e.target.style.borderColor = 'transparent';
                      }}
                    />
                    <span className="text-muted-foreground text-lg">,</span>
                    <Input 
                      ref={weightGramsInputRef} 
                      type="tel" 
                      inputMode="numeric" 
                      pattern="[0-9]*" 
                      value={weightGrams} 
                      onChange={e => {
                        const numValue = e.target.value.replace(/\D/g, '').slice(0, 3);
                        
                        setWeightGrams(numValue);
                        
                        // Update main profile data
                        const kg = weightKg || '0';
                        const totalWeight = `${kg}.${numValue.padStart(3, '0')}`;
                        setProfileData({
                          ...profileData,
                          weight: totalWeight
                        });
                      }} 
                      placeholder={profileData.weightUnit === 'kg' ? 'g' : 'oz'} 
                      className="flex-1 text-center text-lg border-0 focus:border focus-visible:ring-0 focus-visible:ring-offset-0" 
                      style={{
                        backgroundColor: '#F4F4F4',
                        borderColor: 'transparent'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#020817';
                        e.target.style.borderWidth = '1px';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'transparent';
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
                      className="px-3 py-1 text-base font-medium text-primary rounded-md"
                    >
                    </button>
                  </div>
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

                {/* Height input - siempre visible desde el inicio */}
                <div className="relative">
                    <Input 
                      ref={heightInputRef} 
                      type="tel" 
                      inputMode="numeric" 
                      pattern="[0-9]*" 
                      value={profileData.height} 
                      onChange={e => setProfileData({
                        ...profileData,
                        height: e.target.value.replace(/\D/g, '')
                      })} 
                      placeholder="Escribe la altura" 
                      className="w-full pr-16 border-0 focus:border focus-visible:ring-0 focus-visible:ring-offset-0" 
                      style={{
                        backgroundColor: '#F4F4F4',
                        borderColor: 'transparent'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#020817';
                        e.target.style.borderWidth = '1px';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'transparent';
                      }}
                      autoFocus 
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm font-medium text-primary rounded-md"
                    >
                      {profileData.heightUnit}
                    </button>
                  </div>
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

                {/* Birthdate input - siempre visible desde el inicio */}
                <div className="flex gap-3 justify-start items-center w-full pr-2">
                    <Input
                      ref={dayInputRef}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={birthdateDay}
                      onChange={(e) => {
                        const numValue = e.target.value.replace(/\D/g, '').slice(0, 2);
                        
                        // Don't allow just "0"
                        if (numValue === '0') return;
                        
                        setBirthdateDay(numValue);
                        
                        // Update main profile data - save with padded zeros
                        const formattedDay = numValue.padStart(2, '0');
                        const formattedMonth = birthdateMonth.padStart(2, '0');
                        const newBirthDate = `${formattedDay}/${formattedMonth}/${birthdateYear}`;
                        setProfileData({
                          ...profileData,
                          birthDate: newBirthDate
                        });
                        
                        // Auto-advance logic:
                        // If single digit 4-9, it's complete (no day can be 40+)
                        // If two digits, it's complete
                        const numInt = parseInt(numValue);
                        if ((numValue.length === 1 && numInt >= 4 && numInt <= 9) || numValue.length === 2) {
                          if (numInt >= 1 && numInt <= 31) {
                            monthInputRef.current?.focus();
                          }
                        }
                      }}
                      placeholder="DD"
                      className="flex-1 text-center text-lg border-0 focus:border focus-visible:ring-0 focus-visible:ring-offset-0"
                      style={{
                        backgroundColor: '#F4F4F4',
                        borderColor: 'transparent'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#020817';
                        e.target.style.borderWidth = '1px';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'transparent';
                      }}
                      maxLength={2}
                      autoFocus
                      autoComplete="bday-day"
                      name="bday-day"
                    />
                    <Input
                      ref={monthInputRef}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={birthdateMonth}
                      onChange={(e) => {
                        const numValue = e.target.value.replace(/\D/g, '').slice(0, 2);
                        
                        // Don't allow just "0"
                        if (numValue === '0') return;
                        
                        setBirthdateMonth(numValue);
                        
                        // Update main profile data - save with padded zeros
                        const formattedDay = birthdateDay.padStart(2, '0');
                        const formattedMonth = numValue.padStart(2, '0');
                        const newBirthDate = `${formattedDay}/${formattedMonth}/${birthdateYear}`;
                        setProfileData({
                          ...profileData,
                          birthDate: newBirthDate
                        });
                        
                        // Auto-advance logic:
                        // If single digit 2-9, it's complete (no month can be 20+)
                        // If two digits, it's complete
                        const numInt = parseInt(numValue);
                        if ((numValue.length === 1 && numInt >= 2 && numInt <= 9) || numValue.length === 2) {
                          if (numInt >= 1 && numInt <= 12) {
                            yearInputRef.current?.focus();
                          }
                        }
                      }}
                      placeholder="MM"
                      className="flex-1 text-center text-lg border-0 focus:border focus-visible:ring-0 focus-visible:ring-offset-0"
                      style={{
                        backgroundColor: '#F4F4F4',
                        borderColor: 'transparent'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#020817';
                        e.target.style.borderWidth = '1px';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'transparent';
                      }}
                      maxLength={2}
                      autoComplete="bday-month"
                      name="bday-month"
                    />
                    <Input
                      ref={yearInputRef}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={birthdateYear}
                      onChange={(e) => {
                        const numValue = e.target.value.replace(/\D/g, '').slice(0, 4);
                        const yearNum = parseInt(numValue);
                        
                        // Only allow years between 1915 and current year
                        if (numValue.length === 4 && (yearNum < 1915 || yearNum > new Date().getFullYear())) {
                          return;
                        }
                        
                        setBirthdateYear(numValue);
                        
                        // Update main profile data (only if year has 4 digits, otherwise keep it incomplete)
                        const formattedDay = birthdateDay.padStart(2, '0');
                        const formattedMonth = birthdateMonth.padStart(2, '0');
                        const newBirthDate = `${formattedDay}/${formattedMonth}/${numValue}`;
                        setProfileData({
                          ...profileData,
                          birthDate: newBirthDate
                        });
                      }}
                      placeholder="AAAA"
                      className="flex-1 text-center text-lg border-0 focus:border focus-visible:ring-0 focus-visible:ring-offset-0"
                      style={{
                        backgroundColor: '#F4F4F4',
                        borderColor: 'transparent'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#020817';
                        e.target.style.borderWidth = '1px';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'transparent';
                      }}
                      maxLength={4}
                      autoComplete="bday-year"
                      name="bday-year"
                    />
                  </div>
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

            {currentStep === 'loading' && <div className="flex flex-col items-center justify-center space-y-8 py-12">
                {/* Circular progress */}
                <div className="relative w-48 h-48">
                  <svg className="absolute inset-0 w-48 h-48 -rotate-90">
                    <circle 
                      cx="96" 
                      cy="96" 
                      r="88" 
                      stroke="#E5E5E5" 
                      strokeWidth="8" 
                      fill="none" 
                    />
                    <circle 
                      cx="96" 
                      cy="96" 
                      r="88" 
                      stroke="url(#gradient)" 
                      strokeWidth="8" 
                      fill="none" 
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${2 * Math.PI * 88 * (1 - loadingProgress / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-100"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#EC4899" />
                        <stop offset="33%" stopColor="#F97316" />
                        <stop offset="66%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold">
                      {Math.round(loadingProgress)}%
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground text-center px-8">
                  Calculando recomendaciones personalizadas...
                </p>
              </div>}

            {currentStep === 'macros' && <div className="space-y-6">
                {/* Introduction text - animated */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 animate-in fade-in-up duration-500">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                      style={{
                        backgroundColor: '#020817',
                        color: '#ffffff'
                      }}
                    >
                      C
                    </div>
                    <div className="flex-1 bg-muted rounded-2xl rounded-tl-none p-4 text-sm leading-relaxed">
                      <p className="mb-3">
                        Hemos preparado este plan para <span className="font-medium">{profileData.name || 'ti'}</span>, según el objetivo que elegiste{profileData.goal ? `: ${profileData.goal.toLowerCase()}` : ''}.
                      </p>
                      <p className="mb-3">
                        Este plan nos ayudará a entender mejor tus necesidades nutricionales y ajustar tus recetas en función de lo que necesitas.
                      </p>
                      <p className="mb-3">
                        Lo utilizaremos como referencia tanto para tus comidas individuales como para las que compartas con otras personas, teniendo siempre en cuenta tu plan nutricional dentro de cada receta.
                      </p>
                      <p>
                        Si lo deseas, puedes editar tus calorías y tus macros en cualquier momento para afinar aún más tus recomendaciones.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Calories slider - at the top */}
                <div className="bg-background rounded-xl p-4 shadow-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Calorías</span>
                      <span className="font-medium">{profileData.calories} kcal</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileData({ ...profileData, calories: Math.max(1000, profileData.calories - 50) });
                        }}
                        className="text-xl text-muted-foreground hover:text-foreground"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min="1000"
                        max="5000"
                        step="50"
                        value={profileData.calories}
                        onChange={(e) => setProfileData({ ...profileData, calories: parseInt(e.target.value) })}
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #10B981 0%, #10B981 ${((profileData.calories - 1000) / 4000) * 100}%, #E5E5E5 ${((profileData.calories - 1000) / 4000) * 100}%, #E5E5E5 100%)`
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setProfileData({ ...profileData, calories: Math.min(5000, profileData.calories + 50) });
                        }}
                        className="text-xl text-muted-foreground hover:text-foreground"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Disclaimer - only shown when macros are modified */}
                {macrosModified && (
                  <div className="flex justify-between items-center text-sm px-4">
                    <p className="text-muted-foreground flex-1">
                      Ajusta los macronutrientes para que alcancen el 100%
                    </p>
                    <span className="font-medium text-foreground ml-2">
                      {profileData.carbs + profileData.protein + profileData.fat}%
                    </span>
                  </div>
                )}

                {/* Macros sliders */}
                <div className="space-y-6 bg-background rounded-xl p-4 shadow-sm">
                  {/* Carbs */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Hidratos</span>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">{Math.round(profileData.carbs * profileData.calories / 100 / 4)} g</span>
                        <span className="font-medium">{profileData.carbs} %</span>
                        <span className="text-muted-foreground">{Math.round(profileData.carbs * profileData.calories / 100)} kcal</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (profileData.carbs > 0) {
                            setProfileData({ ...profileData, carbs: Math.max(0, profileData.carbs - 1) });
                            setMacrosModified(true);
                          }
                        }}
                        className="text-xl text-muted-foreground"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={profileData.carbs}
                        onChange={(e) => {
                          setProfileData({ ...profileData, carbs: parseInt(e.target.value) });
                          setMacrosModified(true);
                        }}
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #F97316 0%, #F97316 ${profileData.carbs}%, #E5E5E5 ${profileData.carbs}%, #E5E5E5 100%)`
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (profileData.carbs < 100) {
                            setProfileData({ ...profileData, carbs: Math.min(100, profileData.carbs + 1) });
                            setMacrosModified(true);
                          }
                        }}
                        className="text-xl text-muted-foreground"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Protein */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Proteínas</span>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">{Math.round(profileData.protein * profileData.calories / 100 / 4)} g</span>
                        <span className="font-medium">{profileData.protein} %</span>
                        <span className="text-muted-foreground">{Math.round(profileData.protein * profileData.calories / 100)} kcal</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (profileData.protein > 0) {
                            setProfileData({ ...profileData, protein: Math.max(0, profileData.protein - 1) });
                            setMacrosModified(true);
                          }
                        }}
                        className="text-xl text-muted-foreground hover:text-foreground"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={profileData.protein}
                        onChange={(e) => {
                          setProfileData({ ...profileData, protein: parseInt(e.target.value) });
                          setMacrosModified(true);
                        }}
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #EC4899 0%, #EC4899 ${profileData.protein}%, #E5E5E5 ${profileData.protein}%, #E5E5E5 100%)`
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (profileData.protein < 100) {
                            setProfileData({ ...profileData, protein: Math.min(100, profileData.protein + 1) });
                            setMacrosModified(true);
                          }
                        }}
                        className="text-xl text-muted-foreground hover:text-foreground"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Fat */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Grasas</span>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">{Math.round(profileData.fat * profileData.calories / 100 / 9)} g</span>
                        <span className="font-medium">{profileData.fat} %</span>
                        <span className="text-muted-foreground">{Math.round(profileData.fat * profileData.calories / 100)} kcal</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (profileData.fat > 0) {
                            setProfileData({ ...profileData, fat: Math.max(0, profileData.fat - 1) });
                            setMacrosModified(true);
                          }
                        }}
                        className="text-xl text-muted-foreground hover:text-foreground"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={profileData.fat}
                        onChange={(e) => {
                          setProfileData({ ...profileData, fat: parseInt(e.target.value) });
                          setMacrosModified(true);
                        }}
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${profileData.fat}%, #E5E5E5 ${profileData.fat}%, #E5E5E5 100%)`
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (profileData.fat < 100) {
                            setProfileData({ ...profileData, fat: Math.min(100, profileData.fat + 1) });
                            setMacrosModified(true);
                          }
                        }}
                        className="text-xl text-muted-foreground hover:text-foreground"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Restablecer datos button - solo para perfiles nuevos */}
                  {!editingProfile?.id && (
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileData({
                            ...profileData,
                            carbs: recommendedMacros.carbs,
                            protein: recommendedMacros.protein,
                            fat: recommendedMacros.fat,
                            calories: recommendedMacros.calories
                          });
                          setMacrosModified(false);
                        }}
                        className="text-sm underline text-muted-foreground hover:text-foreground"
                      >
                        Restablecer datos
                      </button>
                    </div>
                  )}
                </div>
              </div>}
          </div>
        </CardContent>

        {/* Bottom area - chat send style for name, diet, allergies, goal, weight, height, birthdate, sex, activityLevel steps (NOT gustos) */}
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
                (currentStep === 'weight' && weightKg) ||
                (currentStep === 'height' && profileData.height) ||
                (currentStep === 'birthdate' && birthdateDay && birthdateMonth && birthdateYear) ||
                (currentStep === 'sex' && profileData.sex) ||
                (currentStep === 'activityLevel' && profileData.activityLevel)) &&
                <div className="flex-1 flex items-center gap-2 px-4 h-10 rounded-full overflow-x-auto scrollbar-hide" style={{
                  backgroundColor: '#F2F2F2',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}>
                  {currentStep === 'name' && (
                    <Badge variant="secondary" className="text-xs font-normal py-1 flex items-center gap-1 flex-shrink-0" style={{
                      backgroundColor: '#D9DADC',
                      color: '#020818',
                      borderRadius: '8px'
                    }}>
                      {profileData.name}
                    </Badge>
                  )}
                  {currentStep === 'diet' && (
                    <Badge variant="secondary" className="text-xs font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" style={{
                      backgroundColor: '#D9DADC',
                      color: '#020818',
                      borderRadius: '8px'
                    }}>
                      {profileData.diet}
                    </Badge>
                  )}
                  {currentStep === 'allergies' && Array.isArray(profileData.allergies) && profileData.allergies.map((allergy: string) => (
                    <Badge key={allergy} variant="secondary" className="text-xs font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" style={{
                      backgroundColor: '#D9DADC',
                      color: '#020818',
                      borderRadius: '8px'
                    }}>
                      {allergy}
                    </Badge>
                  ))}
                  {currentStep === 'goal' && (
                    <Badge variant="secondary" className="text-xs font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" style={{
                      backgroundColor: '#D9DADC',
                      color: '#020818',
                      borderRadius: '8px'
                    }}>
                      {profileData.goal}
                    </Badge>
                  )}
                  {currentStep === 'weight' && weightKg && (
                    <Badge variant="secondary" className="text-xs font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" style={{
                      backgroundColor: '#D9DADC',
                      color: '#020818',
                      borderRadius: '8px'
                    }}>
                      {weightKg}{weightGrams ? `,${weightGrams}` : ''} {profileData.weightUnit}
                    </Badge>
                  )}
                  {currentStep === 'height' && (
                    <Badge variant="secondary" className="text-xs font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" style={{
                      backgroundColor: '#D9DADC',
                      color: '#020818',
                      borderRadius: '8px'
                    }}>
                      {profileData.height} {profileData.heightUnit}
                    </Badge>
                  )}
                  {currentStep === 'birthdate' && (
                    <Badge variant="secondary" className="text-xs font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" style={{
                      backgroundColor: '#D9DADC',
                      color: '#020818',
                      borderRadius: '8px'
                    }}>
                      {birthdateDay && birthdateMonth && birthdateYear && 
                        `${parseInt(birthdateDay)}/${parseInt(birthdateMonth)}/${birthdateYear}`}
                    </Badge>
                  )}
                  {currentStep === 'sex' && (
                    <Badge variant="secondary" className="text-xs font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" style={{
                      backgroundColor: '#D9DADC',
                      color: '#020818',
                      borderRadius: '8px'
                    }}>
                      {profileData.sex}
                    </Badge>
                  )}
                  {currentStep === 'activityLevel' && (
                    <Badge variant="secondary" className="text-xs font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" style={{
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

        {/* Buttons for macros step */}
        {currentStep === 'macros' && (
          <div className="p-4 border-t flex-shrink-0">
            {editingProfile?.id ? (
              <button
                type="button"
                onClick={() => {
                  setProfileData({
                    ...profileData,
                    carbs: recommendedMacros.carbs,
                    protein: recommendedMacros.protein,
                    fat: recommendedMacros.fat,
                    calories: recommendedMacros.calories
                  });
                  setMacrosModified(false);
                }}
                className="w-full text-center py-3 text-sm font-medium border rounded-lg"
              >
                Restablecer datos
              </button>
            ) : (
              <Button 
                onClick={async () => {
                  // Guardar macros finales
                  const profileId = editingProfile?.id || createdProfileId;
                  if (profileId) {
                    await updateProfile(profileId, {
                      calories: profileData.calories,
                      carbs: profileData.carbs,
                      protein: profileData.protein,
                      fat: profileData.fat
                    });
                  }
                  
                  // Limpiar el ID creado y cerrar
                  setCreatedProfileId(null);
                  onSave(profileData);
                  onClose();
                }}
                disabled={profileData.carbs + profileData.protein + profileData.fat !== 100}
                className="w-full"
                style={{
                  backgroundColor: '#020817',
                  color: '#ffffff'
                }}
              >
                Guardar perfil
              </Button>
            )}
          </div>
        )}

      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogDescription className="text-center text-base">
              ¿Quieres cancelar la creación de este perfil de comensal? Se perderá toda la información ingresada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 sm:justify-between">
            <AlertDialogAction
              className="flex-1 bg-destructive"
              onClick={async () => {
                // Eliminar el perfil creado de la base de datos
                if (createdProfileId) {
                  console.log('=== Eliminando perfil creado:', createdProfileId);
                  await deleteProfile(createdProfileId);
                  setCreatedProfileId(null);
                }
                
                // Reset all data
                setProfileData({
                  name: '',
                  diet: '',
                  allergies: [],
                  gustos: [],
                  goal: '',
                  weight: '',
                  weightUnit: 'kg',
                  height: '',
                  heightUnit: 'cm',
                  birthDate: '',
                  sex: '',
                  activityLevel: '',
                  calories: 2000,
                  carbs: 40,
                  protein: 30,
                  fat: 30,
                });
                setCurrentStep('name');
                setReturnToOverview(false);
                setShowCancelDialog(false);
                onClose();
              }}
            >
              Cancelar
            </AlertDialogAction>
            <AlertDialogCancel className="flex-1 m-0">Volver atrás</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Avatar Options Sheet */}
      <AvatarOptionsSheet
        isOpen={showAvatarOptions}
        onClose={() => setShowAvatarOptions(false)}
        onTakePhoto={() => {
          setShowAvatarOptions(false);
          setUseCamera(true);
          setTimeout(() => fileInputRef.current?.click(), 100);
        }}
        onChooseFromGallery={() => {
          setShowAvatarOptions(false);
          setUseCamera(false);
          setTimeout(() => fileInputRef.current?.click(), 100);
        }}
        onDelete={editingProfile?.avatarUrl ? async () => {
          if (!editingProfile?.id) return;
          
          try {
            const { error } = await supabase
              .from('meal_profiles')
              .update({ avatar_url: null })
              .eq('id', editingProfile.id);

            if (error) throw error;

            if (editingProfile) {
              editingProfile.avatarUrl = null;
            }
            
            window.dispatchEvent(new CustomEvent('meal-profile-updated'));
            // toast({
            //   title: "Foto eliminada",
            //   description: "La foto de perfil se ha eliminado correctamente"
            // });
          } catch (error) {
            console.error('Error deleting avatar:', error);
            // toast({
            //   title: "Error",
            //   description: "No se pudo eliminar la foto de perfil",
            //   variant: "destructive"
            // });
          }
        } : undefined}
        hasAvatar={!!editingProfile?.avatarUrl}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        {...(useCamera ? { capture: "environment" as const } : {})}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (event) => {
            setSelectedImage(event.target?.result as string);
            setShowCropDialog(true);
          };
          reader.readAsDataURL(file);
          e.target.value = '';
        }}
      />

      {/* Image Crop Dialog */}
      {selectedImage && (
        <ImageCropDialog
          imageSrc={selectedImage}
          isOpen={showCropDialog}
          onClose={() => {
            setShowCropDialog(false);
            setSelectedImage(null);
          }}
          onCropComplete={async (croppedBlob) => {
            console.log('=== onCropComplete called ===');
            console.log('editingProfile:', editingProfile);
            console.log('createdProfileId:', createdProfileId);
            console.log('croppedBlob:', croppedBlob);
            
            // Determinar qué ID usar
            const profileId = editingProfile?.id || createdProfileId;
            
            if (!profileId) {
              console.error('No profile ID available!');
              // toast({
              //   title: "Error",
              //   description: "No se pudo guardar la foto. Intenta de nuevo.",
              //   variant: "destructive"
              // });
              setShowCropDialog(false);
              setSelectedImage(null);
              return;
            }

            setUploadingAvatar(true);
            try {
              console.log('Uploading to Supabase with profile ID:', profileId);
              const fileName = `${profileId}-${Date.now()}.jpg`;
              const filePath = `${profileId}/${fileName}`;

              const { error: uploadError } = await supabase.storage
                .from('profile-avatars')
                .upload(filePath, croppedBlob, {
                  contentType: 'image/jpeg',
                  upsert: true
                });

              if (uploadError) {
                console.error('Upload error:', uploadError);
                throw uploadError;
              }

              const { data: { publicUrl } } = supabase.storage
                .from('profile-avatars')
                .getPublicUrl(filePath);

              console.log('Public URL:', publicUrl);

              const { error: updateError } = await supabase
                .from('meal_profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', profileId);

              if (updateError) {
                console.error('Update error:', updateError);
                throw updateError;
              }

              if (editingProfile) {
                editingProfile.avatarUrl = publicUrl;
              }

              window.dispatchEvent(new CustomEvent('meal-profile-updated'));
              // toast({
              //   title: "Foto actualizada",
              //   description: "La foto de perfil se ha actualizado correctamente"
              // });
            } catch (error) {
              console.error('Error uploading avatar:', error);
              // toast({
              //   title: "Error",
              //   description: "No se pudo actualizar la foto de perfil",
              //   variant: "destructive"
              // });
            } finally {
              setUploadingAvatar(false);
              setShowCropDialog(false);
              setSelectedImage(null);
            }
          }}
        />
      )}
    </div>
});

ProfileCreationDrawer.displayName = 'ProfileCreationDrawer';