-- Reassign unique colors to meal profiles based on creation order
DO $$
DECLARE
  profile_record RECORD;
  colors TEXT[] := ARRAY['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  idx INT := 0;
BEGIN
  -- Loop through all profiles ordered by creation date
  FOR profile_record IN 
    SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 as profile_index
    FROM meal_profiles
    ORDER BY user_id, created_at
  LOOP
    -- Get the index for this profile within its user
    idx := profile_record.profile_index;
    
    -- Update the profile with a unique color from the array
    UPDATE meal_profiles
    SET profile_color = colors[(idx % 8) + 1]
    WHERE id = profile_record.id;
  END LOOP;
END $$;