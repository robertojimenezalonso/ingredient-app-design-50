interface NavigationControlsProps {
  navigationData?: {
    canGoPrevious: boolean;
    canGoNext: boolean;
    isGenerating: boolean;
    handlePrevious: () => void;
    handleNext: () => void;
    handleGenerate: () => void;
  };
}

export const NavigationControls = ({ navigationData }: NavigationControlsProps) => {
  if (!navigationData) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30" style={{
      paddingBottom: `calc(88px + env(safe-area-inset-bottom))`
    }}>
      <div className="mx-4 bg-white rounded-lg px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span 
            className={`text-base font-medium cursor-pointer transition-colors ${
              navigationData.isGenerating 
                ? 'text-muted-foreground cursor-not-allowed' 
                : 'text-foreground hover:text-primary'
            }`}
            onClick={!navigationData.isGenerating ? navigationData.handleGenerate : undefined}
          >
            {navigationData.isGenerating ? 'Cambiando plan...' : 'Cambiar plan'}
          </span>
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/4d196b4e-7430-45d5-9ea8-3c41447ec14c.png" 
              alt="Anterior" 
              className={`h-7 w-7 cursor-pointer transition-opacity ${
                navigationData.canGoPrevious ? 'opacity-100 hover:opacity-80' : 'opacity-30 cursor-not-allowed'
              }`}
              onClick={navigationData.canGoPrevious ? navigationData.handlePrevious : undefined}
            />
            <img 
              src="/lovable-uploads/d3ec2ee8-42f5-4273-a17c-c7f05147048d.png" 
              alt="Siguiente" 
              className={`h-7 w-7 cursor-pointer transition-opacity ${
                navigationData.canGoNext ? 'opacity-100 hover:opacity-80' : 'opacity-30 cursor-not-allowed'
              }`}
              onClick={navigationData.canGoNext ? navigationData.handleNext : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
};