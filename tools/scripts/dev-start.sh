#!/bin/bash

echo "🚀 启动 AI Search 本地开发环境 (单Worker架构)"
echo ""

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖包..."
    npm install
fi

echo "🔧 启动 Cloudflare Worker开发服务器..."
echo "Worker 将运行在: http://localhost:8787"
echo ""
echo "✅ 单Worker架构同时提供:"
echo "🌐 前端页面: http://localhost:8787"
echo "🔧 API接口: http://localhost:8787/api"
echo ""
echo "启动 Worker 服务器..."

# 启动Worker (前台运行，这样可以看到日志并用Ctrl+C停止)
npm run dev
