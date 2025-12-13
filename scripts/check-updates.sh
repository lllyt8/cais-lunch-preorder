#!/bin/bash

# 依赖更新检查脚本
# 使用方法: ./scripts/check-updates.sh

echo "🔍 检查依赖更新..."
echo ""

# 检查是否安装了 npm-check-updates
if ! command -v ncu &> /dev/null; then
    echo "📥 安装 npm-check-updates..."
    npm install -g npm-check-updates
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 过时的依赖包："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ncu

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 安全漏洞检查："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm audit

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 详细信息："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm outdated --long

echo ""
echo "✅ 检查完成！"
echo ""
echo "💡 下一步操作："
echo "   • 小版本更新: npm update"
echo "   • 大版本更新: ncu -u && npm install"
echo "   • 安全修复: npm audit fix"
