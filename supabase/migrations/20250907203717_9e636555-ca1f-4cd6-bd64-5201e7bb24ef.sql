-- Corregir los valores nutricionales de la tortilla de champiñones, espinacas y queso
-- Los valores originales eran POR RACIÓN para 2 personas, no para la receta completa

UPDATE recipe_bank 
SET 
  calories = 760, -- 380 calorías por ración × 2 personas
  macronutrients = '{
    "carbs": 24,
    "fat": 56, 
    "protein": 50
  }'::jsonb, -- Los macronutrientes por ración × 2 personas
  micronutrients = '{
    "calcium": "560 mg",
    "fiber": "8 g", 
    "iron": "6 mg",
    "sodium": "1240 mg",
    "sugar": "4 g",
    "vitaminC": "24 mg"
  }'::jsonb -- Los micronutrientes por ración × 2 personas
WHERE id = '565fd12c-9179-4b28-b685-64133170b22e';