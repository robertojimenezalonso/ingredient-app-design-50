-- Update existing meal profiles with new color palette
DO $$
DECLARE
  profile_record RECORD;
  colors TEXT[] := ARRAY['#A4243B', '#BD632F', '#273E47', '#6E9075', '#EB6534', '#6494AA', '#90A959', '#64B6AC', '#6E8898', '#26A96C'];
  idx INT := 0;
BEGIN
  -- Loop through all profiles ordered by creation date per user
  FOR profile_record IN 
    SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 as profile_index
    FROM meal_profiles
    ORDER BY user_id, created_at
  LOOP
    -- Get the index for this profile within its user
    idx := profile_record.profile_index;
    
    -- Update the profile with a color from the new palette
    UPDATE meal_profiles
    SET profile_color = colors[(idx % 10) + 1]
    WHERE id = profile_record.id;
  END LOOP;
END $$;