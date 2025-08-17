#!/bin/bash

echo "🔍 NeoAI 代码质量检查报告"
echo "=================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 计数器
ISSUES=0
WARNINGS=0
SUGGESTIONS=0

echo -e "${BLUE}📁 项目结构检查${NC}"
echo "------------------"

# 检查必要文件
required_files=(
    "src/worker/index.js"
    "config/wrangler.toml"
    "package.json"
    "README.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file 存在"
    else
        echo -e "${RED}❌${NC} $file 缺失"
        ((ISSUES++))
    fi
done

echo ""
echo -e "${BLUE}📊 代码统计${NC}"
echo "------------------"

# 统计代码行数
if [ -f "src/worker/index.js" ]; then
    total_lines=$(wc -l < src/worker/index.js)
    echo "• Worker 代码总行数: $total_lines"
    
    # 检查文件大小
    file_size=$(du -k src/worker/index.js | cut -f1)
    echo "• Worker 文件大小: ${file_size}KB"
    
    if [ $file_size -gt 100 ]; then
        echo -e "${YELLOW}⚠️${NC}  文件较大，考虑拆分模块"
        ((WARNINGS++))
    fi
fi

echo ""
echo -e "${BLUE}🔒 安全检查${NC}"
echo "------------------"

# 检查是否存在敏感信息 (排除更多误报)
sensitive_files=$(grep -r -i "password\|secret\|api[_-]key" src/ --exclude-dir=node_modules 2>/dev/null | \
  grep -v "@keyframes\|maxTokens\|max_tokens\|keydown\|Object.keys\|keyCode" | \
  grep -v "MAX_TOKEN_LENGTH\|INPUT_RULES" | \
  grep -v "// 检查\|检查.*key\|token.*参数\|key.*参数" | \
  grep -v "css.*key\|animation.*key\|style.*key" | \
  grep -v "env\.AUTORAG_API_KEY\|apiKey.*env\|const.*apiKey.*env" | \
  grep -v "AUTORAG_API_KEY.*环境变量")

if [ -n "$sensitive_files" ]; then
    echo -e "${RED}❌${NC} 发现可能的敏感信息:"
    echo "$sensitive_files"
    ((ISSUES++))
else
    echo -e "${GREEN}✅${NC} 未发现敏感信息泄露"
fi

# 检查CORS配置
if grep -q "Access-Control-Allow-Origin.*\\*" src/worker/index.js; then
    echo -e "${YELLOW}⚠️${NC}  CORS配置为 * (所有域名)，生产环境建议限制"
    ((WARNINGS++))
fi

echo ""
echo -e "${BLUE}⚡ 性能检查${NC}"
echo "------------------"

# 检查是否有缓存配置
if grep -q "Cache-Control" src/worker/index.js; then
    echo -e "${GREEN}✅${NC} 发现缓存配置"
else
    echo -e "${YELLOW}⚠️${NC}  建议添加适当的缓存配置"
    ((SUGGESTIONS++))
fi

# 检查错误处理 (改进检测)
error_handling_patterns=$(grep -c "try\|catch\|throw\|Error(" src/worker/index.js 2>/dev/null || echo 0)
if [ $error_handling_patterns -gt 5 ]; then
    echo -e "${GREEN}✅${NC} 发现错误处理机制 ($error_handling_patterns 个模式)"
else
    echo -e "${YELLOW}⚠️${NC}  建议增强错误处理机制 (当前 $error_handling_patterns 个)"
    ((SUGGESTIONS++))
fi

echo ""
echo -e "${BLUE}📝 代码质量${NC}"
echo "------------------"

# 检查注释
comment_lines=$(grep -c "^[[:space:]]*\/\/" src/worker/index.js 2>/dev/null || echo 0)
if [ $comment_lines -gt 10 ]; then
    echo -e "${GREEN}✅${NC} 代码注释充足 ($comment_lines 行)"
else
    echo -e "${YELLOW}⚠️${NC}  建议增加代码注释 (当前 $comment_lines 行)"
    ((SUGGESTIONS++))
fi

# 检查函数长度
long_functions=$(awk '/^[[:space:]]*function|^[[:space:]]*async function/ {start=NR} /^[[:space:]]*}/ {if(NR-start > 50) print "Line " start ": Function too long (" NR-start " lines)"}' src/worker/index.js 2>/dev/null)
if [ -n "$long_functions" ]; then
    echo -e "${YELLOW}⚠️${NC}  发现长函数，建议拆分:"
    echo "$long_functions"
    ((WARNINGS++))
fi

echo ""
echo -e "${BLUE}🌐 部署配置检查${NC}"
echo "------------------"

# 检查wrangler.toml
if [ -f "config/wrangler.toml" ]; then
    if grep -q "name.*neoai" config/wrangler.toml; then
        echo -e "${GREEN}✅${NC} Worker名称配置正确"
    else
        echo -e "${RED}❌${NC} Worker名称配置可能有误"
        ((ISSUES++))
    fi
    
    if grep -q "\[ai\]" config/wrangler.toml; then
        echo -e "${GREEN}✅${NC} AI绑定配置存在"
    else
        echo -e "${YELLOW}⚠️${NC}  AI绑定配置可能缺失"
        ((WARNINGS++))
    fi
fi

echo ""
echo -e "${BLUE}📋 总结${NC}"
echo "------------------"

echo -e "🔴 严重问题: ${RED}$ISSUES${NC}"
echo -e "🟡 警告: ${YELLOW}$WARNINGS${NC}" 
echo -e "💡 建议: ${BLUE}$SUGGESTIONS${NC}"

echo ""

if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 代码质量良好！${NC}"
    exit 0
elif [ $ISSUES -eq 0 ]; then
    echo -e "${YELLOW}✨ 代码基本符合标准，有一些改进建议${NC}"
    exit 0
else
    echo -e "${RED}🚨 发现严重问题，建议修复后再部署${NC}"
    exit 1
fi
