# 🚀 部署指南

## 准备工作清单

### ✅ 你需要准备的账号

1. **Vercel 账号**（部署平台）
   - 访问：https://vercel.com
   - 使用 GitHub 账号登录

2. **Supabase 项目**（已有）
   - 生产环境数据库已就绪

3. **Stripe 账号**（已有）
   - 需要切换到生产模式

---

## 📋 部署步骤

### Step 1: 检查环境变量

确保你有以下所有环境变量：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (测试环境)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# Stripe (生产环境) - 上线后切换
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
# STRIPE_SECRET_KEY=sk_live_xxxxx

# 应用URL (本地测试)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 应用URL (部署后会改成你的域名)
# NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

### Step 2: 推送代码到 GitHub

```bash
# 1. 确保所有改动已提交
git add .
git commit -m "Ready for deployment"

# 2. 推送到 GitHub
git push origin main
```

---

### Step 3: 在 Vercel 部署

#### 3.1 连接 GitHub 仓库

1. 访问 https://vercel.com/new
2. 点击 "Import Git Repository"
3. 选择你的 GitHub 仓库：`mcot-ordering/cais-lunch-preorder`
4. 点击 "Import"

#### 3.2 配置项目

**Framework Preset:** Next.js（自动检测）
**Root Directory:** `./`
**Build Command:** `npm run build`
**Output Directory:** `.next`

#### 3.3 配置环境变量

在 Vercel 项目设置中添加所有环境变量：

```
Settings → Environment Variables
```

逐个添加：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`（先用测试的）
- `STRIPE_SECRET_KEY`（先用测试的）
- `NEXT_PUBLIC_APP_URL`（填：`https://your-project.vercel.app`）

**重要：** 暂时先用 Stripe 测试密钥，等测试完成后再换成生产密钥。

#### 3.4 部署

1. 点击 "Deploy"
2. 等待 2-3 分钟
3. 看到 "Congratulations!" 表示成功 🎉

---

### Step 4: 测试部署的应用

#### 4.1 访问你的网站

```
https://your-project-name.vercel.app
```

#### 4.2 测试流程

1. **注册/登录** ✅
2. **添加孩子信息** ✅
3. **浏览菜单** ✅
4. **添加商品到购物车** ✅
5. **查看购物车显示税费** ✅
6. **提交订单** ✅
7. **跳转到 Stripe 支付页面** ✅
8. **使用测试卡号完成支付** ✅
   ```
   4242 4242 4242 4242
   到期：12/34
   CVC：123
   ```
9. **返回订单页面，看到订单** ✅
10. **管理员后台查看订单** ✅

如果以上全部通过 → **测试环境部署成功！** ✨

---

### Step 5: 配置 Stripe Webhook

Webhook 确保即使用户关闭浏览器，支付状态也能正确更新。

#### 5.1 获取你的 Vercel 域名

```
https://your-project.vercel.app
```

#### 5.2 在 Stripe 添加 Webhook

1. 访问 Stripe Dashboard
2. Developers → Webhooks
3. 点击 "Add endpoint"
4. 输入 Webhook URL：
   ```
   https://your-project.vercel.app/api/stripe/webhook
   ```
5. 选择事件：
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
6. 点击 "Add endpoint"
7. 复制 "Signing secret"（whsec_xxxxx）

#### 5.3 添加 Webhook Secret 到 Vercel

1. Vercel 项目 → Settings → Environment Variables
2. 添加：
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```
3. 重新部署（Deployments → 点击最新部署 → Redeploy）

---

### Step 6: 创建 Webhook 处理端点

我会帮你创建这个文件。

---

### Step 7: 切换到 Stripe 生产模式（正式上线）

⚠️ **仅在测试完全通过后执行**

#### 7.1 在 Stripe Dashboard 切换到 Live Mode

1. 点击右上角 "Test mode" 切换到 "Live mode"
2. 确保已完成身份验证和银行账户绑定

#### 7.2 获取生产环境密钥

Developers → API keys
- 复制 `Publishable key` (pk_live_...)
- 复制 `Secret key` (sk_live_...)

#### 7.3 更新 Vercel 环境变量

Settings → Environment Variables
- 更新 `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_xxxxx`
- 更新 `STRIPE_SECRET_KEY` → `sk_live_xxxxx`

#### 7.4 更新 Webhook

1. Stripe Dashboard → Webhooks
2. 为生产环境添加新的 webhook endpoint
3. 更新 `STRIPE_WEBHOOK_SECRET`

#### 7.5 重新部署

Vercel → Deployments → Redeploy

---

## 🎉 上线后

### 监控和维护

1. **查看 Vercel 日志**
   - Deployments → 点击部署 → Function Logs
   - 监控错误和性能

2. **查看 Stripe Dashboard**
   - Payments → 查看真实支付
   - Balance → 查看余额和转账

3. **查看 Supabase Dashboard**
   - Table Editor → 查看订单数据
   - Logs → 查看数据库查询

---

## 🔒 安全检查清单

在正式上线前确认：

- [ ] 所有环境变量已正确配置
- [ ] Stripe 使用生产密钥
- [ ] Supabase RLS（行级安全）已启用
- [ ] API 路由有权限验证
- [ ] 敏感信息不在客户端暴露
- [ ] HTTPS 连接（Vercel 自动提供）

---

## 🐛 常见问题

### Q: 部署后页面空白？
A: 检查 Vercel 日志，通常是环境变量未配置

### Q: 支付跳转失败？
A: 检查 `NEXT_PUBLIC_APP_URL` 是否正确

### Q: Webhook 不工作？
A: 检查 `STRIPE_WEBHOOK_SECRET` 是否添加

### Q: 数据库连接失败？
A: 检查 Supabase URL 和密钥是否正确

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 Vercel Function Logs
2. 查看 Stripe Dashboard Logs
3. 查看浏览器 Console
4. 告诉我错误信息，我来帮你！

---

## 🎊 下一步

部署成功后，你可以：
1. 绑定自定义域名
2. 添加邮件通知功能
3. 完善管理后台统计
4. 添加更多功能

祝部署顺利！🚀
