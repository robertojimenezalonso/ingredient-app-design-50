import { Search, ShoppingCart, ChefHat, User, Plus } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'explore' | 'cart' | 'recipes' | 'profile';
  onTabChange: (tab: 'explore' | 'cart' | 'recipes' | 'profile') => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: 'explore' as const, icon: ChefHat, label: 'Recetas' },
    { id: 'cart' as const, icon: Search, label: 'Super' }
  ];

  const tabsRight = [
    { id: 'recipes' as const, icon: ChefHat, label: 'Cocina' },
    { id: 'profile' as const, icon: User, label: 'Perfil' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-background border-t" style={{ height: '80px' }}>
        <div className="flex items-center justify-around h-full">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center justify-start pt-3 gap-1 flex-1 h-full transition-colors ${
                activeTab === id 
                  ? 'text-black' 
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
          

        </div>
      </div>
    </div>
  );
};