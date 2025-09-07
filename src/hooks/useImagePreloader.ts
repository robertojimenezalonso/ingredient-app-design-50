import { useEffect } from 'react';

export const useImagePreloader = (imageUrls: string[], priority: boolean = false) => {
  useEffect(() => {
    if (!imageUrls.length) return;

    const preloadImages = () => {
      imageUrls.forEach((url, index) => {
        // Solo precargar las primeras 3 imágenes para no sobrecargar
        if (index < 3) {
          const img = new Image();
          img.src = url;
          
          // Para imágenes de alta prioridad, intentar forzar la carga
          if (priority && index === 0) {
            img.loading = 'eager';
            img.fetchPriority = 'high';
          }
          
          console.log(`🚀 [Preloader] Preloading image ${index + 1}:`, url);
        }
      });
    };

    // Usar requestIdleCallback si está disponible, sino setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadImages);
    } else {
      setTimeout(preloadImages, 100);
    }
  }, [imageUrls, priority]);
};