# NeoAI - 智能对话应用

基于 Cloudflare Worker 的单一架构智能对话应用，集成 AutoRAG 服务和多种 LLM 模型。

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 本地开发
```bash
npm run dev
# 或使用启动脚本
./tools/scripts/dev-start.sh
```

访问：http://localhost:8787

### 部署到 Cloudflare
```bash
npm run deploy
```

部署后访问：https://neoai.tsaitang.workers.dev

## ✨ 功能特性

- 🤖 **智能对话**：集成多种 LLM 模型，支持自然语言对话
- 🔍 **AutoRAG 集成**：优先使用 AutoRAG 服务，提供更准确的回答
- 🎛️ **灵活配置**：可选择模型、调整温度、设置最大生成长度
- 🌍 **单 Worker 架构**：前端和 API 统一部署，无跨域问题
- 📱 **响应式设计**：完美支持桌面和移动设备

## 🏗️ 项目架构

```
neoai/
├── src/worker/index.js    # 单Worker代码（前端+API）
├── config/wrangler.toml   # Cloudflare配置
├── tools/scripts/         # 开发工具脚本
├── docs/                  # 项目文档
└── package.json          # 项目配置
```

## 📖 详细文档

- [开发指南](DEV_GUIDE.md) - 本地开发环境配置
- [部署指南](DEPLOY.md) - 生产环境部署说明
- [文档目录](docs/) - 完整文档集合

## 🔧 核心技术

- **Cloudflare Worker** - 边缘计算平台
- **AutoRAG** - 智能检索增强生成
- **Multiple LLM Models** - 支持多种大语言模型
- **Responsive UI** - 现代化响应式界面

## 🌟 特色优势

- ⚡ **极速响应**：基于 Cloudflare 边缘网络
- 🔒 **安全可靠**：使用 Cloudflare 安全防护
- 💰 **成本优化**：单 Worker 架构，降低资源消耗
- 🛠️ **易于维护**：统一代码管理，简化运维

## 📝 使用许可

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
