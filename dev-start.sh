#!/bin/bash

echo "🚀 启动 AutoRAG 本地开发环境"
echo ""

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖包..."
    npm install
fi

echo "🔧 启动 Cloudflare 开发服务器..."
echo "Worker 将运行在: http://localhost:8787"
echo "Pages 将运行在: http://localhost:8788"
echo ""
echo "启动 Worker 服务器..."

# 在后台启动Worker
npm run dev:worker &
WORKER_PID=$!

# 等待Worker启动
sleep 3

echo "启动 Pages 服务器..."
# 在前台启动Pages，这样可以看到日志并用Ctrl+C停止
npm run dev:pages &
PAGES_PID=$!

echo ""
echo "✅ 两个服务都已启动!"
echo "🌐 访问 http://localhost:8788 查看前端页面"
echo "🔧 Worker API: http://localhost:8787"
echo ""
echo "按 Ctrl+C 停止所有服务器"

# 设置陷阱来在脚本退出时杀死后台进程
trap 'echo ""; echo "🛑 正在停止服务器..."; kill $WORKER_PID $PAGES_PID 2>/dev/null; exit' INT TERM

# 等待两个进程
wait
