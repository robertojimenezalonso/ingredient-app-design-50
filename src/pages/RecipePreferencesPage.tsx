import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CardContent } from '@/components/ui/card';
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
import { DayRecipeList } from '@/components/DayRecipeList';
import { RecipeGridCard } from '@/components/RecipeGridCard';
import { Card } from '@/components/ui/card';

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
  const [charIndex, setCharIndex] = useState(0);
  const [finalMessageCursor, setFinalMessageCursor] = useState(true);
  const [totalMealPlanPrice, setTotalMealPlanPrice] = useState(0);
  
  // Texto sin formato para la animación
  const plainText = "Hemos creado 184 planes pensados para ti.\n\nLas recetas están optimizadas con los ingredientes de Mercadona, para que ahorres tiempo y dinero al planificar tus comidas. Además, podrás ver cuánto te costaría esa misma lista de la compra en otros supermercados.";
  
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
    }, 10000);

    return () => {
      clearTimeout(dotTimer);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [shouldShowAnimation, isGenerating]);
  
  // Typewriter effect
  useEffect(() => {
    if (!showFinalMessage || charIndex >= plainText.length) {
      if (charIndex >= plainText.length && finalMessageCursor) {
        setTimeout(() => setFinalMessageCursor(false), 500);
      }
      return;
    }
    
    const timeout = setTimeout(() => {
      setCharIndex(charIndex + 1);
    }, 30);
    
    return () => clearTimeout(timeout);
  }, [showFinalMessage, charIndex, plainText.length, finalMessageCursor]);

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
                      {plainText.slice(0, charIndex).split('\n').map((line, i, arr) => {
                        if (i === 0) {
                          // Primera línea con negrita en "184 planes"
                          const text = line;
                          const match = text.match(/^(Hemos creado )(184 planes)( pensados para ti\.)$/);
                          if (match && charIndex >= match[1].length) {
                            return (
                              <span key={i}>
                                {match[1]}
                                {charIndex >= match[1].length + match[2].length ? (
                                  <span className="font-semibold">{match[2]}</span>
                                ) : (
                                  <span className="font-semibold">{match[2].slice(0, charIndex - match[1].length)}</span>
                                )}
                                {charIndex > match[1].length + match[2].length && match[3].slice(0, charIndex - match[1].length - match[2].length)}
                              </span>
                            );
                          }
                          return <span key={i}>{text}</span>;
                        } else if (line.includes('Mercadona') || line.includes('tiempo y dinero') || line.includes('cuánto te costaría')) {
                          // Líneas con múltiples negritas
                          let result = line;
                          const segments = [];
                          let lastIndex = 0;
                          
                          const boldWords = ['Mercadona', 'tiempo y dinero', 'cuánto te costaría esa misma lista de la compra en otros supermercados.'];
                          boldWords.forEach(word => {
                            const index = result.indexOf(word);
                            if (index !== -1) {
                              if (index > lastIndex) {
                                segments.push({ text: result.slice(lastIndex, index), bold: false });
                              }
                              segments.push({ text: word, bold: true });
                              lastIndex = index + word.length;
                            }
                          });
                          if (lastIndex < result.length) {
                            segments.push({ text: result.slice(lastIndex), bold: false });
                          }
                          
                          return (
                            <span key={i}>
                              {i > 0 && arr[i - 1] === '' && <br />}
                              {segments.map((seg, j) => 
                                seg.bold ? (
                                  <span key={j} className="font-semibold">{seg.text}</span>
                                ) : (
                                  <span key={j}>{seg.text}</span>
                                )
                              )}
                            </span>
                          );
                        } else if (line === '') {
                          return <br key={i} />;
                        }
                        return <span key={i}>{line}</span>;
                      })}
                      {finalMessageCursor && <span className="animate-pulse">|</span>}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Meal Plan Card - appears after final message */}
            {showFinalMessage && charIndex >= plainText.length && confirmedDates[0] && (
              <div className="px-3 pb-20" style={{ marginBottom: '80px' }}>
                {/* Group selections by date */}
                {confirmedDates.map((date) => {
                  const daySelections = mealSelections.filter(selection => 
                    format(selection.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                  );

                  if (daySelections.length === 0) return null;

                  return (
                    <div 
                      key={format(date, 'yyyy-MM-dd')} 
                      className="mb-6 bg-white rounded-xl p-4"
                      style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
                    >
                      {/* Day Card - Independent header */}
                      <div 
                        className="border-none px-3 py-2 mb-3 cursor-pointer rounded-lg"
                        style={{ backgroundColor: '#F6F6F6' }}
                      >
                        <div 
                          className="flex items-center justify-between"
                          style={{ backgroundColor: '#F6F6F6' }}
                        >
                          <h3 
                            className="text-sm capitalize font-semibold underline"
                            style={{ 
                              color: '#000000',
                              textUnderlineOffset: '4px'
                            }}
                          >
                            {format(date, "MMM. d", { locale: es })}
                          </h3>
                        </div>
                      </div>

                      {/* Recipe Cards - All meals for this day */}
                      <div className="space-y-0">
                        {daySelections.map((selection, index) => {
                          const categoryMap: Record<string, string> = {
                            'Desayuno': 'breakfast',
                            'Comida': 'lunch',
                            'Cena': 'dinner',
                            'Merienda': 'snacks'
                          };
                          
                          const category = categoryMap[selection.mealType] || 'lunch';
                          const categoryRecipes = recipes.filter(r => r.category === category);
                          const recipe = categoryRecipes[index % categoryRecipes.length] || recipes[0];
                          
                          if (!recipe) return null;
                          
                          const mealLabels: Record<string, string> = {
                            'Desayuno': 'Desa.',
                            'Comida': 'Comi.',
                            'Merienda': 'Meri.',
                            'Cena': 'Cena'
                          };
                          
                          return (
                            <div 
                              key={index} 
                              className="flex items-center gap-3 p-2 rounded-xl bg-white cursor-pointer transition-transform duration-200 h-[120px] mb-3 relative w-full"
                              style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', border: '1px solid #F8F8FC' }}
                            >
                              {/* Recipe Image Container */}
                              <div className="relative flex-shrink-0">
                                <img 
                                  src={recipe.image} 
                                  alt={recipe.title}
                                  className="w-[104px] h-[104px] object-cover rounded-lg"
                                />
                              </div>
                              
                              {/* Recipe Content */}
                              <div className="flex-1 flex flex-col justify-start relative h-[120px] pt-3">
                                {/* Header with title and badge */}
                                <div className="flex items-start gap-2 mb-2 relative">
                                  <h4 className="font-medium text-base leading-tight mt-2 w-[140px] overflow-hidden whitespace-nowrap text-ellipsis">
                                    {recipe.title}
                                  </h4>
                                  <Badge 
                                    className="text-xs font-normal px-2 py-1 absolute right-2 top-1 min-w-fit z-50"
                                    style={{ backgroundColor: '#F6F6F6', color: '#000000' }}
                                  >
                                    {mealLabels[selection.mealType] || selection.mealType}
                                  </Badge>
                                </div>
                                
                                {/* Nutrition info */}
                                <div className="mb-1.5">
                                  {/* Calories */}
                                  <div className="flex items-center gap-1 mb-2">
                                    <img src="/lovable-uploads/d923963b-f4fc-4381-8216-90ad753ef245.png" alt="calories" className="h-4 w-4" />
                                    <span className="text-sm font-normal" style={{ color: '#6C6C6C' }}>{recipe.calories} kcal</span>
                                  </div>
                                  
                                  {/* Macros */}
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                      <img src="/lovable-uploads/967d027e-2a1d-40b3-b300-c73dbb88963a.png" alt="protein" className="h-4 w-4" />
                                      <span className="text-sm font-normal" style={{ color: '#6C6C6C' }}>{Math.round(recipe.macros.protein)}g</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <img src="/lovable-uploads/26934026-f2f8-4901-a7ba-e4e0c8ac36e1.png" alt="carbs" className="h-4 w-4" />
                                      <span className="text-sm font-normal" style={{ color: '#6C6C6C' }}>{Math.round(recipe.macros.carbs)}g</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <img src="/lovable-uploads/7f516dd8-5753-49bd-9b5d-aa5c0bfeedd1.png" alt="fat" className="h-4 w-4" />
                                      <span className="text-sm font-normal" style={{ color: '#6C6C6C' }}>{Math.round(recipe.macros.fat)}g</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
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
