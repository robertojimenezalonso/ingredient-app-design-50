import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  placeholder?: React.ReactNode;
  category?: string;
}

const getCategoryFallback = (category?: string): string => {
  const fallbacks = {
    'desayuno': 'https://images.unsplash.com/photo-1551892374-ecf8cc4efbb6?w=400&h=300&fit=crop',
    'comida': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    'cena': 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&h=300&fit=crop',
    'snack': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
    'aperitivo': 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
    'merienda': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop'
  };
  return fallbacks[category?.toLowerCase() as keyof typeof fallbacks] || 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&h=300&fit=crop';
};

export const ImageLoader = ({ 
  src, 
  alt, 
  className, 
  fallbackSrc,
  placeholder,
  category
}: ImageLoaderProps) => {
  const defaultFallback = getCategoryFallback(category);
  const finalFallbackSrc = fallbackSrc || defaultFallback;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');

  useEffect(() => {
    console.log('🖼️ [ImageLoader] Loading image:', src);
    setIsLoading(true);
    setError(false);
    setCurrentSrc(src);
  }, [src]);

  const handleLoad = () => {
    console.log('✅ [ImageLoader] Image loaded successfully:', currentSrc);
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    console.log('❌ [ImageLoader] Failed to load image:', currentSrc);
    setError(true);
    setIsLoading(false);
    if (currentSrc !== finalFallbackSrc) {
      console.log('🔄 [ImageLoader] Using fallback image:', finalFallbackSrc);
      setCurrentSrc(finalFallbackSrc);
      setIsLoading(true);
      setError(false);
    } else {
      console.log('💥 [ImageLoader] Fallback also failed');
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className={cn(
          "absolute inset-0 bg-muted animate-pulse flex items-center justify-center",
          className
        )}>
          {placeholder || (
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading="eager"
      />
    </div>
  );
};