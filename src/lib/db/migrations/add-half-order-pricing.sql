-- Migration: Add Half Order Pricing Support
-- Created: 2024-12-07
-- Description: 添加半份价格字段，支持灵活定价

-- Step 1: 添加半份价格字段
ALTER TABLE menu_items 
  ADD COLUMN IF NOT EXISTS half_order_price NUMERIC;

-- Step 2: 添加字段注释
COMMENT ON COLUMN menu_items.half_order_price IS '半份价格 - 如果为NULL则不支持半份，如果有值则支持半份';

-- Step 3: 更新现有数据 - 为允许半份的菜品设置价格
-- 默认策略：半份 = 全份 - $2.00
UPDATE menu_items
SET half_order_price = base_price - 2.00
WHERE is_full_order_only = false
  AND half_order_price IS NULL;

-- Step 4: 特殊处理饺子类（根据原有逻辑）
-- 饺子: 整份$13, 半份$11
UPDATE menu_items
SET 
  base_price = 13.00,
  half_order_price = 11.00
WHERE name ILIKE '%dumpling%'
  AND is_full_order_only = false;

-- Step 5: 验证数据
SELECT 
  name,
  category,
  base_price as full_price,
  half_order_price,
  is_full_order_only,
  CASE 
    WHEN is_full_order_only = true THEN '仅全份'
    WHEN half_order_price IS NOT NULL THEN '支持半份'
    ELSE '不支持半份'
  END as portion_support
FROM menu_items
ORDER BY category, name;

-- 说明：
-- 1. base_price = 全份价格
-- 2. half_order_price = 半份价格（NULL = 不支持半份）
-- 3. is_full_order_only = true 时，half_order_price 应为 NULL
