#!/bin/bash

# 自动创建和推送v0.1.x版本标签的脚本

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 NeoAI 版本发布脚本${NC}"
echo ""

# 检查是否在git仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ 当前目录不是Git仓库${NC}"
    exit 1
fi

# 检查工作区是否干净
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  工作区有未提交的更改：${NC}"
    git status --short
    echo ""
    read -p "是否继续？(y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "操作已取消"
        exit 1
    fi
fi

# 获取当前的v0.1.x标签
CURRENT_TAGS=$(git tag -l "v0.1.*" | sort -V | tail -5)
echo -e "${YELLOW}📋 最近的v0.1.x标签：${NC}"
if [ -z "$CURRENT_TAGS" ]; then
    echo "  (无)"
    NEXT_VERSION="v0.1.0"
else
    echo "$CURRENT_TAGS"
    echo ""
    
    # 获取最新标签并计算下一个版本
    LATEST_TAG=$(echo "$CURRENT_TAGS" | tail -1)
    LATEST_PATCH=$(echo "$LATEST_TAG" | sed 's/v0\.1\.//')
    NEXT_PATCH=$((LATEST_PATCH + 1))
    NEXT_VERSION="v0.1.${NEXT_PATCH}"
fi

echo ""
echo -e "${GREEN}🏷️  建议的下一个版本: ${NEXT_VERSION}${NC}"

# 询问版本号
echo ""
read -p "请输入版本号 (默认: ${NEXT_VERSION}): " -r VERSION
if [ -z "$VERSION" ]; then
    VERSION=$NEXT_VERSION
fi

# 验证版本号格式
if [[ ! $VERSION =~ ^v0\.1\.[0-9]+$ ]]; then
    echo -e "${RED}❌ 版本号格式不正确，应该是 v0.1.x 格式${NC}"
    exit 1
fi

# 检查标签是否已存在
if git rev-parse "$VERSION" >/dev/null 2>&1; then
    echo -e "${RED}❌ 标签 ${VERSION} 已存在${NC}"
    exit 1
fi

# 询问发布说明
echo ""
read -p "请输入发布说明 (可选): " -r RELEASE_NOTE
if [ -z "$RELEASE_NOTE" ]; then
    RELEASE_NOTE="Release ${VERSION}"
fi

# 确认信息
echo ""
echo -e "${YELLOW}📝 发布信息确认：${NC}"
echo "版本号: ${VERSION}"
echo "发布说明: ${RELEASE_NOTE}"
echo "当前分支: $(git branch --show-current)"
echo "当前提交: $(git rev-parse --short HEAD)"
echo ""

read -p "确认发布？这将触发自动部署到Cloudflare Worker (y/N): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "操作已取消"
    exit 1
fi

# 创建标签
echo ""
echo -e "${GREEN}🏷️  创建标签 ${VERSION}...${NC}"
if git tag -a "$VERSION" -m "$RELEASE_NOTE"; then
    echo -e "${GREEN}✅ 标签创建成功${NC}"
else
    echo -e "${RED}❌ 标签创建失败${NC}"
    exit 1
fi

# 推送标签
echo -e "${GREEN}📤 推送标签到远程仓库...${NC}"
if git push origin "$VERSION"; then
    echo -e "${GREEN}✅ 标签推送成功${NC}"
    echo ""
    echo -e "${GREEN}🎉 发布完成！${NC}"
    echo ""
    echo -e "${YELLOW}📋 接下来的步骤：${NC}"
    echo "1. 查看GitHub Actions部署状态: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:\/]//' | sed 's/\.git$//')/actions"
    echo "2. 部署完成后访问: https://neoai.tsaitang.workers.dev"
    echo "3. 监控Worker状态: npm run logs"
else
    echo -e "${RED}❌ 标签推送失败${NC}"
    echo -e "${YELLOW}💡 删除本地标签: git tag -d ${VERSION}${NC}"
    exit 1
fi
