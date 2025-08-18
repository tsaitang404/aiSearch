#!/bin/bash

# GitHub Secrets 配置验证脚本

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 GitHub Secrets 配置验证${NC}"
echo ""

# 检查是否在git仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ 当前目录不是Git仓库${NC}"
    exit 1
fi

# 获取仓库信息
REPO_URL=$(git remote get-url origin 2>/dev/null)
if [ -n "$REPO_URL" ]; then
    REPO_PATH=$(echo "$REPO_URL" | sed 's/.*github.com[:\/]//' | sed 's/\.git$//')
    echo -e "${GREEN}📋 仓库信息${NC}"
    echo "仓库: $REPO_PATH"
    echo "配置URL: https://github.com/$REPO_PATH/settings/secrets/actions"
    echo ""
fi

echo -e "${YELLOW}🛡️  需要配置的 Secrets:${NC}"
echo ""

echo -e "${GREEN}1. CLOUDFLARE_API_TOKEN${NC}"
echo "   📍 获取位置: https://dash.cloudflare.com/profile/api-tokens"
echo "   🔧 权限需求: Cloudflare Workers:Edit"
echo "   💡 建议: 创建专用Token，只授予Workers权限"
echo ""

echo -e "${GREEN}2. CLOUDFLARE_ACCOUNT_ID${NC}"
echo "   📍 获取位置: Cloudflare Dashboard 右侧边栏"
echo "   🔧 格式: 32位字符串 (例如: a1b2c3d4e5f6...)"
echo "   💡 提示: 在任意Cloudflare页面右侧都能找到"
echo ""

echo -e "${BLUE}📋 配置步骤:${NC}"
echo "1. 打开仓库设置: https://github.com/$REPO_PATH/settings/secrets/actions"
echo "2. 点击 'New repository secret'"
echo "3. 分别添加上述两个 Secrets"
echo "4. 测试部署: git tag v0.1.0-test && git push origin v0.1.0-test"
echo ""

echo -e "${YELLOW}🔒 安全提醒:${NC}"
echo "✅ Secrets 在 GitHub 服务器上加密存储"
echo "✅ 只有仓库管理员可以查看和修改"
echo "✅ 在 Actions 日志中自动脱敏显示为 ***"
echo "✅ 不会泄漏到 Pull Requests 或 Forks"
echo "✅ 只在安全的 Actions 环境中可用"
echo ""

echo -e "${GREEN}🧪 测试配置是否正确:${NC}"
echo "配置完成后，运行以下命令测试:"
echo ""
echo -e "${BLUE}npm run release${NC}  # 创建并推送版本标签"
echo "或手动创建标签:"
echo -e "${BLUE}git tag v1.0.0 && git push origin v1.0.0${NC}"
echo "然后查看 GitHub Actions 页面确认部署成功"
echo ""

echo -e "${YELLOW}🚨 注意事项:${NC}"
echo "- 不要将 API Token 提交到代码中"
echo "- 定期轮换 API Token (建议6个月)"
echo "- 监控 Worker 使用情况"
echo "- 如果泄漏，立即在 Cloudflare 中撤销 Token"
