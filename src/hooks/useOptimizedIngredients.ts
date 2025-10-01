import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SupermarketIngredient {
  id: string;
  supermarket: string;
  section_department: string;
  product_name: string;
  quantity: number;
  unit_type: string;
  price: number;
  image_url: string | null;
}

const fetchSupermarketIngredients = async (supermarket: string): Promise<SupermarketIngredient[]> => {
  const supermarketName = supermarket.charAt(0).toUpperCase() + supermarket.slice(1);
  
  const { data, error } = await supabase
    .from('supermarket_ingredients')
    .select('id, supermarket, section_department, product_name, quantity, unit_type, price, image_url')
    .eq('supermarket', supermarketName);

  if (error) throw error;
  return data || [];
};

export const useOptimizedIngredients = (supermarket: string | null) => {
  return useQuery({
    queryKey: ['supermarket-ingredients', supermarket],
    queryFn: () => fetchSupermarketIngredients(supermarket!),
    enabled: !!supermarket,
    staleTime: 1000 * 60 * 10, // 10 minutos - los ingredientes no cambian frecuentemente
  });
};
