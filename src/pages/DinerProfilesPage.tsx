import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const DinerProfilesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const confirmedDates = location.state?.confirmedDates || [];
  const selectedSupermarket = location.state?.selectedSupermarket || null;
  const mealSelections = location.state?.mealSelections || [];

  const handleBack = () => {
    navigate('/recipe-preferences', { 
      state: { 
        confirmedDates,
        selectedSupermarket,
        mealSelections,
        shouldRestoreSelection: true 
      } 
    });
  };

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
        <div className="flex-1 transition-all duration-500 ease-out overflow-hidden" style={{
          backgroundColor: '#FFFFFF'
        }}>
          <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
            {/* User response - "Customizar por receta" (right-aligned) */}
            <div className="px-4 pt-4 mb-6">
              <div className="flex justify-end">
                <div 
                  className="text-[#1C1C1C] rounded-lg px-3 py-2 text-sm max-w-xs" 
                  style={{ backgroundColor: '#F4F4F4' }}
                >
                  Customizar por receta
                </div>
              </div>
            </div>

            {/* Bot message - No profiles message */}
            <div className="px-4 mb-6">
              <div className="flex justify-start">
                <div className="max-w-full w-full">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">👤</span>
                    <p className="text-base text-[#1C1C1C]">
                      Genial 👌. Aún no tienes ningún perfil de comensal guardado. Agrega al menos uno para poder personalizar tus recetas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
