# NeoAI 智能搜索应用

这个项目提供了一个完整的解决方案，基于Cloudflare Worker的单一架构，同时提供前端页面和AI搜索API服务。

## 项目结构

```
.
├── src/
│   └── worker/         # Cloudflare Worker 代码
│       └── index.js    # Worker 入口文件 (包含前端和API)
├── config/             # 配置文件
│   └── wrangler.toml   # Cloudflare Wrangler配置
├── tools/              # 开发工具和脚本
├── docs/               # 项目文档
├── package.json        # 项目依赖和脚本
└── README.md           # 项目说明文档
```

## 架构特点

🚀 **单Worker架构**
- 一个Worker同时处理前端页面服务和API请求
- 前端访问: `https://neoai.tsaitang.workers.dev`
- API接口: `https://neoai.tsaitang.workers.dev/api`
- 简化部署和维护

## 前提条件

1. 您需要一个Cloudflare账户
2. 已创建的 NeoAI 应用，并配置了 AutoRAG 集成
3. 安装了Node.js和npm

## 设置步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境

Worker使用Cloudflare的AI绑定，无需额外配置API密钥。如果需要使用特定的AI服务，可以通过Wrangler Secrets配置。

## 本地开发

### 启动开发服务器

```bash
npm run dev
```

或使用启动脚本：

```bash
./dev-start.sh
```

开发服务器将在 http://localhost:8787 运行，同时提供：
- 前端页面: http://localhost:8787
- API接口: http://localhost:8787/api

## 部署到 Cloudflare

### 部署Worker

```bash
npm run deploy
```

部署后，您的应用将可以通过以下地址访问：
- https://neoai.tsaitang.workers.dev (前端页面)
- https://neoai.tsaitang.workers.dev/api (API接口)

## 使用说明

1. 访问部署的Worker URL (例如: https://neoai.tsaitang.workers.dev)
2. 在文本框中输入您的查询
3. 可以展开"高级选项"调整参数（如温度、最大令牌数等）
4. 点击"提交查询"按钮
5. 结果会显示在下方，包括AI生成的回答和参考来源

## 自定义和扩展

- Worker代码位于 `src/worker/index.js`，同时包含前端HTML和API逻辑
- 可以修改HTML模板中的CSS来自定义UI外观
- 可以添加额外的API路由和功能
- 可以在 `wrangler.toml` 中配置额外的Cloudflare资源（如KV存储等）

## 故障排除

- 如果API调用失败，检查浏览器控制台获取详细错误信息
- 确保Cloudflare Worker已正确部署且AI绑定配置正确
- 本地开发时，Worker开发服务器日志会显示在终端中

## 安全考虑

- Worker使用Cloudflare的AI绑定，无需额外的API密钥管理
- 考虑添加更多的请求验证和速率限制以保护您的服务
- 可以配置自定义域名以提供更专业的访问体验
