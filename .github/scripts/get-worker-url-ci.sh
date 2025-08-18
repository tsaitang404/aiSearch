#!/bin/bash

# GitHub Actions专用的Worker URL获取脚本
echo "🔍 获取Cloudflare Worker部署信息..."

# Worker配置
WORKER_NAME="neoai"
WORKER_DOMAIN="tsaitang.workers.dev"
WORKER_URL="https://${WORKER_NAME}.${WORKER_DOMAIN}"

echo "📋 Worker配置信息："
echo "Worker名称: ${WORKER_NAME}"
echo "Worker URL: ${WORKER_URL}"

# 检查环境变量
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "⚠️  CLOUDFLARE_API_TOKEN 环境变量未设置"
    echo "🌐 预期Worker URL: ${WORKER_URL}"
    exit 0
fi

# 等待一段时间让部署完成
echo "⏳ 等待部署完成..."
sleep 10

# 测试Worker是否响应
echo "🧪 测试Worker连接..."
for i in {1..5}; do
    if curl -s -f -m 10 "${WORKER_URL}" > /dev/null; then
        echo "✅ Worker部署成功并响应正常"
        echo "🌐 前端页面: ${WORKER_URL}"
        echo "🔧 API接口: ${WORKER_URL}/api"
        echo "📊 版本: ${GITHUB_REF_NAME:-未知}"
        exit 0
    else
        echo "⏳ 第${i}次尝试，Worker可能还在部署中..."
        sleep 5
    fi
done

echo "⚠️  Worker部署可能需要更多时间，或配置有误"
echo "🌐 预期URL: ${WORKER_URL}"
echo "💡 请稍后手动检查部署状态"
