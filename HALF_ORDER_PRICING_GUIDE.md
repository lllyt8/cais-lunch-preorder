# 半份价格功能 - 使用指南

## ✅ 已完成的更新

### 1. 数据库 ✅
- 新增 `half_order_price` 字段
- 迁移脚本：`src/lib/db/migrations/add-half-order-pricing.sql`

### 2. 类型定义 ✅
- `MenuItem` 接口已添加 `half_order_price?: number`

### 3. 前端组件 ✅
- `MenuItemCard` - 自动根据数据库显示份量选择器
- `MenuItemForm` - 管理后台新增半份价格输入框

---

## 🚀 快速开始

### 步骤 1: 执行数据库迁移（如果还没执行）

在 Supabase SQL Editor 中执行：

```sql
-- 复制并执行整个文件内容
-- src/lib/db/migrations/add-half-order-pricing.sql
```

### 步骤 2: 在管理后台编辑菜品

访问：`http://localhost:3000/admin/menu`

**表单字段说明：**

1. **全份价格 ($)** *（必填）
   - 设置整份的价格
   - 例如：12.99

2. **半份价格 ($)** （可选）
   - 如果留空 → 不支持半份
   - 如果填写 → 用户可选择半份
   - 例如：8.99

3. **仅全份** （复选框）
   - ☑️ 勾选 → 半份价格输入框会被禁用并清空
   - ☐ 不勾选 → 可以设置半份价格

---

## 💡 使用场景

### 场景 A: 支持半份的菜品
```
菜品名称: Chicken Teriyaki Bento
全份价格: $12.00
半份价格: $8.00
仅全份: ☐ 不勾选
```
**结果**: 用户在点餐时可以选择全份($12)或半份($8)

---

### 场景 B: 仅全份的菜品
```
菜品名称: Premium Wagyu Steak
全份价格: $25.00
半份价格: (留空)
仅全份: ☑️ 勾选
```
**结果**: 用户只能选择全份($25)，没有半份选项

---

### 场景 C: 不支持半份但不强制
```
菜品名称: Miso Soup
全份价格: $3.50
半份价格: (留空)
仅全份: ☐ 不勾选
```
**结果**: 用户只能选择全份($3.50)，因为没有设置半份价格

---

## 🎯 前端行为

### 用户点餐页面 (`/dashboard/order`)

1. **如果菜品有 `half_order_price`**
   - ✅ 显示份量选择器（Full Order / Half Order）
   - ✅ 价格随选择动态更新
   - ✅ 购物车显示份量信息

2. **如果菜品没有 `half_order_price`**
   - ❌ 不显示份量选择器
   - ✅ 默认添加全份

---

## 🔧 价格逻辑

### 前端代码（已自动实现）
```typescript
// MenuItemCard.tsx
const supportsHalfOrder = !item.is_full_order_only && item.half_order_price != null

const getPrice = () => {
  if (selectedPortion === 'Half Order' && item.half_order_price != null) {
    return item.half_order_price  // 返回半份价格
  }
  return item.base_price  // 返回全份价格
}
```

---

## 📊 数据库查询示例

### 查看所有菜品的价格设置
```sql
SELECT 
  name,
  base_price as full_price,
  half_order_price,
  is_full_order_only,
  CASE 
    WHEN is_full_order_only = true THEN '❌ 仅全份'
    WHEN half_order_price IS NOT NULL THEN '✅ 支持半份'
    ELSE '⚠️ 不支持半份'
  END as status
FROM menu_items
ORDER BY category, name;
```

### 批量设置半份价格（全份 - $2）
```sql
UPDATE menu_items
SET half_order_price = base_price - 2.00
WHERE is_full_order_only = false
  AND half_order_price IS NULL;
```

### 设置特定菜品的价格
```sql
-- 设置支持半份
UPDATE menu_items 
SET 
  base_price = 12.00,
  half_order_price = 8.00,
  is_full_order_only = false
WHERE name = 'Chicken Teriyaki Bento';

-- 设置仅全份
UPDATE menu_items 
SET 
  base_price = 15.00,
  half_order_price = NULL,
  is_full_order_only = true
WHERE name = 'Premium Set';
```

---

## 🎨 UI 预览

### 管理后台
```
┌─────────────────────────────────────┐
│ 基本信息                             │
├─────────────────────────────────────┤
│ 全份价格 ($) *                       │
│ [12.99]                             │
│                                     │
│ 半份价格 ($)                         │
│ （留空=不支持半份）                   │
│ [8.99]                              │
│                                     │
├─────────────────────────────────────┤
│ 选项设置                             │
├─────────────────────────────────────┤
│ ☐ 仅全份                            │
│   客户不能选择半份                   │
└─────────────────────────────────────┘
```

### 用户点餐页面（支持半份）
```
┌─────────────────────────────────────┐
│ 🍱 Chicken Teriyaki Bento          │
├─────────────────────────────────────┤
│ 🌱 Vegetarian  🫘 Soy              │
│                                     │
│ [Full Order - $12.00 ▼]            │
│  • Full Order - $12.00             │
│  • Half Order - $8.00              │
│                                     │
│ $12.00           [+ 添加]          │
└─────────────────────────────────────┘
```

---

## ❓ 常见问题

### Q: 如果我勾选了"仅全份"，半份价格会怎样？
A: 半份价格输入框会被禁用并清空，保存时 `half_order_price` 为 NULL

### Q: 我可以设置半份价格比全份高吗？
A: 技术上可以，但不建议，会让用户困惑

### Q: 如何临时关闭某个菜品的半份选项？
A: 有两种方法：
1. 删除半份价格（留空）
2. 勾选"仅全份"

### Q: 现有订单会受影响吗？
A: 不会，订单记录的是下单时的价格（`unit_price_at_time_of_order`）

---

## 🎉 测试清单

- [ ] 在管理后台添加新菜品，设置半份价格
- [ ] 编辑现有菜品，添加/修改半份价格
- [ ] 勾选"仅全份"，确认半份价格被禁用
- [ ] 在用户点餐页面，确认份量选择器显示
- [ ] 切换份量，确认价格实时更新
- [ ] 添加到购物车，确认份量信息正确
- [ ] 提交订单，确认订单金额正确

---

完成测试后，你的系统就完全支持灵活的半份定价了！🚀
