import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ArrowLeft, ArrowUp, Plus, MoreVertical, X, ChevronRight, User, Utensils, Flame, Apple } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  
  const persistedData = getPersistedData();
  const confirmedDates = location.state?.confirmedDates || persistedData?.confirmedDates || [];
  const selectedSupermarket = location.state?.selectedSupermarket || persistedData?.selectedSupermarket || null;
  const mealSelections = location.state?.mealSelections || persistedData?.mealSelections || [];
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
  
  const [healthProfiles, setHealthProfiles] = useState<Array<{ 
    id: number; 
    name: string; 
    diet?: string;
    allergies?: string;
    healthGoal?: string;
  }>>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [dietDrawerOpen, setDietDrawerOpen] = useState(false);
  const [allergiesDrawerOpen, setAllergiesDrawerOpen] = useState(false);
  const [goalDrawerOpen, setGoalDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<{
    id?: number;
    name: string;
    diet?: string;
    allergies?: string;
    healthGoal?: string;
  } | null>(null);

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
    const total = 4;
    
    if (profile.name) completed++;
    if (profile.diet) completed++;
    if (profile.allergies) completed++;
    if (profile.healthGoal) completed++;
    
    return (completed / total) * 100;
  };

  const getProfileColor = (index: number) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    return colors[index % colors.length];
  };
  
  const skipAnimations = shouldSkipAnimations || (persistedData !== null);
  const [showIcon, setShowIcon] = useState(true);
  const [displayedText, setDisplayedText] = useState(skipAnimations ? fullText : '');
  const [showCursor, setShowCursor] = useState(!skipAnimations);

  const handleAddProfile = () => {
    setEditingProfile({
      name: 'Comensal 1',
      diet: undefined,
      allergies: undefined,
      healthGoal: undefined
    });
    setProfileDrawerOpen(true);
  };

  const handleEditProfile = (profile: typeof healthProfiles[0]) => {
    setEditingProfile({
      id: profile.id,
      name: profile.name,
      diet: profile.diet,
      allergies: profile.allergies,
      healthGoal: profile.healthGoal
    });
    setProfileDrawerOpen(true);
  };

  const handleSaveProfile = () => {
    if (!editingProfile || !editingProfile.name.trim()) return;

    if (editingProfile.id) {
      setHealthProfiles(profiles =>
        profiles.map(p => p.id === editingProfile.id ? {
          ...p,
          name: editingProfile.name,
          diet: editingProfile.diet,
          allergies: editingProfile.allergies,
          healthGoal: editingProfile.healthGoal
        } : p)
      );
    } else {
      const newId = healthProfiles.length + 1;
      setHealthProfiles([...healthProfiles, {
        id: newId,
        name: editingProfile.name,
        diet: editingProfile.diet,
        allergies: editingProfile.allergies,
        healthGoal: editingProfile.healthGoal
      }]);
    }
    
    setProfileDrawerOpen(false);
    setEditingProfile(null);
  };

  const handleCancelProfile = () => {
    setProfileDrawerOpen(false);
    setEditingProfile(null);
  };

  const handleDeleteProfile = (profileId: number) => {
    setHealthProfiles(profiles => profiles.filter(p => p.id !== profileId));
    setOpenMenuId(null);
  };

  const toggleMenu = (profileId: number) => {
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
          className="ml-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors"
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
                  
                  {/* Health Profiles */}
                  {healthProfiles.map((profile, index) => (
                    <div key={profile.id} className="mb-4">
                      <div 
                        onClick={() => handleEditProfile(profile)}
                        className="flex items-center justify-between mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0 w-14 h-14">
                            <svg className="absolute inset-0 w-14 h-14" style={{ transform: 'rotate(-90deg)' }}>
                              <circle cx="28" cy="28" r="26" stroke="#E5E5E5" strokeWidth="2.5" fill="none" />
                              <circle
                                cx="28" cy="28" r="26" stroke="#10B981" strokeWidth="2.5" fill="none"
                                strokeDasharray={`${2 * Math.PI * 26}`}
                                strokeDashoffset={`${2 * Math.PI * 26 * (1 - getProfileCompletion(profile) / 100)}`}
                                strokeLinecap="round" className="transition-all duration-300"
                              />
                            </svg>
                            <div 
                              className="absolute inset-[7px] rounded-full flex items-center justify-center text-sm font-medium"
                              style={{ backgroundColor: getProfileColor(index), color: 'rgba(255, 255, 255, 0.8)' }}
                            >
                              {getInitials(profile.name)}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-[#1C1C1C]">{profile.name}</h3>
                            <p className="text-xs text-[#898885]">
                              {Math.round(getProfileCompletion(profile))}% perfil completado
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMenu(profile.id);
                            }}
                            className="p-1 hover:bg-[#F4F4F4] rounded-full transition-colors"
                          >
                            <MoreVertical className="h-5 w-5 text-[#1C1C1C]" />
                          </button>
                          {openMenuId === profile.id && (
                            <div className="absolute right-0 top-8 bg-white border border-[#E5E5E5] rounded-lg shadow-lg py-1 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProfile(profile.id);
                                }}
                                className="px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left whitespace-nowrap"
                              >
                                Eliminar perfil
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="default"
                    onClick={handleAddProfile}
                    className="bg-[#1C1C1C] text-white hover:bg-[#000000] w-auto mt-6"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir perfil comensal
                  </Button>
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
                    className="font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" 
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

      {/* Profile Drawer */}
      <Drawer open={profileDrawerOpen} onOpenChange={setProfileDrawerOpen}>
        <DrawerContent className="bg-white animate-slide-in-right h-[90vh]">
          
          {/* Profile Header with Avatar and Progress */}
          <div className="px-4 pt-6 pb-4 flex items-center gap-4 border-b border-[#E5E5E5]">
            <div className="relative flex-shrink-0 w-16 h-16">
              <svg className="absolute inset-0 w-16 h-16" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="32" cy="32" r="30" stroke="#E5E5E5" strokeWidth="2.5" fill="none" />
                <circle
                  cx="32" cy="32" r="30" stroke="#10B981" strokeWidth="2.5" fill="none"
                  strokeDasharray={`${2 * Math.PI * 30}`}
                  strokeDashoffset={`${2 * Math.PI * 30 * (1 - (editingProfile ? getProfileCompletion(editingProfile as any) : 0) / 100)}`}
                  strokeLinecap="round" className="transition-all duration-300"
                />
              </svg>
              <div 
                className="absolute inset-2 rounded-full flex items-center justify-center text-xl font-semibold text-white"
                style={{ 
                  backgroundColor: editingProfile?.id 
                    ? getProfileColor(healthProfiles.findIndex(p => p.id === editingProfile.id))
                    : getProfileColor(healthProfiles.length)
                }}
              >
                {getInitials(editingProfile?.name || 'Comensal 1')}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-[#1C1C1C]">{editingProfile?.name || 'Comensal 1'}</h3>
              <p className="text-sm text-[#898885]">
                {Math.round(editingProfile ? getProfileCompletion(editingProfile as any) : 25)}% perfil completado
              </p>
            </div>
          </div>

          <div className="px-4 py-8 overflow-y-auto h-full" style={{ backgroundColor: '#F4F4F4' }}>
            <Card className="overflow-hidden">
              {/* Datos personales */}
              <button className="w-full py-4 px-4 flex items-center justify-between hover:bg-[#F4F4F4] transition-colors border-b border-[#E5E5E5] min-h-[72px]">
                <div className="flex-1 flex items-center gap-3">
                  <User className="h-5 w-5 text-[#898885] flex-shrink-0" />
                  <h4 className="text-base text-[#1C1C1C]">Datos personales</h4>
                </div>
                <ChevronRight className="h-5 w-5 text-[#898885] flex-shrink-0" />
              </button>

              {/* Ajustes macronutrientes */}
              <button className="w-full py-4 px-4 flex items-center justify-between hover:bg-[#F4F4F4] transition-colors border-b border-[#E5E5E5] min-h-[72px]">
                <div className="flex-1 flex items-center gap-3">
                  <Utensils className="h-5 w-5 text-[#898885] flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="text-base text-[#1C1C1C]">Ajustes macronutrientes</h4>
                    <p className="text-sm text-[#898885] mt-0.5">Hidratos, grasas, proteínas</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#898885] flex-shrink-0" />
              </button>

              {/* Ajustes calorías */}
              <button className="w-full py-4 px-4 flex items-center justify-between hover:bg-[#F4F4F4] transition-colors border-b border-[#E5E5E5] min-h-[72px]">
                <div className="flex-1 flex items-center gap-3">
                  <Flame className="h-5 w-5 text-[#898885] flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="text-base text-[#1C1C1C]">Ajustes calorías</h4>
                    <p className="text-sm text-[#898885] mt-0.5">2500 kcal/día</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#898885] flex-shrink-0" />
              </button>

              {/* Necesidades y preferencias nutricionales */}
              <button className="w-full py-4 px-4 flex items-center justify-between hover:bg-[#F4F4F4] transition-colors min-h-[72px]">
                <div className="flex-1 flex items-center gap-3">
                  <Apple className="h-5 w-5 text-[#898885] flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="text-base text-[#1C1C1C]">Necesidades y preferencias nutricionales</h4>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#898885] flex-shrink-0" />
              </button>
            </Card>

            <Button
              variant="default"
              className="w-full mt-4 bg-[#1C1C1C] text-white hover:bg-[#000000]"
            >
              Guardar perfil
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
