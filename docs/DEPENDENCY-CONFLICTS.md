# 依赖更新冲突解决指南

## 🚨 常见冲突类型及解决方案

### 1️⃣ 版本冲突 (Peer Dependency Conflicts)

#### 问题示例：
```
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! Could not resolve dependency:
npm ERR! peer react@"^18.0.0" from next@16.0.7
```

#### ✅ 解决方案：

**方案 A：使用 --legacy-peer-deps（临时方案）**
```bash
npm install --legacy-peer-deps
```

**方案 B：使用 --force（强制安装，有风险）**
```bash
npm install --force
```

**方案 C：更新到兼容版本（推荐）**
```bash
# 先检查哪个版本兼容
npm info <package-name> peerDependencies

# 然后安装兼容版本
npm install react@18 react-dom@18
```

---

### 2️⃣ 破坏性 API 变更

#### 问题：更新后代码报错

#### ✅ 解决步骤：

**Step 1: 查看 CHANGELOG**
```bash
# 在 npm 上查看更新日志
npm view <package-name> --json | grep repository

# 或访问 GitHub Release 页面
```

**Step 2: 使用代码迁移工具**
```bash
# Next.js 有官方迁移工具
npx @next/codemod <codemod-name>

# 常用的 Next.js codemods:
npx @next/codemod@latest upgrade
```

**Step 3: 渐进式更新**
```bash
# 先更新小版本
npm install next@16.0.latest

# 测试通过后再更新大版本
npm install next@latest
```

---

### 3️⃣ TypeScript 类型错误

#### 问题：更新后出现 TS 错误

#### ✅ 解决方案：

```bash
# 1. 更新类型定义
npm update @types/react @types/react-dom @types/node

# 2. 清理 TypeScript 缓存
rm -rf .next
rm -rf node_modules/.cache

# 3. 重新构建
npm run build
```

---

### 4️⃣ package-lock.json 冲突

#### 问题：Git 合并时 package-lock.json 冲突

#### ✅ 解决方案：

**方案 A：接受远程版本并重新安装**
```bash
# 1. 接受远程版本
git checkout --theirs package-lock.json

# 2. 重新安装
rm -rf node_modules
npm install
```

**方案 B：完全重新生成**
```bash
# 1. 删除 lock 文件
rm package-lock.json

# 2. 清理 node_modules
rm -rf node_modules

# 3. 重新安装
npm install

# 4. 提交新的 lock 文件
git add package-lock.json
git commit -m "chore: regenerate package-lock.json"
```

---

### 5️⃣ 更新后应用无法启动

#### ✅ 紧急回滚方案：

```bash
# 方案 A: Git 回滚（如果已提交）
git checkout HEAD~1 package.json package-lock.json
npm install

# 方案 B: Git stash（如果未提交）
git checkout package.json package-lock.json
npm install

# 方案 C: 手动回滚到具体版本
npm install <package-name>@<old-version>
```

---

## 🛡️ 预防冲突的最佳实践

### 1. 更新前的检查清单
```bash
# ✅ 1. 确保代码已提交
git status

# ✅ 2. 创建备份分支
git checkout -b update-dependencies

# ✅ 3. 记录当前版本
npm list --depth=0 > versions-before.txt

# ✅ 4. 运行测试
npm test

# ✅ 5. 然后才开始更新
npm update
```

### 2. 安全的更新流程
```bash
#!/bin/bash
# 安全更新脚本

echo "🔍 Step 1: 检查当前状态"
git status

echo "📝 Step 2: 备份当前版本信息"
npm list --depth=0 > versions-before.txt

echo "🌿 Step 3: 创建更新分支"
git checkout -b deps/update-$(date +%Y%m%d)

echo "🔄 Step 4: 更新依赖"
npm update

echo "🧪 Step 5: 运行测试"
npm run build
npm run dev &
sleep 5
kill %1

echo "✅ Step 6: 如果一切正常，提交更改"
git add .
git commit -m "chore: update dependencies"

echo "📊 Step 7: 查看更新内容"
npm list --depth=0 > versions-after.txt
diff versions-before.txt versions-after.txt
```

### 3. 使用 package.json 版本锁定

```json
{
  "dependencies": {
    "next": "16.0.7",           // ❌ 锁死版本（不更新）
    "next": "^16.0.7",          // ✅ 允许小版本更新（16.0.x）
    "next": "~16.0.7",          // ⚠️ 只允许补丁更新（16.0.7）
    "next": ">=16.0.7 <17.0.0"  // 📌 范围控制
  }
}
```

---

## 🔧 调试工具

### 查看依赖树
```bash
# 查看完整依赖树
npm list

# 查看特定包的依赖
npm list <package-name>

# 查看哪个包依赖了某个包
npm ls <package-name>
```

### 清理缓存
```bash
# 清理 npm 缓存
npm cache clean --force

# 清理 Next.js 缓存
rm -rf .next

# 完全重置
rm -rf node_modules package-lock.json .next
npm install
```

---

## 📞 求助资源

1. **查看包的 GitHub Issues**
   ```bash
   npm repo <package-name>
   ```

2. **查看包的文档**
   ```bash
   npm docs <package-name>
   ```

3. **社区讨论**
   - Stack Overflow
   - GitHub Discussions
   - Discord/Slack 社区

---

## 🎯 快速决策树

```
更新后出现问题？
    │
    ├─ 能快速找到解决方案？
    │   ├─ 是 → 修复并继续
    │   └─ 否 → ↓
    │
    ├─ 问题影响开发吗？
    │   ├─ 是 → 回滚 (git checkout)
    │   └─ 否 → ↓
    │
    └─ 有时间调试吗？
        ├─ 是 → 查 CHANGELOG + GitHub Issues
        └─ 否 → 回滚，稍后处理
```

---

## 💡 记住这些命令

```bash
# 紧急回滚
git checkout package.json package-lock.json && npm install

# 完全重置
rm -rf node_modules package-lock.json && npm install

# 查看变更
git diff package.json

# 只更新安全补丁
npm audit fix

# 测试构建
npm run build
```
