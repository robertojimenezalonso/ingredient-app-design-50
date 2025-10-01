import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ArrowLeft, ArrowUp, Plus, MoreVertical } from 'lucide-react';
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
      // Convert date strings back to Date objects
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
  const secondFullText = "O también puedes:";
  const totalNumbers = 10;
  
  const [selectedServings, setSelectedServings] = useState<number | 'custom' | null>(null);
  const [healthProfiles, setHealthProfiles] = useState<Array<{ 
    id: number; 
    name: string; 
    diet?: string;
    allergies?: string;
    healthGoal?: string;
    isEditingName: boolean 
  }>>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [dietDrawerOpen, setDietDrawerOpen] = useState(false);
  const [selectedProfileForDiet, setSelectedProfileForDiet] = useState<number | null>(null);

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Helper function to calculate profile completion percentage
  const getProfileCompletion = (profile: typeof healthProfiles[0]) => {
    let completed = 0;
    const total = 4; // Nombre, Dieta, Alergias, Objetivo
    
    if (profile.name) completed++;
    if (profile.diet) completed++;
    if (profile.allergies) completed++;
    if (profile.healthGoal) completed++;
    
    return (completed / total) * 100;
  };

  // Helper function to get profile color
  const getProfileColor = (index: number) => {
    const colors = [
      '#FF6B6B', // Coral red
      '#4ECDC4', // Turquoise
      '#45B7D1', // Sky blue
      '#FFA07A', // Light salmon
      '#98D8C8', // Mint
      '#F7DC6F', // Yellow
      '#BB8FCE', // Purple
      '#85C1E2', // Light blue
    ];
    return colors[index % colors.length];
  };
  
  // Animation states
  const skipAnimations = shouldSkipAnimations || (persistedData !== null);
  const [showIcon, setShowIcon] = useState(true);
  const [displayedText, setDisplayedText] = useState(skipAnimations ? fullText : '');
  const [showCursor, setShowCursor] = useState(!skipAnimations);

  const handleAddProfile = () => {
    const newId = healthProfiles.length + 1;
    setHealthProfiles([...healthProfiles, { 
      id: newId, 
      name: '', 
      diet: undefined, 
      allergies: undefined,
      healthGoal: undefined,
      isEditingName: false 
    }]);
  };

  const handleOpenDietDrawer = (profileId: number) => {
    setSelectedProfileForDiet(profileId);
    setDietDrawerOpen(true);
  };

  const handleSelectDiet = (diet: string) => {
    if (selectedProfileForDiet !== null) {
      setHealthProfiles(profiles =>
        profiles.map(p => {
          if (p.id === selectedProfileForDiet) {
            // Si ya está seleccionada esta dieta, la deseleccionamos
            if (p.diet === diet) {
              return { ...p, diet: undefined };
            }
            // Si no, la seleccionamos
            return { ...p, diet };
          }
          return p;
        })
      );
    }
    setDietDrawerOpen(false);
    setSelectedProfileForDiet(null);
  };

  const handleStartEditingName = (profileId: number) => {
    setHealthProfiles(profiles => 
      profiles.map(p => p.id === profileId ? { ...p, isEditingName: true } : p)
    );
  };

  const handleNameChange = (profileId: number, newName: string) => {
    setHealthProfiles(profiles =>
      profiles.map(p => p.id === profileId ? { ...p, name: newName } : p)
    );
  };

  const handleNameBlur = (profileId: number) => {
    setHealthProfiles(profiles =>
      profiles.map(p => p.id === profileId ? { ...p, isEditingName: false } : p)
    );
  };

  const handleDeleteProfile = (profileId: number) => {
    setHealthProfiles(profiles => profiles.filter(p => p.id !== profileId));
    setOpenMenuId(null);
  };

  const toggleMenu = (profileId: number) => {
    setOpenMenuId(openMenuId === profileId ? null : profileId);
  };

  const handleContinue = () => {
    if (selectedServings !== null) {
      if (selectedServings === 'custom') {
        // Navegar a la pantalla de customización
        navigate('/customize-servings', {
          state: { 
            confirmedDates,
            selectedSupermarket,
            mealSelections
          }
        });
      } else {
        // Aquí navegaremos a la siguiente pantalla con los datos
        console.log('Continuing with servings:', selectedServings);
        // TODO: navigate to next page
      }
    }
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

  // Agrupar selecciones por fecha y ordenar tipos de comida
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

  // Ordenar los tipos de comida en cada grupo
  Object.values(groupedSelections).forEach((group: any) => {
    group.mealTypes.sort((a: string, b: string) => {
      return mealTypeOrder.indexOf(a) - mealTypeOrder.indexOf(b);
    });
  });

  const formatShortDate = (date: Date) => {
    const formatted = format(date, 'EEE d', { locale: es });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Typewriter effect for text
  useEffect(() => {
    if (skipAnimations || fullText.length === 0) return;
    
    if (displayedText.length === 0) {
      // Start typewriter
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
    <div className="min-h-screen flex flex-col relative" style={{
      backgroundColor: '#FCFBF8'
    }}>
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

      {/* Chat area - starts below fixed header */}
      <div className="h-screen flex flex-col relative pt-16">
        <div className="flex-1 transition-all duration-500 ease-out overflow-hidden pb-20" style={{
          backgroundColor: '#FFFFFF'
        }}>
          <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
            {/* User response - meal selections (right-aligned) */}
            <div className="px-4 pt-4 mb-6">
              <div className="flex justify-end">
                <div 
                  className="text-[#1C1C1C] rounded-lg px-3 py-2 text-sm max-w-xs" 
                  style={{ backgroundColor: '#F4F4F4' }}
                >
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

            {/* Bot question - servings selection */}
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
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {/* Avatar with circular progress - only show when name exists */}
                          {profile.name && (
                            <div className="relative flex-shrink-0 w-14 h-14">
                              {/* Progress ring - more separated */}
                              <svg className="absolute inset-0 w-14 h-14" style={{ transform: 'rotate(-90deg)' }}>
                                {/* Background circle */}
                                <circle
                                  cx="28"
                                  cy="28"
                                  r="26"
                                  stroke="#E5E5E5"
                                  strokeWidth="2.5"
                                  fill="none"
                                />
                                {/* Progress circle */}
                                <circle
                                  cx="28"
                                  cy="28"
                                  r="26"
                                  stroke="#10B981"
                                  strokeWidth="2.5"
                                  fill="none"
                                  strokeDasharray={`${2 * Math.PI * 26}`}
                                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - getProfileCompletion(profile) / 100)}`}
                                  strokeLinecap="round"
                                  className="transition-all duration-300"
                                />
                              </svg>
                              {/* Avatar centered inside with more space */}
                              <div 
                                className="absolute inset-[7px] rounded-full flex items-center justify-center text-sm font-medium"
                                style={{ 
                                  backgroundColor: getProfileColor(index),
                                  color: 'rgba(255, 255, 255, 0.8)'
                                }}
                              >
                                {getInitials(profile.name)}
                              </div>
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-[#1C1C1C]">
                              {profile.name || `Perfil ${profile.id}`}
                            </h3>
                            {profile.name && (
                              <p className="text-xs text-[#898885]">
                                {Math.round(getProfileCompletion(profile))}% perfil completado
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => toggleMenu(profile.id)}
                            className="p-1 hover:bg-[#F4F4F4] rounded-full transition-colors"
                          >
                            <MoreVertical className="h-5 w-5 text-[#1C1C1C]" />
                          </button>
                          {openMenuId === profile.id && (
                            <div className="absolute right-0 top-8 bg-white border border-[#E5E5E5] rounded-lg shadow-lg py-1 z-10">
                              <button
                                onClick={() => handleDeleteProfile(profile.id)}
                                className="px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left whitespace-nowrap"
                              >
                                Eliminar perfil
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#F4F4F4' }}>
                        {[
                          'Nombre',
                          'Dieta',
                          'Alergias e intolerancias',
                          'Objetivo de salud'
                        ].map((field, fieldIndex, array) => (
                          <div key={field}>
                            <div className="flex items-center justify-between px-4 py-3">
                              <span className="text-[#1C1C1C] text-base">
                                {field === 'Nombre' ? 'Nombre*' : field}
                              </span>
                              {field === 'Nombre' ? (
                                profile.isEditingName ? (
                                  <Input
                                    autoFocus
                                    value={profile.name}
                                    onChange={(e) => handleNameChange(profile.id, e.target.value)}
                                    onBlur={() => handleNameBlur(profile.id)}
                                    className="h-8 w-40 text-base"
                                    placeholder="Escribe aquí"
                                  />
                                ) : profile.name ? (
                                  <button
                                    onClick={() => handleStartEditingName(profile.id)}
                                    className="text-[#1C1C1C] text-base"
                                  >
                                    {profile.name}
                                  </button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[#1C1C1C] hover:bg-[#E5E5E5] h-8 px-3 text-base"
                                    onClick={() => handleStartEditingName(profile.id)}
                                  >
                                    Añadir
                                  </Button>
                                )
                              ) : field === 'Dieta' ? (
                                profile.diet ? (
                                  <button
                                    onClick={() => handleOpenDietDrawer(profile.id)}
                                    className="text-[#1C1C1C] text-base"
                                  >
                                    {profile.diet}
                                  </button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[#1C1C1C] hover:bg-[#E5E5E5] h-8 px-3 text-base"
                                    onClick={() => handleOpenDietDrawer(profile.id)}
                                  >
                                    Añadir
                                  </Button>
                                )
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#1C1C1C] hover:bg-[#E5E5E5] h-8 px-3 text-base"
                                >
                                  Añadir
                                </Button>
                              )}
                            </div>
                            {fieldIndex < array.length - 1 && (
                              <div className="border-t border-[#D1D1D1]" />
                            )}
                          </div>
                        ))}
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

        {/* Fixed Button Area at Bottom of Screen */}
        <div className="absolute bottom-0 left-0 right-0" style={{
          backgroundColor: '#FFFFFF'
        }}>
          <div className="px-4 pt-4 pb-8 flex items-center gap-2" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
            {healthProfiles.filter(p => p.name.trim() !== '').length > 0 && (
              <div className="flex-1 flex items-center gap-2 px-4 h-10 rounded-full overflow-x-auto scrollbar-hide" style={{ 
                backgroundColor: '#F2F2F2',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
                {healthProfiles
                  .filter(profile => profile.name.trim() !== '')
                  .map(profile => (
                    <Badge 
                      key={profile.id}
                      variant="secondary" 
                      className="font-normal hover:bg-[#D9DADC] py-1 flex items-center gap-1 flex-shrink-0" 
                      style={{ 
                        backgroundColor: '#D9DADC', 
                        color: '#020818',
                        borderRadius: '8px'
                      }}
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

      {/* Diet Drawer */}
      <Drawer open={dietDrawerOpen} onOpenChange={setDietDrawerOpen}>
        <DrawerContent className="max-h-[50vh]">
          <DrawerHeader>
            <DrawerTitle className="text-left text-lg font-medium">
              ¿Sigues alguna dieta específica?
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-2">
            {['Clásico', 'Pescetariano', 'Vegetariano', 'Vegano'].map((diet) => {
              const currentProfile = healthProfiles.find(p => p.id === selectedProfileForDiet);
              const isSelected = currentProfile?.diet === diet;
              
              return (
                <button
                  key={diet}
                  onClick={() => handleSelectDiet(diet)}
                  className="w-full py-4 px-4 text-left text-base transition-colors flex items-center justify-between"
                  style={{
                    backgroundColor: isSelected ? '#D9DADC' : '#E5E5E5',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #020817' : '1px solid transparent'
                  }}
                >
                  {diet}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};