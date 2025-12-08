# 🚀 快速上线清单

## ✅ 准备工作（5分钟）

### 1. 确认你有这些账号
- [ ] GitHub 账号（代码已推送）
- [ ] Vercel 账号（用GitHub登录）
- [ ] Supabase 项目（数据库已配置）
- [ ] Stripe 账号（测试密钥已获取）

### 2. 确认环境变量
打开 `.env.local`，确保有这些：
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_
STRIPE_SECRET_KEY=sk_test_
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 部署步骤（15分钟）

### Step 1: 推送代码到 GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: 部署到 Vercel

1. 访问：**https://vercel.com/new**
2. 点击 "Import Project"
3. 选择你的 GitHub 仓库
4. Framework: **Next.js**（自动检测）
5. 添加环境变量（逐个复制粘贴）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_APP_URL` = `https://你的项目名.vercel.app`

6. 点击 **Deploy**
7. 等待 2-3 分钟 ⏳
8. 看到 "Congratulations!" 🎉

### Step 3: 测试你的网站

访问：`https://你的项目名.vercel.app`

测试流程：
1. 注册账号
2. 添加孩子信息
3. 浏览菜单
4. 添加商品到购物车
5. 提交订单
6. 使用测试卡号支付：`4242 4242 4242 4242`
7. 查看订单历史

**全部通过？恭喜！测试环境上线成功！** ✨

---

## 🔗 配置 Webhook（10分钟）

### Step 1: 创建 Webhook

1. 访问 Stripe Dashboard
2. **Developers** → **Webhooks** → **Add endpoint**
3. 输入URL：`https://你的项目名.vercel.app/api/stripe/webhook`
4. 选择事件：
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. 点击 **Add endpoint**
6. 复制 **Signing secret**（whsec_开头）

### Step 2: 添加到 Vercel

1. Vercel 项目 → **Settings** → **Environment Variables**
2. 添加：`STRIPE_WEBHOOK_SECRET` = `whsec_你复制的密钥`
3. **Deployments** → 点击最新部署 → **Redeploy**

**测试 Webhook：**
- 提交一个测试订单
- 关闭支付页面
- 过几秒钟查看订单状态
- 如果自动更新为 "Paid" → Webhook 工作正常！ ✅

---

## 🎊 正式上线（切换到生产环境）

⚠️ **仅在测试完全通过后执行**

### Step 1: Stripe 切换到 Live Mode

1. Stripe Dashboard 右上角
2. 从 "Test mode" 切换到 "Live mode"
3. 确保已完成：
   - 身份验证
   - 银行账户绑定

### Step 2: 获取生产密钥

**Developers** → **API keys**
- 复制 `Publishable key` (pk_live_...)
- 复制 `Secret key` (sk_live_...)

### Step 3: 更新 Vercel 环境变量

**Settings** → **Environment Variables**
- 更新 `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_你的密钥`
- 更新 `STRIPE_SECRET_KEY` → `sk_live_你的密钥`

### Step 4: 更新生产 Webhook

1. **Developers** → **Webhooks** → **Add endpoint**
2. URL：`https://你的项目名.vercel.app/api/stripe/webhook`
3. 选择同样的事件
4. 复制新的 Signing secret
5. 更新 Vercel 环境变量：`STRIPE_WEBHOOK_SECRET`

### Step 5: 重新部署

**Deployments** → **Redeploy**

---

## 🎉 上线了！

现在你的系统已经：
- ✅ 部署在 Vercel
- ✅ 连接到 Supabase 数据库
- ✅ 集成真实的 Stripe 支付
- ✅ Webhook 自动更新订单状态

---

## 📊 监控和维护

### 每天检查：
1. **Vercel Dashboard**
   - Deployments → Function Logs
   - 查看是否有错误

2. **Stripe Dashboard**
   - Payments → 查看支付记录
   - Balance → 查看余额

3. **Supabase Dashboard**
   - Table Editor → 查看订单
   - Logs → 监控数据库查询

---

## 🐛 遇到问题？

### 常见问题快速排查：

**页面空白/404？**
→ 检查 Vercel Function Logs

**支付失败？**
→ 检查 Stripe Dashboard Logs

**订单状态不更新？**
→ 检查 Webhook 配置和 Secret

**数据库错误？**
→ 检查 Supabase 连接和 RLS 策略

---

## 🎯 下一步

现在可以：
1. 绑定自定义域名（可选）
2. 添加邮件通知（推荐）
3. 完善管理后台统计
4. 邀请真实用户测试！

---

## 📞 需要帮助？

如果遇到任何问题，告诉我：
1. 错误信息截图
2. Vercel/Stripe 日志
3. 你在哪一步遇到问题

我会帮你解决！💪

---

**祝部署顺利！🚀**
