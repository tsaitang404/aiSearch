# 自动部署配置指南

## 概述

本项目已配置GitHub Actions自动部署功能，当推送`v0.1.xxx`版本标签时，会自动部署到Cloudflare Worker。

## 🚀 快速开始

### 1. 配置GitHub Secrets

在GitHub仓库设置中添加以下Secrets：

- `CLOUDFLARE_API_TOKEN`: Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Account ID

详细获取方式请参考 [配置文档](.github/README.md)。

### 2. 发布新版本

使用内置的发布脚本：

```bash
# 交互式发布
npm run release

# 或者手动创建标签
git tag v0.1.0
git push origin v0.1.0
```

### 3. 监控部署

- 查看GitHub Actions: [Actions页面](../../actions)
- 部署完成后访问: https://neoai.tsaitang.workers.dev

## 📋 部署流程

当你推送`v0.1.xxx`标签后，会自动执行：

1. ✅ **代码检出** - 获取标签对应的代码
2. ✅ **环境设置** - 安装Node.js 18和依赖
3. ✅ **配置验证** - 检查wrangler配置
4. ✅ **代码检查** - 运行基础验证
5. ✅ **自动部署** - 部署到Cloudflare Worker
6. ✅ **状态检查** - 验证部署是否成功

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 验证配置
npm run validate

# 手动部署（可选）
npm run deploy
```

## 📊 版本管理

### 版本格式
- 格式: `v0.1.x`
- 示例: `v0.1.0`, `v0.1.1`, `v0.1.2`

### 发布流程
1. 完成代码开发和测试
2. 提交并推送到主分支
3. 运行 `npm run release` 创建版本标签
4. GitHub Actions自动部署到Cloudflare Worker

### 版本历史
```bash
# 查看已发布的版本
git tag -l "v0.1.*" | sort -V

# 查看最新版本
git describe --tags --abbrev=0
```

## 🔧 故障排除

### 常见问题

1. **部署失败**
   - 检查Secrets是否正确配置
   - 查看Actions日志获取详细错误信息
   - 确保wrangler配置正确

2. **Worker无法访问**
   - 部署后等待1-2分钟让变更生效
   - 检查Cloudflare Dashboard中Worker状态
   - 确认域名配置正确

3. **权限问题**
   - 确保API Token有足够权限
   - 检查Account ID是否正确

### 调试命令

```bash
# 检查Worker状态
npm run status

# 查看实时日志
npm run logs

# 获取Worker URL
npm run get-worker-url

# 验证配置文件
npm run validate
```

## 📝 配置文件说明

- `.github/workflows/deploy.yml` - GitHub Actions工作流
- `.github/scripts/get-worker-url-ci.sh` - CI专用URL获取脚本
- `scripts/release.sh` - 版本发布脚本
- `config/wrangler.toml` - Cloudflare Worker配置

## 🔐 安全注意事项

### GitHub Secrets 安全性保障

✅ **加密存储**: Secrets在GitHub服务器上使用工业级标准加密算法存储  
✅ **访问控制**: 只有仓库管理员和具有写权限的用户才能查看/修改  
✅ **自动脱敏**: 在所有日志和输出中，Secrets值会自动显示为`***`  
✅ **隔离运行**: 只在Actions安全环境中可用，不会泄漏到PR或fork  
✅ **不可导出**: 无法通过任何方式在Actions中打印或导出Secrets值  

### 最佳实践

- API Token只授予必要的最小权限
- 不要在代码中硬编码任何敏感信息
- 定期轮换API Token（建议每6个月）
- 监控Worker的使用情况和日志
- 定期检查GitHub仓库的访问权限

### Secrets配置验证

配置完成后，可以通过以下方式验证：

```bash
# 创建测试标签触发部署
git tag v0.1.0-test
git push origin v0.1.0-test

# 在Actions日志中应该看到：
# ✅ Secrets正确加载（不会显示实际值）
# ✅ Wrangler认证成功
# ✅ Worker部署成功
```

## 📞 获取帮助

如果遇到问题：

1. 查看 [GitHub Actions日志](../../actions)
2. 检查 [Cloudflare Dashboard](https://dash.cloudflare.com)
3. 参考 [Wrangler文档](https://developers.cloudflare.com/workers/wrangler/)
4. 查看项目Issues
