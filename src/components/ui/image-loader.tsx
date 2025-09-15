import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  placeholder?: React.ReactNode;
  category?: string;
  priority?: boolean; // Para imágenes importantes que necesitan cargar primero
}

const getCategoryFallback = (category?: string): string => {
  const fallbacks = {
    'desayuno': 'https://images.unsplash.com/photo-1551892374-ecf8cc4efbb6?w=300&h=300&fit=crop&auto=format&q=75',
    'comida': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop&auto=format&q=75',
    'cena': 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=300&h=300&fit=crop&auto=format&q=75',
    'snack': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=300&fit=crop&auto=format&q=75',
    'aperitivo': 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=300&h=300&fit=crop&auto=format&q=75',
    'merienda': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=300&fit=crop&auto=format&q=75'
  };
  return fallbacks[category?.toLowerCase() as keyof typeof fallbacks] || 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=300&h=300&fit=crop&auto=format&q=75';
};

// Cache simple para evitar recargas
const imageCache = new Set<string>();

export const ImageLoader = ({ 
  src, 
  alt, 
  className, 
  fallbackSrc,
  placeholder,
  category,
  priority = false
}: ImageLoaderProps) => {
  const defaultFallback = getCategoryFallback(category);
  const finalFallbackSrc = fallbackSrc || defaultFallback;
  
  const [isLoading, setIsLoading] = useState(!imageCache.has(src));
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (imageCache.has(src)) {
      setIsLoading(false);
      setError(false);
      setCurrentSrc(src);
      return;
    }

    setIsLoading(true);
    setError(false);
    setCurrentSrc(src);

    // Timeout para cargar fallback si la imagen tarda mucho
    timeoutRef.current = setTimeout(() => {
      if (isLoading && currentSrc === src) {
        console.log('⏰ [ImageLoader] Timeout loading image, using fallback:', src);
        setCurrentSrc(finalFallbackSrc);
        setError(false);
        setIsLoading(true);
      }
    }, priority ? 3000 : 2000); // Menos tiempo para imágenes normales

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [src, finalFallbackSrc, priority, isLoading, currentSrc]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
    imageCache.add(currentSrc);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (currentSrc !== finalFallbackSrc) {
      console.log('❌ [ImageLoader] Failed to load, using fallback:', currentSrc);
      setCurrentSrc(finalFallbackSrc);
      setIsLoading(true);
      setError(false);
    }
  };

  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200", className)}>
      {/* Mostrar fallback inmediatamente si hay error */}
      {error && currentSrc === finalFallbackSrc ? (
        <div className={cn("w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center", className)}>
          <div className="text-muted-foreground text-sm text-center p-4">
            <div className="w-8 h-8 mx-auto mb-2 opacity-50">🍽️</div>
            <div>Imagen no disponible</div>
          </div>
        </div>
      ) : (
        <>
          {/* Imagen real */}
          <img
            ref={imgRef}
            src={currentSrc}
            alt={alt}
            className={cn(
              "transition-all duration-300 w-full h-full object-cover",
              isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100",
              className
            )}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
          
          {/* Loading overlay */}
          {isLoading && (
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br from-muted via-muted to-muted-foreground/10 flex items-center justify-center",
              className
            )}>
              {placeholder || (
                <div className="text-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <div className="text-xs text-muted-foreground opacity-70">Cargando...</div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};