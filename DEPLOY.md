# Cloudflare 单Worker部署指南

## 🚀 部署检查清单

### 准备工作
- [ ] 已安装 Wrangler CLI: `npm install -g wrangler`
- [ ] 已登录 Cloudflare: `wrangler login`
- [ ] 有 Cloudflare 账户（域名可选）

### 单Worker 部署

1. **部署 Worker（包含前端+API）**
   ```bash
   npm run deploy
   ```

2. **记录 Worker URL**
   部署后访问地址：`https://neoai.tsaitang.workers.dev`
   - 前端页面：`https://neoai.tsaitang.workers.dev/`
   - API接口：`https://neoai.tsaitang.workers.dev/api`

## 📁 单Worker项目结构

```
/
├── src/worker/index.js     # 单Worker代码（前端+API）
├── pages/                  # 原始前端文件（仅供参考）
├── wrangler.toml          # Worker 配置
└── package.json           # 项目配置
```

## 🔧 配置选项

### AI服务配置
Worker使用Cloudflare AI绑定，配置在 `wrangler.toml` 中：
```toml
[ai]
binding = "AI"
```

### 自定义域名（可选）
在 Cloudflare Dashboard 中配置自定义域名：
1. 进入 Workers & Pages
2. 选择您的Worker
3. 点击 Custom domains
4. 添加您的域名

### 环境变量（如需要）
使用 Wrangler 添加秘密变量：
```bash
wrangler secret put VARIABLE_NAME
```

## 🔍 故障排除

### 常见问题

1. **Worker 部署失败**
   - 检查 `wrangler.toml` 配置
   - 确认已登录：`wrangler whoami`
   - 验证AI绑定配置正确

2. **前端页面空白**
   - 检查Worker日志：`wrangler tail`
   - 验证HTML内容正确嵌入

3. **API 请求失败**
   - 检查浏览器开发者工具网络选项卡
   - 验证CORS头配置
   - 检查Worker日志中的错误信息

### 调试命令
```bash
# 查看实时日志
wrangler tail

# 本地测试
npm run dev

# 检查部署状态
wrangler list
```

## 🌟 单Worker架构优势

- ✅ **简化部署**: 一个命令部署完整应用
- ✅ **无跨域问题**: 前端和API使用相同域名
- ✅ **统一管理**: 所有代码在一个文件中
- ✅ **降低延迟**: 减少网络请求跳转
- ✅ **成本优化**: 只使用一个Worker资源
