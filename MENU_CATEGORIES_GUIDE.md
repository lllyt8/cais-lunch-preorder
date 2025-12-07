# 菜单分类和饮食标签功能 - 使用指南

## 📋 功能概述

已完成菜单页面的全面改造，现在支持：

### ✅ 4大菜品分类
- 🍚 **饭类** (Rice / Bento) - 所有含米饭的主餐
- 🍜 **面类** (Noodles) - 所有汤面/干面
- 🥟 **饺子类** (Dumplings) - 饺子/云吞
- 🍟 **零食小食** (Snacks) - 小食和开胃菜

### ✅ 饮食标签系统
- 🌱 **Vegetarian** - 素食选项
- 🫘 **Soy** - 含大豆
- 🌾 **Gluten** - 含麸质
- 🐟 **Fish** - 含鱼类
- 🥚 **Eggs** - 含鸡蛋

### ✅ 菜品图片支持
每个菜品可以展示图片，暂无图片时显示默认占位符

---

## 🚀 部署步骤

### 1. 运行数据库迁移

在 Supabase SQL Editor 中运行迁移脚本：

```bash
# 文件位置
src/lib/db/migrations/add-menu-categories-and-dietary-info.sql
```

这将：
- 添加 `image_url` 字段
- 添加 5 个饮食标签字段（is_vegetarian, contains_soy, contains_gluten, contains_fish, contains_eggs）
- 将现有菜品分类到4大类别
- 根据菜品名称自动设置饮食标签（需要手动验证和调整）

### 2. 验证数据

运行以下SQL查看更新后的数据：

```sql
SELECT 
  name,
  category,
  base_price,
  image_url,
  is_vegetarian,
  contains_soy,
  contains_gluten,
  contains_fish,
  contains_eggs
FROM menu_items
ORDER BY category, name;
```

---

## 📸 如何上传菜品图片

### 方法1: 使用Supabase Storage

1. **在Supabase创建Storage Bucket**
   ```sql
   -- 创建public bucket用于存储菜品图片
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('menu-images', 'menu-images', true);
   
   -- 允许所有人读取
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING ( bucket_id = 'menu-images' );
   ```

2. **上传图片到Storage**
   - 进入Supabase Dashboard → Storage → menu-images
   - 上传图片（建议尺寸：800x600px，格式：jpg/png/webp）
   - 获取public URL

3. **更新menu_items表**
   ```sql
   UPDATE menu_items 
   SET image_url = 'https://your-project.supabase.co/storage/v1/object/public/menu-images/orange-chicken.jpg'
   WHERE name = 'Orange Chicken with Rice';
   ```

### 方法2: 使用外部CDN

如果图片托管在其他地方（如Cloudinary、AWS S3等）：

```sql
UPDATE menu_items 
SET image_url = 'https://your-cdn.com/images/chicken-rice.jpg'
WHERE name = 'Chicken Teriyaki Bento';
```

### 批量上传示例

```sql
-- 批量更新多个菜品的图片
UPDATE menu_items SET image_url = 'https://cdn.example.com/sun-bento.jpg' WHERE name = 'Sun Bento Box';
UPDATE menu_items SET image_url = 'https://cdn.example.com/moon-bento.jpg' WHERE name = 'Moon Bento Box';
UPDATE menu_items SET image_url = 'https://cdn.example.com/dumpling.jpg' WHERE name = 'Steamed Dumplings';
```

---

## 🔧 手动调整饮食标签

迁移脚本已经根据菜品名称做了初步设置，但需要根据实际情况调整：

```sql
-- 示例：更新Orange Chicken的饮食信息
UPDATE menu_items 
SET 
  is_vegetarian = false,
  contains_soy = true,
  contains_gluten = true,
  contains_eggs = true,
  contains_fish = false
WHERE name = 'Orange Chicken with Rice';

-- 示例：更新素食春卷
UPDATE menu_items 
SET 
  is_vegetarian = true,
  contains_soy = false,
  contains_gluten = true,
  contains_eggs = false,
  contains_fish = false
WHERE name = 'Shrimp Fresh Spring Roll';
```

---

## 🎨 UI效果

### 桌面端/平板
- 菜品卡片2列布局
- 每个分类独立展示区域
- 图片占据卡片上半部分

### 移动端
- 菜品卡片1列布局
- 滚动浏览所有分类
- 响应式图片加载

---

## 📝 添加新菜品

```sql
INSERT INTO menu_items (
  name, 
  description, 
  base_price, 
  category,
  image_url,
  is_vegetarian,
  contains_soy,
  contains_gluten,
  contains_fish,
  contains_eggs,
  is_full_order_only,
  has_tofu_option
) VALUES (
  'Grilled Salmon Bento',
  'Fresh grilled salmon with steamed rice and vegetables',
  15.00,
  'rice',
  'https://cdn.example.com/salmon-bento.jpg',
  false,  -- not vegetarian
  true,   -- contains soy (teriyaki sauce)
  true,   -- contains gluten (soy sauce)
  true,   -- contains fish
  false,  -- no eggs
  false,  -- can order half
  false   -- no tofu option
);
```

---

## 🐛 常见问题

### Q: 图片不显示？
A: 检查：
1. image_url是否是有效的public URL
2. 图片URL是否支持跨域访问
3. Supabase Storage的RLS策略是否正确

### Q: 如何批量修改某个分类的所有菜品？
A:
```sql
-- 将所有饭类设为含麸质
UPDATE menu_items 
SET contains_gluten = true 
WHERE category = 'rice';
```

### Q: 如何添加新的饮食标签？
A: 需要修改以下文件：
1. `src/constants/dietary-tags.ts` - 添加新标签配置
2. `src/types/database.ts` - 添加新字段类型
3. 运行SQL添加新列到数据库

---

## 📊 分类建议

根据你提供的菜单：

### 🍚 饭类 (13道菜品)
- Sun/Moon/Star/Cloud/Sky Bento Box
- Orange Chicken with Rice
- Teriyaki Chicken Rice
- Grilled Chicken/Pork with Rice
- Beef Vermicelli Rice
- Tender Beef Stew Rice
- Spam Musubi
- Tofu Musubi

### 🍜 面类 (4道菜品)
- Steak Noodle Soup
- Chicken Noodle Soup
- Wonton Soup with Noodles
- Beef Vermicelli Noodles

### 🥟 饺子类 (2道菜品)
- Steamed Dumplings
- Wonton Soup

### 🍟 零食小食 (3道菜品)
- Snacks
- Vegetarian Snacks
- Shrimp Fresh Spring Roll

---

## 🎯 下一步建议

1. **上传高质量菜品图片** - 提升视觉吸引力
2. **验证饮食标签准确性** - 确保过敏原信息正确
3. **添加菜品描述** - 丰富菜品信息
4. **考虑添加营养信息** - 卡路里、蛋白质等

---

有问题随时问！🚀
