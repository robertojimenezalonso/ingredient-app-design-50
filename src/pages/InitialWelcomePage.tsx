import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { SavedShoppingListCard } from '@/components/SavedShoppingListCard';

const InitialWelcomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'explore' | 'cart' | 'recipes' | 'profile'>('explore');

  const handleTabChange = (tab: 'explore' | 'cart' | 'recipes' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'explore') {
      navigate('/calendar-selection');
    } else if (tab === 'profile') {
      navigate('/profile');
    } else if (tab === 'cart') {
      navigate('/cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Saved Shopping List Card - only shows when returning from Mi Lista */}
      <SavedShoppingListCard />
      
      {/* Main welcome content */}
      <div className="p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenido a tu asistente de compras
          </h1>
          <p className="text-gray-600">
            Planifica tus comidas y genera tu lista de la compra automáticamente
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">🗓️ Planifica tus comidas</h2>
            <p className="text-gray-600 text-sm">
              Selecciona los días que quieres planificar y las comidas que prefieres
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">👥 Configura raciones</h2>
            <p className="text-gray-600 text-sm">
              Indica para cuántas personas cocinas y tus preferencias dietéticas
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">🛒 Lista automática</h2>
            <p className="text-gray-600 text-sm">
              Genera tu lista de la compra con todos los ingredientes necesarios
            </p>
          </div>
        </div>

        <div className="mt-8">
          <button 
            onClick={() => navigate('/calendar-selection')}
            className="w-full bg-black text-white py-4 px-6 rounded-2xl font-medium text-base shadow-lg hover:bg-gray-800 transition-colors"
          >
            Comenzar planificación
          </button>
        </div>
      </div>

      <BottomNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default InitialWelcomePage;