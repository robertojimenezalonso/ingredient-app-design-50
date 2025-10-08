import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ArrowLeft, ArrowUp, Plus, MoreVertical, X, ChevronRight, User, Utensils, Flame, Apple, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ProfileCreationDrawer, ProfileCreationDrawerRef } from '@/components/ProfileCreationDrawer';
import { useMealProfiles } from '@/hooks/useMealProfiles';
import type { MealProfile } from '@/hooks/useMealProfiles';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/AuthModal';
import { useRecipeBank } from '@/hooks/useRecipeBank';

type MealSelection = {
  date: Date;
  mealType: string;
};

export const RecipePreferencesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Try to get data from localStorage first, then from location.state
  const getPersistedData = () => {
    const stored = localStorage.getItem('recipePreferencesData');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        confirmedDates: parsed.confirmedDates.map((d: string) => new Date(d)),
        selectedSupermarket: parsed.selectedSupermarket,
        mealSelections: parsed.mealSelections.map((m: any) => ({
          ...m,
          date: new Date(m.date)
        }))
      };
    }
    return null;
  };
  
  // Mock data for testing
  const getMockData = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    return {
      confirmedDates: [today, tomorrow, dayAfter],
      selectedSupermarket: 'mercadona',
      mealSelections: [
        { date: today, mealType: 'Desayuno' },
        { date: today, mealType: 'Comida' },
        { date: today, mealType: 'Cena' },
        { date: tomorrow, mealType: 'Comida' },
        { date: tomorrow, mealType: 'Cena' },
        { date: dayAfter, mealType: 'Desayuno' },
        { date: dayAfter, mealType: 'Comida' },
      ]
    };
  };
  
  const persistedData = getPersistedData();
  const mockData = getMockData();
  const confirmedDates = location.state?.confirmedDates || persistedData?.confirmedDates || mockData.confirmedDates;
  const selectedSupermarket = location.state?.selectedSupermarket || persistedData?.selectedSupermarket || mockData.selectedSupermarket;
  const mealSelections = location.state?.mealSelections || persistedData?.mealSelections || mockData.mealSelections;
  const shouldSkipAnimations = location.state?.shouldRestoreSelection || !!persistedData;
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (confirmedDates.length > 0 || mealSelections.length > 0) {
      localStorage.setItem('recipePreferencesData', JSON.stringify({
        confirmedDates,
        selectedSupermarket,
        mealSelections
      }));
    }
  }, [confirmedDates, selectedSupermarket, mealSelections]);
  
  const fullText = "";
  
  // Auth state
  const { user, loading: authLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Use Supabase hook for meal profiles
  const { profiles: supabaseProfiles, loading: profilesLoading, createProfile, updateProfile, deleteProfile } = useMealProfiles();
  
  // Use recipe bank for generating meal plan
  const { recipes, isLoading: recipesLoading } = useRecipeBank();
  
  // Recipe generation animation state - always start with animation unless explicitly told to restore
  const shouldShowAnimation = !location.state?.skipAnimation;
  const [isGenerating, setIsGenerating] = useState(shouldShowAnimation);
  const [generationStep, setGenerationStep] = useState<'searching' | 'building' | 'complete'>(shouldShowAnimation ? 'searching' : 'complete');
  const [showRecipes, setShowRecipes] = useState(!shouldShowAnimation);
  const [showLoadingDot, setShowLoadingDot] = useState(shouldShowAnimation);
  const [showSearchingText, setShowSearchingText] = useState(false);
  const [showBuildingText, setShowBuildingText] = useState(false);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [displayedFinalMessage, setDisplayedFinalMessage] = useState('');
  const [finalMessageCursor, setFinalMessageCursor] = useState(true);
  
  const finalMessageText = "Hemos creado 184 planes pensados para ti. Las recetas están optimizadas con los ingredientes de Mercadona, para que ahorres tiempo y dinero al planificar tus comidas. Además, podrás ver cuánto te costaría esa misma lista de la compra en otros supermercados.";
  
  // Show auth modal if not authenticated after loading
  useEffect(() => {
    if (!authLoading && !user) {
      setAuthModalOpen(true);
    }
  }, [authLoading, user]);
  
  // Transform Supabase profiles to local format
  const healthProfiles = supabaseProfiles.map(profile => ({
    id: profile.id,
    name: profile.name,
    diet: profile.diet,
    allergies: profile.allergies?.join(', '),
    gustos: profile.gustos?.join(', '),
    healthGoal: profile.health_goal,
    birthDate: profile.birth_date,
    weight: profile.weight,
    height: profile.height,
    sex: profile.sex,
    activityLevel: profile.activity_level,
    calories: profile.calories,
    carbs: profile.carbs,
    protein: profile.protein,
    fat: profile.fat,
    profileColor: profile.profile_color,
    avatarUrl: profile.avatar_url,
  }));

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [dietDrawerOpen, setDietDrawerOpen] = useState(false);
  const [allergiesDrawerOpen, setAllergiesDrawerOpen] = useState(false);
  const [goalDrawerOpen, setGoalDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<'main' | 'personal-data' | 'macros' | 'calories' | 'nutrition'>('main');
  const profileDrawerRef = useRef<ProfileCreationDrawerRef>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<{
    id?: string;
    name: string;
    diet?: string;
    allergies?: string;
    gustos?: string;
    healthGoal?: string;
    birthDate?: string;
    weight?: string;
    height?: string;
    sex?: string;
    activityLevel?: string;
    calories?: number;
    carbs?: number;
    protein?: number;
    fat?: number;
    profileColor?: string;
    avatarUrl?: string;
  } | null>(null);

  // Handle returning from edit pages
  useEffect(() => {
    if (location.state?.editedField && location.state?.editedValue) {
      const { editedField, editedValue, nextField } = location.state;
      
      setEditingProfile(prev => {
        if (!prev) return prev;
        const updated = { ...prev, [editedField]: editedValue };
        return updated;
      });
      
      // Navigate to next field if specified
      if (nextField) {
        setTimeout(() => {
          handleNavigateToEdit(nextField);
        }, 300);
      }
      
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleNavigateToEdit = (field: string) => {
    const routes: { [key: string]: string } = {
      name: '/edit-name',
      birthDate: '/edit-birth-date',
      weight: '/edit-weight',
      height: '/edit-height',
      sex: '/edit-sex',
      activityLevel: '/edit-activity-level'
    };
    
    const route = routes[field];
    if (route) {
      const state: any = {
        profileId: editingProfile?.id
      };
      
      // Add the current value for the specific field
      if (field === 'name') {
        state.name = editingProfile?.name || '';
      } else if (field === 'birthDate') {
        state.birthDate = editingProfile?.birthDate || '';
      } else if (field === 'weight') {
        // Parse weight and unit if exists
        const weightStr = editingProfile?.weight || '';
        const parts = weightStr.split(' ');
        state.weight = parts[0] || '';
        state.weightUnit = parts[1] || 'kg';
      } else if (field === 'height') {
        // Parse height and unit if exists
        const heightStr = editingProfile?.height || '';
        const parts = heightStr.split(' ');
        state.height = parts[0] || '';
        state.heightUnit = parts[1] || 'cm';
      } else if (field === 'sex') {
        state.sex = editingProfile?.sex || '';
      } else if (field === 'activityLevel') {
        state.activityLevel = editingProfile?.activityLevel || '';
      }
      
      navigate(route, { state });
    }
  };

  // Helper functions
  const getInitials = (name: string) => {
    if (!name || name === 'Comensal 1') return 'C1';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getProfileCompletion = (profile: typeof healthProfiles[0]) => {
    let completed = 0;
    const total = 10;
    
    if (profile.name) completed++;
    if (profile.diet) completed++;
    if (profile.allergies) completed++;
    if (profile.gustos) completed++;
    if (profile.healthGoal) completed++;
    if (profile.weight) completed++;
    if (profile.height) completed++;
    if (profile.birthDate) completed++;
    if (profile.sex) completed++;
    if (profile.activityLevel) completed++;
    
    return (completed / total) * 100;
  };

  const getProfileColor = (profile: typeof healthProfiles[0], index: number) => {
    // Use saved color if exists, otherwise assign one based on index
    if (profile.profileColor) {
      return profile.profileColor;
    }
    const colors = ['#A4243B', '#BD632F', '#273E47', '#6E9075', '#EB6534', '#6494AA', '#90A959', '#64B6AC', '#6E8898', '#26A96C'];
    return colors[index % colors.length];
  };
  
  const skipAnimations = shouldSkipAnimations || (persistedData !== null);
  const [showIcon, setShowIcon] = useState(true);
  const [displayedText, setDisplayedText] = useState(skipAnimations ? fullText : '');
  const [showCursor, setShowCursor] = useState(!skipAnimations);


  const handleAddProfile = () => {
    setEditingProfile({
      name: '',
      diet: undefined,
      allergies: undefined,
      healthGoal: undefined,
      birthDate: '',
      weight: '',
      height: '',
      sex: '',
      activityLevel: '',
      calories: undefined,
      carbs: undefined,
      protein: undefined,
      fat: undefined
    });
    setProfileDrawerOpen(true);
    
    // Hacer focus en el input inmediatamente aprovechando el clic del usuario
    profileDrawerRef.current?.focusNameInput();
  };

  const handleEditProfile = (profile: typeof healthProfiles[0]) => {
    setEditingProfile({
      id: profile.id,
      name: profile.name,
      diet: profile.diet,
      allergies: profile.allergies,
      gustos: profile.gustos,
      healthGoal: profile.healthGoal,
      birthDate: profile.birthDate,
      weight: profile.weight,
      height: profile.height,
      sex: profile.sex,
      activityLevel: profile.activityLevel,
      calories: profile.calories,
      carbs: profile.carbs,
      protein: profile.protein,
      fat: profile.fat,
      profileColor: profile.profileColor,
      avatarUrl: profile.avatarUrl
    });
    setCurrentSection('main');
    setProfileDrawerOpen(true);
  };

  const handleSaveProfile = async (profileData: any) => {
    // Convert allergies array to proper format
    const allergiesArray = Array.isArray(profileData.allergies) 
      ? profileData.allergies 
      : (profileData.allergies ? [profileData.allergies] : []);
    
    // Convert gustos array to proper format
    const gustosArray = Array.isArray(profileData.gustos) 
      ? profileData.gustos 
      : (profileData.gustos ? [profileData.gustos] : []);

    const profileToSave = {
      name: profileData.name,
      diet: profileData.diet || undefined,
      allergies: allergiesArray,
      gustos: gustosArray,
      health_goal: profileData.goal || undefined,
      birth_date: profileData.birthDate || undefined,
      weight: profileData.weight && profileData.weightUnit 
        ? `${profileData.weight} ${profileData.weightUnit}` 
        : undefined,
      height: profileData.height && profileData.heightUnit 
        ? `${profileData.height} ${profileData.heightUnit}` 
        : undefined,
      sex: profileData.sex || undefined,
      activity_level: profileData.activityLevel || undefined,
      calories: profileData.calories || undefined,
      carbs: profileData.carbs || undefined,
      protein: profileData.protein || undefined,
      fat: profileData.fat || undefined,
    };

    if (editingProfile?.id) {
      // Update existing profile
      await updateProfile(editingProfile.id, profileToSave);
    } else {
      // Create new profile
      await createProfile(profileToSave);
    }
    
    setProfileDrawerOpen(false);
    setEditingProfile(null);
  };

  const handleCancelProfile = () => {
    setProfileDrawerOpen(false);
    setCurrentSection('main');
    setEditingProfile(null);
  };

  const handleBackToMain = () => {
    setCurrentSection('main');
  };

  const handleDeleteProfile = async (profileId: string) => {
    await deleteProfile(profileId);
    setOpenMenuId(null);
  };

  const toggleMenu = (profileId: string) => {
    setOpenMenuId(openMenuId === profileId ? null : profileId);
  };

  const handleContinue = () => {
    // TODO: navigate to next page
  };

  const canContinue = healthProfiles.some(profile => profile.name.trim() !== '');

  const handleBack = () => {
    navigate('/meal-selection', { 
      state: { 
        confirmedDates,
        selectedSupermarket,
        mealSelections,
        shouldRestoreSelection: true,
        skipAnimation: true
      } 
    });
  };

  const mealTypeOrder = ['Desayuno', 'Comida', 'Cena', 'Postre', 'Snack'];
  const groupedSelections = mealSelections.reduce((acc: any, selection: MealSelection) => {
    const dateKey = selection.date.getTime();
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: selection.date,
        mealTypes: []
      };
    }
    acc[dateKey].mealTypes.push(selection.mealType);
    return acc;
  }, {});

  Object.values(groupedSelections).forEach((group: any) => {
    group.mealTypes.sort((a: string, b: string) => {
      return mealTypeOrder.indexOf(a) - mealTypeOrder.indexOf(b);
    });
  });

  const formatShortDate = (date: Date) => {
    const formatted = format(date, 'EEE d', { locale: es });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Generate meal plan preview with random recipes
  const categoryMap: { [key: string]: string } = {
    'Desayuno': 'desayuno',
    'Comida': 'comida',
    'Cena': 'cena',
    'Postre': 'comida',
    'Snack': 'snack'
  };

  const generateMealPlan = () => {
    return Object.values(groupedSelections).map((group: any) => {
      const meals = group.mealTypes.map((mealType: string) => {
        const category = categoryMap[mealType] || 'comida';
        const categoryRecipes = recipes.filter(r => r.category === category);
        const recipe = categoryRecipes[Math.floor(Math.random() * categoryRecipes.length)];
        return {
          mealType,
          recipe
        };
      });
      
      return {
        date: group.date,
        meals
      };
    });
  };

  // Recipe generation animation
  useEffect(() => {
    if (!shouldShowAnimation || !isGenerating) return;

    // Show dot first
    const dotTimer = setTimeout(() => {
      setShowLoadingDot(false);
      setShowSearchingText(true);
    }, 2000);

    const timer1 = setTimeout(() => {
      setShowSearchingText(false);
      setShowBuildingText(true);
      setGenerationStep('building');
    }, 6000);

    const timer2 = setTimeout(() => {
      setShowBuildingText(false);
      setGenerationStep('complete');
      setShowRecipes(true);
      setIsGenerating(false);
      setShowFinalMessage(true);
    }, 9000);

    const timer3 = setTimeout(() => {
      setFinalMessageCursor(false);
    }, 11000);

    return () => {
      clearTimeout(dotTimer);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [shouldShowAnimation, isGenerating]);
  
  // Typewriter effect for final message
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showFinalMessage && displayedFinalMessage.length < finalMessageText.length) {
      timeout = setTimeout(() => {
        setDisplayedFinalMessage(finalMessageText.slice(0, displayedFinalMessage.length + 1));
      }, 30); // 30ms per character for typewriter speed
    } else if (showFinalMessage && displayedFinalMessage.length === finalMessageText.length) {
      // Hide cursor after text is complete
      setTimeout(() => {
        setFinalMessageCursor(false);
      }, 500);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [showFinalMessage, displayedFinalMessage, finalMessageText]);

  const mealPlanPreview = generateMealPlan();
  const totalRecipesNeeded = mealSelections.length;
  const uniqueRecipes = new Set(mealPlanPreview.flatMap(day => day.meals.map(m => m.recipe?.id))).size;
  const totalPlans = Math.floor(recipes.length / totalRecipesNeeded) * 10;

  useEffect(() => {
    if (skipAnimations || fullText.length === 0) return;
    
    if (displayedText.length === 0) {
      setTimeout(() => {
        setDisplayedText(fullText[0] || '');
      }, 300);
    } else if (displayedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else if (displayedText.length === fullText.length && showCursor) {
      setTimeout(() => {
        setShowCursor(false);
      }, 200);
    }
  }, [displayedText, fullText, showCursor, skipAnimations]);

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: '#FCFBF8' }}>
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-20 h-16 flex items-center border-b" style={{
        backgroundColor: '#FFFFFF',
        borderBottomColor: '#E5E5E5'
      }}>
        <button 
          onClick={handleBack} 
          className="ml-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/80"
        >
          <ArrowLeft className="h-5 w-5 text-[#1C1C1C]" />
        </button>
      </div>

      {/* Chat area */}
      <div className="h-screen flex flex-col relative pt-16">
        <div className="flex-1 transition-all duration-500 ease-out overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-48">
            {/* User response */}
            <div className="px-4 pt-4 mb-6">
              <div className="flex justify-end">
                <div className="text-[#1C1C1C] rounded-lg px-3 py-2 text-sm max-w-xs" style={{ backgroundColor: '#F4F4F4' }}>
                  {Object.values(groupedSelections).map((group: any, index: number) => (
                    <span key={index}>
                      <span className="font-bold">{formatShortDate(group.date)}</span>
                      {' '}
                      {group.mealTypes.join(', ')}
                      {index < Object.values(groupedSelections).length - 1 && ' - '}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recipe Generation Progress */}
            {isGenerating && (
              <div className="px-4 mb-6">
                <div className="flex justify-start">
                  <div className="max-w-md">
                    {/* Loading dot */}
                    {showLoadingDot && !showSearchingText && !showBuildingText && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 bg-[#1C1C1C] rounded-full animate-pulse"></div>
                      </div>
                    )}

                    {/* Searching text */}
                    {showSearchingText && generationStep === 'searching' && (
                      <div className="flex items-start gap-2 mb-4">
                        <Search className="w-4 h-4 text-[#1C1C1C] animate-pulse flex-shrink-0 mt-[5px]" />
                        <span className="text-[#1C1C1C] text-base animate-pulse">
                          Creando recetas con los ingredientes de {selectedSupermarket === 'mercadona' ? 'Mercadona' : selectedSupermarket === 'carrefour' ? 'Carrefour' : selectedSupermarket === 'lidl' ? 'Lidl' : 'Alcampo'}
                        </span>
                      </div>
                    )}
                    
                    {/* Building text */}
                    {showBuildingText && generationStep === 'building' && (
                      <div className="flex items-start gap-2 mb-4">
                        <Calendar className="w-4 h-4 text-[#1C1C1C] animate-pulse flex-shrink-0 mt-[5px]" />
                        <span className="text-[#1C1C1C] text-base animate-pulse">
                          Adaptando las recetas creadas a los días que pediste
                        </span>
                      </div>
                    )}
                    
                  </div>
                </div>
              </div>
            )}

            {/* Final message after animation */}
            {showFinalMessage && (
              <div className="px-4 mb-6">
                <div className="flex justify-start">
                  <div className="max-w-md">
                    <p className="text-base text-[#1C1C1C]">
                      Hemos creado <span className="font-semibold">184 planes</span> pensados para ti.
                      <br /><br />
                      Las recetas están optimizadas con los ingredientes de <span className="font-semibold">Mercadona</span>, para que ahorres <span className="font-semibold">tiempo y dinero</span> al planificar tus comidas. Además, podrás ver <span className="font-semibold">cuánto te costaría esa misma lista de la compra en otros supermercados.</span>
                      {finalMessageCursor && <span className="animate-pulse">|</span>}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};
