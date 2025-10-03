-- Create table for diner profiles
CREATE TABLE public.diner_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  diet TEXT,
  allergies TEXT[] DEFAULT '{}',
  health_goal TEXT,
  birth_date TEXT,
  weight TEXT,
  height TEXT,
  sex TEXT,
  activity_level TEXT,
  calories INTEGER,
  carbs INTEGER,
  protein INTEGER,
  fat INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.diner_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own diner profiles"
ON public.diner_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diner profiles"
ON public.diner_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diner profiles"
ON public.diner_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diner profiles"
ON public.diner_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_diner_profiles_updated_at
BEFORE UPDATE ON public.diner_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();