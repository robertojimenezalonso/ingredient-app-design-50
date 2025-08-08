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
    setCurrentSrc(addCacheBuster(src));
    setError(false);
  }, [src]);

  const handleError = () => {
    setError(true);
    if (currentSrc !== finalFallbackSrc) {
      setCurrentSrc(addCacheBuster(finalFallbackSrc));
      setError(false);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
    />
  );
};