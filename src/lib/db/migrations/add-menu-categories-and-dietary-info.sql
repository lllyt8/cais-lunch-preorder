-- Migration: Add menu categories, images, and dietary information
-- Run this in Supabase SQL Editor
-- Date: 2024-12-07

-- Step 1: Add new columns to menu_items table
ALTER TABLE menu_items 
  ADD COLUMN IF NOT EXISTS available_date DATE,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_vegetarian BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS contains_soy BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS contains_gluten BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS contains_fish BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS contains_eggs BOOLEAN DEFAULT FALSE;

-- Step 2: Add column comments for documentation
COMMENT ON COLUMN menu_items.image_url IS '菜品图片URL';
COMMENT ON COLUMN menu_items.is_vegetarian IS '素食选项';
COMMENT ON COLUMN menu_items.contains_soy IS '含大豆';
COMMENT ON COLUMN menu_items.contains_gluten IS '含麸质';
COMMENT ON COLUMN menu_items.contains_fish IS '含鱼类';
COMMENT ON COLUMN menu_items.contains_eggs IS '含鸡蛋';

-- Step 3: Update existing menu items to new category system (4 main categories)
-- 🍚 Rice / Bento category
UPDATE menu_items SET category = 'rice' 
WHERE name ILIKE ANY(ARRAY[
  '%Bento%', 
  '%Rice%', 
  '%Musubi%',
  'Orange Chicken with Rice',
  'Grilled Pork Banh Mi Bento',
  'Teriyaki Chicken Rice',
  'Grilled Chicken with Rice',
  'Beef Vermicelli Rice',
  'Tender Beef Stew Rice',
  'Spam Musubi',
  'Tofu Musubi',
  'Sun Bento Box',
  'Moon Bento Box',
  'Star Bento Box',
  'Cloud Bento Box',
  'Sky Bento Box'
]);

-- 🍜 Noodles category
UPDATE menu_items SET category = 'noodles'
WHERE name ILIKE ANY(ARRAY[
  '%Noodle%',
  'Beef Vermicelli Noodles',
  'Steak Noodle Soup',
  'Chicken Noodle Soup',
  'Wonton Soup with Noodles'
]);

-- 🥟 Dumplings category
UPDATE menu_items SET category = 'dumplings'
WHERE name ILIKE '%Dumpling%' 
   OR (name ILIKE '%Wonton%' AND name NOT ILIKE '%Noodle%');

-- 🍟 Snacks category
UPDATE menu_items SET category = 'snacks'
WHERE name ILIKE ANY(ARRAY[
  '%Snack%', 
  '%Spring Roll%', 
  '%Edamame%', 
  '%Fruit%',
  'Vegetarian Snacks',
  'Shrimp Fresh Spring Roll'
]);

-- Step 4: Sample dietary information updates (customize based on your actual menu)
-- Vegetarian items
UPDATE menu_items 
SET is_vegetarian = true
WHERE name ILIKE ANY(ARRAY[
  'Tofu Musubi',
  'Vegetarian Snacks',
  '%Vegetable%',
  '%Veggie%',
  'Edamame'
]);

-- Items containing soy
UPDATE menu_items
SET contains_soy = true
WHERE name ILIKE ANY(ARRAY[
  '%Tofu%',
  '%Soy%',
  '%Teriyaki%',
  'Edamame'
]);

-- Items containing gluten
UPDATE menu_items
SET contains_gluten = true
WHERE name ILIKE ANY(ARRAY[
  '%Noodle%',
  '%Bento%',
  '%Rice%',
  '%Dumpling%',
  '%Wonton%'
]);

-- Items containing fish
UPDATE menu_items
SET contains_fish = true
WHERE name ILIKE ANY(ARRAY[
  '%Fish%',
  '%Salmon%',
  '%Tuna%'
]);

-- Items containing eggs
UPDATE menu_items
SET contains_eggs = true
WHERE name ILIKE ANY(ARRAY[
  '%Noodle%',
  '%Fried Rice%',
  '%Egg%'
]);

-- Step 5: Verify the changes
SELECT 
  name,
  category,
  is_vegetarian,
  contains_soy,
  contains_gluten,
  contains_fish,
  contains_eggs
FROM menu_items
ORDER BY category, name;

-- Step 6: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available_date ON menu_items(available_date);

COMMENT ON TABLE menu_items IS '菜单项表 - 包含菜品信息、分类、图片和饮食标签';
