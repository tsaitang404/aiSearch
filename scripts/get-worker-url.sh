#!/bin/bash

# 获取Worker URL的脚本
echo "🔍 获取Cloudflare Worker部署信息..."

# 检查是否安装了wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ 未找到wrangler CLI，请先安装："
    echo "npm install -g wrangler"
    exit 1
fi

# 检查是否已登录
if ! wrangler whoami &> /dev/null; then
    echo "❌ 请先登录Cloudflare："
    echo "wrangler login"
    exit 1
fi

# 获取Worker信息
echo "📋 Worker配置信息："
echo "Worker名称: aisearch (单Worker架构)"
echo "预期URL: https://aisearch.tsaitang.workers.dev"

# 检查Worker是否存在
if wrangler list | grep -q "aisearch"; then
    echo "✅ Worker 'aisearch' 已部署"
    
    # 尝试测试连接
    echo "🧪 测试Worker连接..."
    if curl -s -f "https://aisearch.tsaitang.workers.dev" > /dev/null; then
        echo "✅ Worker响应正常"
        echo "🌐 前端页面: https://aisearch.tsaitang.workers.dev"
        echo "🔧 API接口: https://aisearch.tsaitang.workers.dev/api"
    else
        echo "⚠️  Worker可能尚未完全部署或配置有误"
    fi
else
    echo "⚠️  Worker 'aisearch' 尚未部署"
    echo "💡 使用以下命令部署："
    echo "npm run deploy"
fi

echo ""
echo "📝 单Worker架构说明："
echo "本地开发: http://localhost:8787 (前端+API)"
echo "生产环境: https://aisearch.tsaitang.workers.dev (前端+API)"
echo "✨ 一个Worker同时处理前端页面和API请求"
