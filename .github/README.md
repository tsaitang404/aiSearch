# GitHub Actions 自动部署配置

## 概述

这个项目配置了GitHub Actions工作流，可以在推送任何`v*`版本标签时自动部署到Cloudflare Worker。

## 配置步骤

### 1. 在GitHub仓库中设置Secrets

在你的GitHub仓库中，需要配置以下Secrets：

1. 进入仓库设置 → Secrets and variables → Actions
2. 点击 "New repository secret" 添加以下密钥：

#### CLOUDFLARE_API_TOKEN
- **名称**: `CLOUDFLARE_API_TOKEN`
- **获取方式**: 
  1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
  2. 点击 "Create Token" → 选择 "Custom token"
  3. 配置权限：
     - **Account**: `Cloudflare Workers:Edit`
     - **Zone** (可选): `Zone:Read` (如果使用自定义域名)
  4. 复制生成的token

> 📋 **详细权限配置**: 查看 [API权限配置指南](../docs/CF_API_PERMISSIONS.md) 了解完整的权限配置说明

#### CLOUDFLARE_ACCOUNT_ID
- **名称**: `CLOUDFLARE_ACCOUNT_ID`
- **获取方式**:
  1. 登录 Cloudflare Dashboard
  2. 在右侧边栏找到 "Account ID"
  3. 复制该ID

### 2. 如何触发自动部署

自动部署会在推送符合`v*`格式的Git标签时触发：

```bash
# 创建并推送标签（支持任何版本格式）
git tag v1.0.0
git push origin v1.0.0

# 或者一行命令
git tag v2.1.3 && git push origin v2.1.3

# 支持预发布版本
git tag v1.0.0-beta.1 && git push origin v1.0.0-beta.1
```

### 3. 部署流程

当推送标签后，GitHub Actions会自动执行以下步骤：

1. **检出代码** - 获取标签对应的代码
2. **设置环境** - 安装Node.js 18
3. **安装依赖** - 运行`npm ci`
4. **验证配置** - 检查wrangler配置文件
5. **代码检查** - 运行基础的代码验证
6. **部署** - 使用`npm run deploy`部署到Cloudflare Worker
7. **获取URL** - 显示部署后的Worker URL

### 4. 监控部署状态

- 在GitHub仓库的"Actions"标签页可以查看部署状态
- 部署成功后会显示版本信息和Worker URL
- 如果部署失败，会显示详细的错误信息

### 5. 本地测试部署

在推送标签前，建议先本地测试：

```bash
# 安装依赖
npm install

# 验证配置
npm run validate

# 本地开发测试
npm run dev

# 手动部署测试（可选）
npm run deploy
```

## 注意事项

- 任何以`v`开头的标签都会触发自动部署（如v1.0.0, v2.1.3, v1.0.0-beta.1等）
- 确保所有必需的环境变量和Secrets都已正确配置
- 部署前建议在开发环境充分测试
- 如果部署失败，检查Actions日志获取详细错误信息

## 故障排除

### 常见问题

1. **API Token权限不足**
   - 确保token有`Cloudflare Workers:Edit`权限
   - 如果使用自定义域名，还需要Zone权限

2. **Account ID错误**
   - 从Cloudflare Dashboard右侧边栏复制正确的Account ID

3. **Wrangler配置问题**
   - 检查`config/wrangler.toml`文件是否正确
   - 确保worker名称唯一

4. **依赖安装失败**
   - 检查`package.json`和`package-lock.json`是否同步
   - 确保Node.js版本兼容（需要>=18.0.0）

如果遇到其他问题，请查看GitHub Actions的详细日志。
