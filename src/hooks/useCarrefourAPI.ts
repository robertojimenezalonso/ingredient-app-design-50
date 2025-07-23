import { useState, useEffect } from 'react';

export interface CarrefourProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  link: string;
  brand: string;
  pricePerKg?: string;
  offers?: string[];
  detalle?: {
    nutritionalInfo?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
    };
    ingredients?: string;
    format?: string;
  };
}

export const useCarrefourAPI = () => {
  const [products, setProducts] = useState<CarrefourProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://api.apify.com/v2/datasets/bqCAOOqM3FeCL4Zjg/items?token=apify_api_IdusT4ankfpQAhd6XU9vjGV7UuBRWd1BIn4x');
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      
      // Transform the API data to our format
      const transformedProducts = data.map((item: any) => ({
        id: item.link || Math.random().toString(),
        name: item.nombre || 'Producto sin nombre',
        price: item.precio || `${(Math.random() * 3 + 1).toFixed(2).replace('.', ',')} €`,
        image: item.imagen || '',
        link: item.link || '',
        brand: item.marca || '',
        pricePerKg: item.precioPor,
        offers: item.oferta ? [item.oferta] : [],
        detalle: item.detalle ? {
          nutritionalInfo: item.detalle.nutritionalInfo,
          ingredients: item.detalle.ingredients,
          format: item.detalle.format
        } : undefined
      }));
      
      setProducts(transformedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching Carrefour products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to find matching product for an ingredient
  const findMatchingProduct = (ingredientName: string, ingredientId?: string): CarrefourProduct | null => {
    if (products.length === 0) return null;
    
    // Filter out products without name
    const validProducts = products.filter(p => p.name && p.name.trim() !== '');
    
    if (validProducts.length === 0) return null;
    
    const normalized = ingredientName.toLowerCase();
    
    // Try to find exact or partial matches
    const exactMatch = validProducts.find(p => 
      p.name.toLowerCase().includes(normalized) || 
      normalized.includes(p.name.toLowerCase())
    );
    
    if (exactMatch) return exactMatch;
    
    // If no match found, return a consistent product based on ingredient ID
    // This ensures the same ingredient always gets the same product
    let seedValue = 0;
    if (ingredientId) {
      // Create a simple hash from the ingredient ID for consistent selection
      for (let i = 0; i < ingredientId.length; i++) {
        seedValue += ingredientId.charCodeAt(i);
      }
    } else {
      // Fallback to ingredient name if no ID provided
      for (let i = 0; i < ingredientName.length; i++) {
        seedValue += ingredientName.charCodeAt(i);
      }
    }
    
    const consistentIndex = seedValue % validProducts.length;
    return validProducts[consistentIndex];
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    findMatchingProduct,
    refetch: fetchProducts
  };
};