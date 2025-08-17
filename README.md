# AI Search 智能搜索应用

这个项目提供了一个完整的解决方案，用于通过Cloudflare Worker和Pages来访问和使用AI Search服务。

## 项目结构

```
.
├── src/
│   └── worker/         # Cloudflare Worker 代码
│       └── index.js    # Worker 入口文件
├── pages/              # Cloudflare Pages 前端代码
│   ├── index.html      # 主HTML页面
│   ├── styles.css      # CSS样式
│   └── app.js          # 前端JavaScript逻辑
├── wrangler.toml       # Cloudflare Wrangler配置
├── package.json        # 项目依赖和脚本
└── README.md           # 项目说明文档
```

## 前提条件

1. 您需要一个Cloudflare账户
2. 已创建的AI Search应用，并获取了API URL和密钥
3. 安装了Node.js和npm

## 设置步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境

在使用之前，您需要更新以下文件中的配置：

1. 在 `src/worker/index.js` 中:
   - 更新 `AI_SEARCH_API_URL` 为您的AI Search API地址
   - 使用Wrangler Secrets设置您的API密钥（见下文）

2. 在 `pages/app.js` 中:
   - 更新 `WORKER_API_URL` 为您的Cloudflare Worker部署地址

### 3. 配置API密钥（安全方式）

使用Wrangler CLI添加您的API密钥作为加密变量：

```bash
npx wrangler secret put API_KEY
```

系统会提示您输入密钥值。

## 本地开发

### 运行Worker开发服务器

```bash
npm run dev
```

### 运行Pages开发服务器

```bash
npm run pages:dev
```

## 部署到 Cloudflare

### 方法1: 使用 Git 仓库部署（推荐）

#### 1. Worker 部署
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages**
3. 点击 **Create Application** > **Create Worker**
4. 选择 **Deploy with Wrangler** 或直接使用命令：
   ```bash
   npm run deploy:worker
   ```

#### 2. Pages 部署
1. 在 Cloudflare Dashboard 进入 **Workers & Pages**
2. 点击 **Create Application** > **Pages** > **Connect to Git**
3. 连接您的 GitHub/GitLab 仓库
4. 配置构建设置：
   - **Build command**: 留空（静态文件）
   - **Build output directory**: `pages`
   - **Root directory**: 留空
5. 点击 **Save and Deploy**

#### 3. 配置环境变量
在 Worker 部署后，配置 API 密钥：
```bash
npx wrangler secret put API_KEY
```

#### 4. 更新前端配置
部署完成后，前端会自动检测环境并使用正确的API URL：
- 本地开发：`http://localhost:8787`
- 生产环境：`https://aisearch.tsaitang404.workers.dev`

如需手动配置，可编辑 `pages/app.js` 中的 `WORKER_API_URL`。

### 方法2: 手动部署

#### Worker 部署
```bash
npm run deploy:worker
```

#### Pages 部署
```bash
npm run pages:deploy
```

## 使用说明

1. 访问部署的Pages URL
2. 在文本框中输入您的查询
3. 可以展开"高级选项"调整参数
4. 点击"提交查询"按钮
5. 结果会显示在下方，包括回答和参考来源

## 自定义和扩展

- 修改 `pages/styles.css` 可以自定义UI外观
- 在 `src/worker/index.js` 中可以添加额外的API功能
- 可以在 `wrangler.toml` 中配置额外的Cloudflare资源（如KV存储等）

## 故障排除

- 如果API调用失败，请检查API密钥和URL配置
- 检查浏览器控制台以获取详细错误信息
- 确保Cloudflare Worker和Pages都已正确部署

## 安全考虑

- 永远不要在前端代码中包含API密钥
- 使用Wrangler Secrets存储敏感信息
- 考虑添加更多的请求验证和速率限制以保护您的API
