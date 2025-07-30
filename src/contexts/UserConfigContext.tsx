import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserConfig {
  postalCode: string;
  supermarket: string;
  servingsPerRecipe: number;
  selectedDates?: string[];
  selectedMeals?: string[];
  hasPlanningSession?: boolean;
  shouldAnimateChart?: boolean;
}

interface UserConfigContextType {
  config: UserConfig;
  updateConfig: (updates: Partial<UserConfig>) => void;
  isConfigComplete: boolean;
}

const UserConfigContext = createContext<UserConfigContextType | undefined>(undefined);

export const useUserConfig = () => {
  const context = useContext(UserConfigContext);
  if (!context) {
    throw new Error('useUserConfig must be used within a UserConfigProvider');
  }
  return context;
};

export const UserConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<UserConfig>(() => {
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem('user-config');
    return savedConfig ? JSON.parse(savedConfig) : {
      postalCode: '',
      supermarket: '',
      servingsPerRecipe: 1,
      selectedDates: [],
      selectedMeals: [],
      hasPlanningSession: false,
      shouldAnimateChart: false,
    };
  });

  const updateConfig = (updates: Partial<UserConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    localStorage.setItem('user-config', JSON.stringify(newConfig));
  };

  const isConfigComplete = config.postalCode !== '' && config.supermarket !== '';

  return (
    <UserConfigContext.Provider value={{ config, updateConfig, isConfigComplete }}>
      {children}
    </UserConfigContext.Provider>
  );
};