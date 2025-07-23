import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const useHapticFeedback = () => {
  const triggerImpact = async (style: ImpactStyle = ImpactStyle.Light) => {
    try {
      await Haptics.impact({ style });
    } catch (error) {
      // Fallback para web - usar vibración del navegador si está disponible
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const triggerSelection = async () => {
    try {
      await Haptics.selectionChanged();
    } catch (error) {
      if (navigator.vibrate) {
        navigator.vibrate(25);
      }
    }
  };

  return {
    triggerImpact,
    triggerSelection
  };
};