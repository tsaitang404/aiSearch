#!/bin/bash

# Cloudflare API Token权限检查脚本

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Cloudflare API Token 权限检查${NC}"
echo ""

# 检查环境变量
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${RED}❌ 环境变量 CLOUDFLARE_API_TOKEN 未设置${NC}"
    echo -e "${YELLOW}请设置环境变量: export CLOUDFLARE_API_TOKEN=your_token${NC}"
    exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo -e "${RED}❌ 环境变量 CLOUDFLARE_ACCOUNT_ID 未设置${NC}"
    echo -e "${YELLOW}请设置环境变量: export CLOUDFLARE_ACCOUNT_ID=your_account_id${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 环境变量已设置${NC}"
echo ""

# 检查token是否有效
echo -e "${BLUE}📋 验证API Token...${NC}"
VERIFY_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json")

if echo "$VERIFY_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ API Token有效${NC}"
    
    # 提取token ID和状态
    TOKEN_ID=$(echo "$VERIFY_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    STATUS=$(echo "$VERIFY_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    echo "Token ID: ${TOKEN_ID:0:8}..."
    echo "状态: $STATUS"
else
    echo -e "${RED}❌ API Token无效或权限不足${NC}"
    echo "响应: $VERIFY_RESPONSE"
    exit 1
fi

echo ""

# 检查账户访问权限
echo -e "${BLUE}📋 验证账户访问权限...${NC}"
ACCOUNT_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json")

if echo "$ACCOUNT_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ 账户访问权限正常${NC}"
    ACCOUNT_NAME=$(echo "$ACCOUNT_RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    echo "账户名称: $ACCOUNT_NAME"
else
    echo -e "${RED}❌ 账户访问权限不足或Account ID错误${NC}"
    echo "响应: $ACCOUNT_RESPONSE"
    exit 1
fi

echo ""

# 检查Workers权限
echo -e "${BLUE}📋 验证Workers权限...${NC}"
WORKERS_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json")

if echo "$WORKERS_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Workers权限正常${NC}"
    WORKER_COUNT=$(echo "$WORKERS_RESPONSE" | grep -o '"name":"[^"]*"' | wc -l)
    echo "当前Workers数量: $WORKER_COUNT"
else
    echo -e "${RED}❌ Workers权限不足${NC}"
    echo "响应: $WORKERS_RESPONSE"
    echo ""
    echo -e "${YELLOW}💡 解决方案：${NC}"
    echo "1. 确保API Token有 'Cloudflare Workers:Edit' 权限"
    echo "2. 检查Token的Account Resources配置"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 所有权限检查通过！${NC}"
echo -e "${BLUE}📋 配置摘要：${NC}"
echo "- API Token: 有效且活跃"
echo "- 账户访问: 正常"
echo "- Workers权限: 正常"
echo ""
echo -e "${YELLOW}💡 接下来可以：${NC}"
echo "1. 将Token和Account ID配置到GitHub Secrets"
echo "2. 运行 npm run release 创建版本标签"
echo "3. 触发GitHub Actions自动部署"
