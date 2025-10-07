import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ArrowLeft, ArrowUp, Plus, MoreVertical, X, ChevronRight, User, Utensils, Flame, Apple } from 'lucide-react';
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
  
  // Use recipe bank for meal plan preview
  const { getRandomRecipesByCategory } = useRecipeBank();
  
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
        shouldRestoreSelection: true 
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
  const mealPlanPreview = Object.values(groupedSelections).map((group: any) => {
    const categoryMap: { [key: string]: string } = {
      'Desayuno': 'desayuno',
      'Comida': 'comida',
      'Cena': 'cena',
      'Postre': 'comida',
      'Snack': 'snack'
    };
    
    const meals = group.mealTypes.map((mealType: string) => {
      const category = categoryMap[mealType] || 'comida';
      const recipe = getRandomRecipesByCategory(category, 1)[0];
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

            {/* Meal Plan Preview */}
            <div className="px-4 mb-6">
              <div className="flex justify-start">
                <div className="rounded-xl p-4 border" style={{ 
                  backgroundColor: '#F4F4F4',
                  borderColor: '#D9DADC'
                }}>
                  <p className="text-sm font-semibold text-[#1C1C1C] mb-3">
                    438 planes encajan con tus preferencias
                  </p>
                  
                  <div className="space-y-4">
                    {mealPlanPreview.map((day, dayIndex) => (
                      <div key={dayIndex}>
                        <p className="text-xs font-medium text-[#666666] mb-2">
                          {formatShortDate(day.date)}
                        </p>
                        <div className="flex gap-2">
                          {day.meals.map((meal, mealIndex) => (
                            meal.recipe && (
                              <div key={mealIndex} className="flex flex-col items-center gap-1">
                                <div 
                                  className="w-16 h-16 rounded-lg overflow-hidden bg-white"
                                  style={{ border: '1px solid #E5E5E5' }}
                                >
                                  <img 
                                    src={meal.recipe.image} 
                                    alt={meal.recipe.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="text-[10px] text-[#666666]">
                                  {meal.mealType}
                                </span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bot question */}
            <div className="px-4 mb-6">
              <div className="flex justify-start">
                <div className="w-full">
                  <div className="mb-4">
                    {showIcon && (
                      <p className="text-base text-[#1C1C1C] whitespace-pre-line">
                        <span className="font-semibold">Veo que aún no tienes ningún perfil de comensal vinculado a tu cuenta.</span> Esto nos ayudará a entender mejor tus <span className="font-semibold">objetivos y preferencias,</span> y así ofrecerte recetas personalizadas con los ingredientes de <span className="font-semibold capitalize">{selectedSupermarket || 'tu supermercado favorito'}</span>.{'\n\n'}Añade tantos <span className="font-semibold">perfiles de comensal</span> como personas vayan a comer contigo en los días que seleccionaste.
                        {showCursor && <span className="animate-pulse">|</span>}
                      </p>
                    )}
                  </div>
                  
                  {/* Rectángulo contenedor para título, botón y tags */}
                  <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#F4F4F4' }}>
                    {/* Contador de comensales y botón añadir */}
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold text-[#1C1C1C]">
                        {healthProfiles.length === 0 ? 'Sin comensales' : `${healthProfiles.length} ${healthProfiles.length === 1 ? 'comensal' : 'comensales'}`}
                      </h2>
                      <button
                        onClick={handleAddProfile}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="text-base font-medium">Añadir</span>
                      </button>
                    </div>
                    
                    {/* Health Profiles - Compact Tags */}
                    <div className="flex flex-col gap-3">
                      {healthProfiles.map((profile, index) => (
                      <div 
                        key={profile.id} 
                        className="inline-flex items-center gap-2 px-3 cursor-pointer h-[46px] w-fit"
                        style={{ 
                          backgroundColor: '#D9DADC',
                          borderRadius: '8px'
                        }}
                        onClick={() => handleEditProfile(profile)}
                      >
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden flex-shrink-0"
                            style={{ 
                              backgroundColor: getProfileColor(profile, index), 
                              color: 'rgba(255, 255, 255, 0.8)'
                            }}
                          >
                            {profile.avatarUrl ? (
                              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                              getInitials(profile.name)
                            )}
                          </div>
                          <span className="text-base font-normal text-black">{profile.name}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Subtítulo informativo */}
                    <p className="text-sm text-[#666666] mt-4">
                      Guardaremos los perfiles de comensales para que no tengas que configurarlos de nuevo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Button Area */}
        <div className="absolute left-0 right-0 z-10" style={{
          backgroundColor: '#FFFFFF',
          bottom: 'env(safe-area-inset-bottom, 0px)'
        }}>
          <div className="px-4 pt-4 pb-8 flex items-center gap-2" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
            {healthProfiles.filter(p => p.name.trim() !== '').length > 0 && (
              <div className="flex-1 flex items-center gap-2 px-4 h-10 rounded-full overflow-x-auto scrollbar-hide" style={{ 
                backgroundColor: '#F2F2F2'
              }}>
                {healthProfiles.filter(profile => profile.name.trim() !== '').map(profile => (
                  <Badge 
                    key={profile.id}
                    variant="secondary" 
                    className="font-normal py-1 flex items-center gap-1 flex-shrink-0" 
                    style={{ backgroundColor: '#D9DADC', color: '#020818', borderRadius: '8px' }}
                  >
                    {profile.name}
                  </Badge>
                ))}
              </div>
            )}
            <Button 
              variant="ghost" 
              onClick={handleContinue} 
              disabled={!canContinue} 
              className="w-10 h-10 rounded-full flex items-center justify-center border-0 p-0 flex-shrink-0 ml-auto" 
              style={{
                backgroundColor: canContinue ? '#000000' : '#898885',
                color: canContinue ? '#ffffff' : '#F9F8F2',
                border: 'none',
                opacity: 1
              }}
            >
              <ArrowUp size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Creation Drawer */}
      <ProfileCreationDrawer
        ref={profileDrawerRef}
        isOpen={profileDrawerOpen}
        onClose={handleCancelProfile}
        onSave={handleSaveProfile}
        editingProfile={editingProfile}
        profileIndex={healthProfiles.length}
        onDelete={editingProfile?.id ? () => handleDeleteProfile(editingProfile.id) : undefined}
      />

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};
