import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [savedLists, setSavedLists] = useState<any[]>([]);

  useEffect(() => {
    // Load saved lists from localStorage
    const saved = localStorage.getItem('savedShoppingLists');
    if (saved) {
      setSavedLists(JSON.parse(saved));
    }
  }, []);

  const handleCreateNewList = () => {
    navigate('/calendar-selection');
  };

  const handleGoToList = (listId: string) => {
    navigate('/milista');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F7F7' }}>
      {/* Top Header - Solo el perfil con iniciales */}
      <div className="flex items-center justify-between p-4">
        <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer" onClick={() => navigate('/profile')}>
          <div className="w-full h-full flex items-center justify-center text-white font-medium text-lg opacity-90" style={{
            backgroundColor: '#ec4899'
          }}>
            RJ
          </div>
        </div>
        <div className="flex-1"></div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4">
        <Card className="bg-white shadow-sm flex-1 flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">
            <h1 className="text-2xl font-bold text-center mb-6">Mis listas</h1>
            
            {/* Saved Lists - Quick Access - Solo si existen */}
            {savedLists.length > 0 && (
              <div className="space-y-3 mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Acceso rápido</h2>
                {savedLists.slice(0, 3).map((list, index) => (
                  <Card key={index} className="border border-gray-200 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleGoToList(list.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{list.name || 'Mi Lista'}</h3>
                          <p className="text-sm text-gray-600">
                            {list.dates?.length || 0} días • {list.servings || 2} personas
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Spacer para empujar el botón hacia abajo */}
            <div className="flex-1"></div>
            
            {/* Create New List Button - Abajo */}
            <Button 
              onClick={handleCreateNewList}
              className="w-full h-14 text-lg font-medium rounded-lg bg-btnFloating text-btnFloating-foreground hover:bg-btnFloating/90 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crear nueva lista
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;