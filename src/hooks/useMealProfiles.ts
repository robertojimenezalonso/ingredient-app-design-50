import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type MealProfile = {
  id: string;
  user_id: string;
  name: string;
  diet?: string;
  allergies?: string[];
  health_goal?: string;
  birth_date?: string;
  weight?: string;
  height?: string;
  sex?: string;
  activity_level?: string;
  calories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
  profile_color?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
};

export const useMealProfiles = () => {
  const [profiles, setProfiles] = useState<MealProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch profiles from Supabase
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('meal_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching meal profiles:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los perfiles de comensales',
          variant: 'destructive',
        });
        setProfiles([]);
      } else {
        setProfiles(data || []);
      }
    } catch (error) {
      console.error('Error in fetchProfiles:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Create a new profile
  const createProfile = async (profileData: Omit<MealProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'Debes iniciar sesión para crear un perfil',
          variant: 'destructive',
        });
        return null;
      }

      // Assign a color if not provided
      const colors = ['#A4243B', '#BD632F', '#273E47', '#6E9075', '#EB6534', '#6494AA', '#90A959', '#64B6AC', '#6E8898', '#26A96C'];
      const profileColor = profileData.profile_color || colors[profiles.length % colors.length];

      const { data, error } = await supabase
        .from('meal_profiles')
        .insert([{
          user_id: user.id,
          ...profileData,
          profile_color: profileColor
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating meal profile:', error);
        toast({
          title: 'Error',
          description: 'No se pudo crear el perfil de comensal',
          variant: 'destructive',
        });
        return null;
      }

      toast({
        title: 'Perfil creado',
        description: `Perfil de ${profileData.name} creado exitosamente`,
      });

      await fetchProfiles();
      return data;
    } catch (error) {
      console.error('Error in createProfile:', error);
      return null;
    }
  };

  // Update an existing profile
  const updateProfile = async (id: string, profileData: Partial<MealProfile>) => {
    try {
      const { error } = await supabase
        .from('meal_profiles')
        .update(profileData)
        .eq('id', id);

      if (error) {
        console.error('Error updating meal profile:', error);
        toast({
          title: 'Error',
          description: 'No se pudo actualizar el perfil de comensal',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Perfil actualizado',
        description: 'Los cambios se guardaron correctamente',
      });

      await fetchProfiles();
      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return false;
    }
  };

  // Delete a profile
  const deleteProfile = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meal_profiles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting meal profile:', error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el perfil de comensal',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Perfil eliminado',
        description: 'El perfil se eliminó correctamente',
      });

      await fetchProfiles();
      return true;
    } catch (error) {
      console.error('Error in deleteProfile:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchProfiles();
    
    // Listen for profile updates from the drawer
    const handleProfileUpdate = () => {
      fetchProfiles();
    };
    
    window.addEventListener('meal-profile-updated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('meal-profile-updated', handleProfileUpdate);
    };
  }, []);

  return {
    profiles,
    loading,
    createProfile,
    updateProfile,
    deleteProfile,
    refetch: fetchProfiles,
  };
};
