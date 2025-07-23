import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserConfig {
  postalCode: string;
  supermarket: string;
  servingsPerRecipe: number;
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
  const [config, setConfig] = useState<UserConfig>({
    postalCode: '',
    supermarket: '',
    servingsPerRecipe: 1,
  });

  const updateConfig = (updates: Partial<UserConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const isConfigComplete = config.postalCode !== '' && config.supermarket !== '';

  return (
    <UserConfigContext.Provider value={{ config, updateConfig, isConfigComplete }}>
      {children}
    </UserConfigContext.Provider>
  );
};