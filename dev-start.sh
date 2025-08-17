#!/bin/bash

echo "🚀 启动 AutoRAG 本地开发环境"
echo ""

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖包..."
    npm install
fi

echo "🔧 启动 Cloudflare Worker 开发服务器..."
echo "Worker 将运行在: http://localhost:8787"
echo ""
echo "📝 使用以下命令在另一个终端启动 Pages 开发服务器:"
echo "npm run pages:dev"
echo ""
echo "🌐 Pages 将运行在: http://localhost:8788"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev
