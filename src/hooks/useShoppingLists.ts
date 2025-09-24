import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Recipe } from '@/types/recipe';

export interface ShoppingList {
  id: string;
  name: string;
  dates: string[];
  servings: number;
  meals: string[];
  estimated_price: number;
  created_at: string;
  updated_at: string;
  recipes?: Recipe[];
}

export const useShoppingLists = () => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadLists = async () => {
    if (!user) {
      setLists([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Load lists with their recipes
      const { data: listsData, error: listsError } = await supabase
        .from('shopping_lists')
        .select(`
          *,
          list_recipes (
            recipe_data,
            position
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (listsError) {
        console.error('Error loading lists:', listsError);
        return;
      }

      // Transform the data to include recipes
      const transformedLists = (listsData || []).map(list => ({
        ...list,
        recipes: list.list_recipes
          ?.sort((a, b) => a.position - b.position)
          .map(lr => lr.recipe_data as unknown as Recipe) || []
      }));

      setLists(transformedLists);
    } catch (error) {
      console.error('Error loading shopping lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveList = async (listData: {
    name: string;
    dates: string[];
    servings: number;
    meals: string[];
    recipes: Recipe[];
    estimated_price?: number;
  }) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    try {
      // Insert the shopping list
      const { data: listResult, error: listError } = await supabase
        .from('shopping_lists')
        .insert({
          user_id: user.id,
          name: listData.name,
          dates: listData.dates,
          servings: listData.servings,
          meals: listData.meals,
          estimated_price: listData.estimated_price || 0
        })
        .select()
        .single();

      if (listError) {
        throw listError;
      }

      // Insert the recipes
      if (listData.recipes.length > 0) {
        const recipeInserts = listData.recipes.map((recipe, index) => ({
          list_id: listResult.id,
          recipe_data: recipe as any,
          position: index
        }));

        const { error: recipesError } = await supabase
          .from('list_recipes')
          .insert(recipeInserts);

        if (recipesError) {
          throw recipesError;
        }
      }

      // Reload lists
      await loadLists();
      
      return listResult;
    } catch (error) {
      console.error('Error saving list:', error);
      throw error;
    }
  };

  const deleteList = async (listId: string) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    try {
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Reload lists
      await loadLists();
    } catch (error) {
      console.error('Error deleting list:', error);
      throw error;
    }
  };

  const deleteAllLists = async () => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    try {
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Reload lists
      await loadLists();
    } catch (error) {
      console.error('Error deleting all lists:', error);
      throw error;
    }
  };

  const getListById = async (listId: string): Promise<ShoppingList | null> => {
    if (!user) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select(`
          *,
          list_recipes (
            recipe_data,
            position
          )
        `)
        .eq('id', listId)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        ...data,
        recipes: data.list_recipes
          ?.sort((a, b) => a.position - b.position)
          .map(lr => lr.recipe_data as unknown as Recipe) || []
      };
    } catch (error) {
      console.error('Error loading list by ID:', error);
      return null;
    }
  };

  useEffect(() => {
    loadLists();
  }, [user]);

  return {
    lists,
    loading,
    loadLists,
    saveList,
    deleteList,
    deleteAllLists,
    getListById
  };
};