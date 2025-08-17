# AI Search 本地开发环境配置指南 - 单Worker架构

## 快速启动

### 方法1: 使用启动脚本 (推荐)

```bash
./dev-start.sh
```

这将启动单一Worker服务器，同时提供前端和API：
- 前端页面和API: http://localhost:8787

### 方法2: 直接启动服务

```bash
npm run dev
```

Worker 将运行在: http://localhost:8787，同时提供：
- 前端页面: http://localhost:8787/
- API接口: http://localhost:8787/api

## 服务架构说明

✅ **单Worker架构优势:**
- **简化部署**: 只需部署一个Worker
- **统一管理**: 前端和API在同一个文件中
- **无跨域问题**: 前端和API使用相同域名
- **便于维护**: 单一入口点，代码集中管理

## 开发配置说明

### 当前架构状态

✅ **单Worker架构配置:**
- 前端HTML、CSS、JS内嵌在Worker中 (`src/worker/index.js`)
- API路由处理在同一Worker中 (`/api`)
- 使用Cloudflare AI绑定，支持AutoRAG和标准LLM
- 已添加完整的CORS支持

### AI服务配置:

1. **AutoRAG集成**
   - 使用 `env.AI.autorag("jolly-water-bbff").aiSearch()` 调用
   - 自动降级到标准LLM模型作为备选
   
2. **模拟数据模式**
   - 当AI绑定不可用时，返回模拟响应
   - 便于开发测试和演示

## 测试说明

当前配置下，应用支持：
- **真实AI服务**: 如果配置了AI绑定，使用AutoRAG或LLM
- **模拟数据**: 如果未配置AI绑定，返回示例数据
- **完整前端功能**: 高级选项、错误处理、加载状态等

## 故障排除

### 常见问题

1. **端口冲突**
   - 如果 8787 端口被占用，Wrangler 会自动选择其他端口
   - 检查终端输出的实际端口号

2. **CORS 错误**
   - 单Worker架构无CORS问题，前端和API使用相同域名
   - 如果遇到问题，检查浏览器开发者工具的网络选项卡

3. **API 连接失败**
   - 确保Worker开发服务器正在运行
   - 检查浏览器控制台的错误信息

### 调试技巧

1. **查看 Worker 日志**
   - Worker 开发服务器会在终端显示所有请求日志
   - `console.log` 输出会显示在 Worker 终端

2. **浏览器开发者工具**
   - 打开 F12 开发者工具
   - 查看 Console 和 Network 选项卡
   - 检查前端页面和API请求

3. **代码热重载**
   - Worker支持代码修改后自动重载
   - 无需重启开发服务器

## 下一步

1. 启动开发环境: `npm run dev` 或 `./dev-start.sh`
2. 访问 http://localhost:8787 测试完整功能
3. 根据需要修改 `src/worker/index.js` 中的HTML、CSS或API逻辑
4. 使用 `npm run deploy` 部署到生产环境

## 工具脚本

### 获取Worker状态
```bash
npm run get-worker-url
```
显示当前Worker的部署状态和URL信息。

### 部署到生产环境
```bash
npm run deploy
```
一键部署单Worker到Cloudflare。
