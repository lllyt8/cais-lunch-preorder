# Stripe 支付集成指南

## ✅ 已完成的功能

### 1. 订单支付流程
- 用户下单后自动创建 Stripe Checkout Session
- 跳转到 Stripe 托管支付页面
- 支持信用卡支付
- 支付成功后自动返回订单页面

### 2. 订单状态管理
- 支付成功后订单状态自动更新为 `paid`
- 保存 Stripe Payment Intent ID 到订单记录
- 支持管理员手动更新订单状态

---

## 🔧 环境变量配置

确保你的 `.env.local` 文件包含以下配置：

```bash
# Supabase（已有）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe（新增）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_你的公钥
STRIPE_SECRET_KEY=sk_test_你的密钥

# 应用URL（新增）
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 重要提示：
- 测试环境使用 `pk_test_` 和 `sk_test_` 开头的密钥
- 生产环境使用 `pk_live_` 和 `sk_live_` 开头的密钥
- **千万不要**把 `STRIPE_SECRET_KEY` 暴露到客户端

---

## 🎯 完整支付流程

### 用户端流程

1. **添加商品到购物车**
   - 访问 `/dashboard/order`
   - 选择菜品和份量
   - 添加到购物车

2. **查看购物车**
   - 访问 `/dashboard/cart`
   - 查看按周/孩子/日期分组的订单
   - 调整数量或删除商品

3. **结算订单**
   - 点击 "Checkout" 按钮
   - 填写特殊要求（可选）
   - 点击 "Confirm Order"

4. **支付流程**
   - 系统创建订单记录（状态：`pending_payment`）
   - 自动跳转到 Stripe 支付页面
   - 输入信用卡信息完成支付

5. **支付完成**
   - 自动返回订单历史页面
   - 显示支付成功提示
   - 订单状态更新为 `paid`

### 管理员流程

1. **查看订单**
   - 访问 `/admin/orders`
   - 按日期、客户筛选订单
   - 查看订单详情

2. **更新订单状态**
   - 点击 "Update Status" 按钮
   - 选择支付状态（Pending/Paid/Cancelled）
   - 选择配送状态（Pending Delivery/Delivered）

3. **导出备餐清单**
   - 选择日期
   - 点击 "导出备餐清单"
   - 下载 CSV 文件

---

## 🧪 测试步骤

### 1. 测试支付流程

使用 Stripe 测试卡号：

```
卡号：4242 4242 4242 4242
到期日期：任意未来日期（例如：12/34）
CVC：任意3位数字（例如：123）
邮编：任意5位数字（例如：12345）
```

### 2. 完整测试流程

```bash
# 1. 启动开发服务器
npm run dev

# 2. 访问点餐页面
打开 http://localhost:3000/dashboard/order

# 3. 添加菜品到购物车
- 选择孩子
- 选择日期
- 添加几个菜品

# 4. 进入购物车
访问 http://localhost:3000/dashboard/cart

# 5. 结算
- 点击 Checkout
- 填写特殊要求
- 点击 Confirm Order

# 6. 在 Stripe 支付页面
- 输入测试卡号：4242 4242 4242 4242
- 填写其他信息
- 点击 Pay

# 7. 查看订单
- 自动返回订单页面
- 看到支付成功提示
- 订单状态显示为 "✓ Paid"
```

---

## 📊 数据库变化

支付成功后，`orders` 表会更新：

```sql
-- 支付前
status: 'pending_payment'
stripe_payment_intent_id: NULL

-- 支付后
status: 'paid'
stripe_payment_intent_id: 'pi_xxxxxxxxxxxxx'
```

---

## ⚠️ 常见问题

### Q1: 支付后订单状态没有更新？
**A:** 检查以下几点：
1. 确认 Stripe Secret Key 配置正确
2. 查看浏览器控制台是否有错误
3. 检查服务器日志

### Q2: 支付页面显示错误？
**A:** 确保：
1. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` 配置正确
2. `NEXT_PUBLIC_APP_URL` 设置正确
3. Stripe账号处于激活状态

### Q3: 如何测试失败的支付？
**A:** 使用这些测试卡号：
- **支付失败**: 4000 0000 0000 0002
- **需要3D验证**: 4000 0025 0000 3155
- **被拒绝**: 4000 0000 0000 9995

### Q4: 生产环境如何配置？
**A:** 
1. 在 Stripe Dashboard 切换到 Live mode
2. 获取生产环境的 API 密钥
3. 更新 `.env.production` 或部署平台的环境变量
4. 配置 Webhook（见下文）

---

## 🔗 配置 Webhook（可选，推荐生产环境）

Webhook 可以让 Stripe 主动通知你支付事件，更可靠。

### 1. 在 Stripe Dashboard 配置

1. 访问：https://dashboard.stripe.com/test/webhooks
2. 点击 "Add endpoint"
3. 输入 Webhook URL：
   ```
   https://your-domain.com/api/stripe/webhook
   ```
4. 选择事件：
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. 复制 Webhook Signing Secret（`whsec_...`）

### 2. 添加到环境变量

```bash
STRIPE_WEBHOOK_SECRET=whsec_你的webhook密钥
```

### 3. Webhook 端点（需要单独实现）

```typescript
// src/app/api/stripe/webhook/route.ts
// 这个文件需要专门处理 Stripe Webhook
// 可以确保即使用户关闭浏览器，订单状态也能正确更新
```

---

## 🎉 完成！

现在你的系统支持：
- ✅ 完整的在线支付流程
- ✅ 自动订单状态更新
- ✅ 安全的支付处理
- ✅ 测试和生产环境分离

---

## 📞 技术支持

如果遇到问题：
1. 检查 Stripe Dashboard 的日志
2. 查看 Next.js 服务器控制台
3. 检查浏览器开发者工具的网络请求

---

## 🚀 下一步

- [ ] 配置生产环境 Webhook
- [ ] 添加退款功能
- [ ] 支持订阅/会员充值
- [ ] 添加发票生成功能
