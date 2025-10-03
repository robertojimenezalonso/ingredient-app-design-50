-- Add gustos column to meal_profiles table
ALTER TABLE public.meal_profiles 
ADD COLUMN IF NOT EXISTS gustos TEXT[] DEFAULT '{}'::TEXT[];