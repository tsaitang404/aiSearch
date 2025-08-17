# Cloudflare 部署配置指南

## 🚀 部署检查清单

### 准备工作
- [ ] 已安装 Wrangler CLI: `npm install -g wrangler`
- [ ] 已登录 Cloudflare: `wrangler login`
- [ ] 有 Cloudflare 账户和域名（可选）

### Worker 部署
1. **配置 AutoRAG API**
   ```bash
   # 设置 API 密钥（安全）
   wrangler secret put API_KEY
   ```

2. **更新 src/worker/index.js**
   ```javascript
   const AUTO_RAG_API_URL = "https://your-actual-autorag-api-url";
   ```

3. **部署 Worker**
   ```bash
   npm run deploy:worker
   ```

4. **记录 Worker URL**
   部署后会显示类似：`https://autorag-worker.your-subdomain.workers.dev`

### Pages 部署

#### 方法1: Git 集成（推荐）
1. 推送代码到 Git 仓库
2. Cloudflare Dashboard > Workers & Pages > Create Application
3. Pages > Connect to Git
4. 选择仓库并配置：
   - Build command: （留空）
   - Build output directory: `pages`
   - Root directory: （留空）

#### 方法2: 直接部署
```bash
npm run pages:deploy
```

### 部署后配置
1. **更新前端 API URL**
   编辑 `pages/app.js`：
   ```javascript
   const WORKER_API_URL = "https://your-worker-url.workers.dev";
   ```

2. **重新部署 Pages**（如果需要）
   ```bash
   npm run pages:deploy
   ```

## 📁 项目结构说明

```
/
├── src/worker/index.js     # Worker 代码（API 后端）
├── pages/                  # Pages 文件（前端）
│   ├── index.html         # 主页面
│   ├── app.js             # 前端逻辑
│   ├── styles.css         # 样式
│   ├── _redirects         # 路由配置
│   └── _headers           # 安全头配置
├── wrangler.toml          # Worker 配置
└── package.json           # 项目配置
```

## 🔧 自定义配置

### 自定义域名
在 `wrangler.toml` 中配置：
```toml
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

### 环境变量
在 Cloudflare Dashboard 中设置或使用：
```bash
wrangler secret put VARIABLE_NAME
```

## 🔍 故障排除

### 常见问题
1. **Worker 部署失败**
   - 检查 `wrangler.toml` 配置
   - 确认已登录：`wrangler whoami`

2. **Pages 构建失败**
   - 确认 `pages/` 目录存在
   - 检查文件权限

3. **CORS 错误**
   - 检查 Worker 中的 CORS 头设置
   - 确认前端 API URL 正确

### 调试命令
```bash
# 查看 Worker 日志
wrangler tail

# 查看本地开发日志
npm run dev:worker
npm run dev:pages
```
