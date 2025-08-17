# 本地开发环境配置指南

## 快速启动

### 方法1: 分别启动服务 (推荐)

1. **启动 Worker 开发服务器**
```bash
npm run dev:worker
```
Worker 将运行在: http://localhost:8787

2. **在另一个终端启动 Pages 开发服务器**
```bash
npm run dev:pages  
```
Pages 将运行在: http://localhost:8788

3. **访问应用**
打开浏览器访问: http://localhost:8788

### 方法2: 使用启动脚本

```bash
npm start
# 或者
./dev-start.sh
```

然后在另一个终端运行:
```bash
npm run pages:dev
```

## 服务端口说明

- **Worker API**: http://localhost:8787
- **Pages 前端**: http://localhost:8788 (默认端口)

## 开发配置说明

### 当前配置状态

✅ **已配置项目:**
- 前端 API URL 已设置为本地 Worker 地址 (`http://localhost:8787`)
- Worker 包含模拟数据响应，用于本地测试
- 已添加 CORS 支持，允许前端调用 Worker API

### 需要配置的项目 (用于生产环境):

1. **AutoRAG API 配置**
   - 在 `src/worker/index.js` 中更新 `AUTO_RAG_API_URL`
   - 使用 `wrangler secret put API_KEY` 配置实际的 API 密钥

2. **生产环境 URL**
   - 部署后更新 `pages/app.js` 中的 `WORKER_API_URL`

## 测试说明

当前配置下，应用会返回模拟数据，包括:
- 示例回答文本
- 模拟的数据源列表

这允许你测试前端功能，无需真实的 AutoRAG API。

## 故障排除

### 常见问题

1. **端口冲突**
   - 如果 8787 或 8788 端口被占用，Wrangler 会自动选择其他端口
   - 检查终端输出的实际端口号

2. **CORS 错误**
   - Worker 已配置 CORS 头，应该不会有跨域问题
   - 如果遇到问题，检查浏览器开发者工具的网络选项卡

3. **API 连接失败**
   - 确保 Worker 和 Pages 服务都在运行
   - 检查前端代码中的 API URL 是否正确

### 调试技巧

1. **查看 Worker 日志**
   - Worker 开发服务器会在终端显示请求日志
   - 任何 `console.log` 输出都会显示在 Worker 终端

2. **浏览器开发者工具**
   - 打开 F12 开发者工具
   - 查看 Console 和 Network 选项卡
   - 检查 API 请求和响应

3. **修改代码热重载**
   - Worker 和 Pages 都支持代码修改后自动重载
   - 无需重启开发服务器

## 下一步

1. 启动开发环境测试基本功能
2. 根据需要修改 UI 样式和功能
3. 配置真实的 AutoRAG API 进行集成测试
4. 部署到 Cloudflare 进行生产环境测试
