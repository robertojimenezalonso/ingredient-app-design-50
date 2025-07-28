import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  placeholder?: React.ReactNode;
}

export const ImageLoader = ({ 
  src, 
  alt, 
  className, 
  fallbackSrc = 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400',
  placeholder
}: ImageLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    setCurrentSrc(src);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
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
      />
    </div>
  );
};