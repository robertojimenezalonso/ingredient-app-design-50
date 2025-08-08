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
  
  // Check if images are preloaded to skip loading state
  const areImagesPreloaded = localStorage.getItem('recipeImagesPreloaded') === 'true';
  const isSupabaseImage = src?.includes('supabase.co') && src?.includes('recipe-images');
  const shouldSkipLoading = areImagesPreloaded && isSupabaseImage;
  
  const [isLoading, setIsLoading] = useState(!shouldSkipLoading);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');

  // Function to add cache-busting parameters to URLs
  const addCacheBuster = (url: string): string => {
    if (!url) return url;
    
    // Only add cache buster to Supabase storage URLs
    if (url.includes('supabase.co') && url.includes('recipe-images')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}t=${Date.now()}&cache=no-cache`;
    }
    
    return url;
  };

  useEffect(() => {
    // If images are preloaded and this is a Supabase recipe image, skip loading
    if (shouldSkipLoading) {
      setIsLoading(false);
      setCurrentSrc(src);
    } else {
      setIsLoading(true);
      setCurrentSrc(addCacheBuster(src));
    }
    setError(false);
  }, [src, shouldSkipLoading]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
    if (currentSrc !== finalFallbackSrc) {
      setCurrentSrc(addCacheBuster(finalFallbackSrc));
      setIsLoading(true);
      setError(false);
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
        loading="lazy"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};