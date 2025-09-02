import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, List, User } from 'lucide-react';

export const BottomNav = () => {
  const location = useLocation();

  const tabs = [
    { id: 'explore', label: 'Explorar', icon: Search, path: '/' },
    { id: 'lists', label: 'Listas', icon: List, path: '/milista' },
    { id: 'profile', label: 'Perfil', icon: User, path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`flex flex-col items-center py-2 px-4 transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};