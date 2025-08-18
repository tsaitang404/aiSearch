# Cloudflare API 权限配置指南

## 📋 概述

在GitHub Actions中部署到Cloudflare Worker需要配置两个关键的Secrets：
- `CLOUDFLARE_API_TOKEN`: 用于API认证的Token
- `CLOUDFLARE_ACCOUNT_ID`: 你的Cloudflare账户ID

## 🔑 步骤1: 创建Cloudflare API Token

### 1.1 访问API Token页面

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 点击右上角的用户头像
3. 选择 "My Profile"
4. 点击 "API Tokens" 标签
5. 点击 "Create Token" 按钮

### 1.2 选择Token模板

选择 **"Custom token"** 模板（推荐）来精确控制权限。

### 1.3 配置Token权限

#### 基本权限配置
```
Account: Cloudflare Workers:Edit
Zone: Zone:Read (如果使用自定义域名)
```

#### 详细权限说明

**必需权限:**
- **Account Permissions**:
  - `Cloudflare Workers:Edit` - 部署和管理Workers
  
**可选权限（根据需要添加）:**
- **Zone Permissions** (如果使用自定义域名):
  - `Zone:Read` - 读取Zone信息
  - `Zone Settings:Edit` - 修改Zone设置
  - `DNS:Edit` - 管理DNS记录

#### 权限配置示例

**仅Workers部署（推荐最小权限）:**
```yaml
Account permissions:
  - Cloudflare Workers:Edit

Account resources:
  - Include: All accounts
  # 或指定特定账户: Include: your-account-name

Zone permissions: (留空或不配置)

Zone resources: (留空或不配置)
```

**包含自定义域名支持:**
```yaml
Account permissions:
  - Cloudflare Workers:Edit

Account resources:
  - Include: All accounts

Zone permissions:
  - Zone:Read
  - Zone Settings:Edit
  - DNS:Edit

Zone resources:
  - Include: All zones
  # 或指定特定域名: Include: example.com
```

### 1.4 额外配置

**Client IP Address Filtering (可选):**
- 可以限制只有GitHub Actions的IP范围能使用此Token
- 但GitHub Actions使用动态IP，建议留空

**TTL (生存时间):**
- 建议设置合理的过期时间（如1年）
- 到期前记得更新Token

### 1.5 创建并保存Token

1. 点击 "Continue to summary"
2. 检查权限配置
3. 点击 "Create Token"
4. **重要**: 立即复制Token（只会显示一次）

## 🆔 步骤2: 获取Account ID

### 2.1 在Dashboard中查找

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 在右侧边栏找到 **"Account ID"**
3. 复制32位的Account ID

### 2.2 使用API查看（可选）

```bash
# 使用刚创建的API Token查看账户信息
curl -X GET "https://api.cloudflare.com/client/v4/accounts" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json"
```

## 🔧 步骤3: 在GitHub中配置Secrets

### 3.1 访问仓库设置

1. 打开你的GitHub仓库
2. 点击 "Settings" 标签
3. 在左侧菜单选择 "Secrets and variables" → "Actions"

### 3.2 添加Secrets

点击 "New repository secret" 并添加：

#### CLOUDFLARE_API_TOKEN
- **Name**: `CLOUDFLARE_API_TOKEN`
- **Secret**: 粘贴步骤1中创建的API Token

#### CLOUDFLARE_ACCOUNT_ID
- **Name**: `CLOUDFLARE_ACCOUNT_ID`
- **Secret**: 粘贴步骤2中获取的Account ID

## ✅ 步骤4: 验证配置

### 4.1 测试API Token

使用以下命令测试Token是否有效：

```bash
# 测试Token权限
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json"

# 预期响应
{
  "result": {
    "id": "token_id",
    "status": "active"
  },
  "success": true
}
```

### 4.2 测试部署

创建测试标签触发部署：

```bash
git tag v1.0.0-test
git push origin v1.0.0-test
```

在GitHub Actions日志中查看：
- ✅ Wrangler认证成功
- ✅ Worker部署成功
- ✅ 没有权限相关错误

## 🔒 安全最佳实践

### Token安全

- ✅ 使用最小权限原则
- ✅ 定期轮换Token（建议6个月）
- ✅ 监控Token使用情况
- ❌ 不要在代码中硬编码Token
- ❌ 不要在日志中打印Token

### GitHub Secrets安全

- ✅ Secrets在GitHub中加密存储
- ✅ 只有仓库管理员能查看/修改
- ✅ 在Actions日志中自动脱敏（显示为***）
- ✅ 不会泄漏到Pull Requests或Forks

## 🚨 常见问题排除

### 权限错误

**错误**: "Insufficient permissions"
**解决**: 确保Token有`Cloudflare Workers:Edit`权限

**错误**: "Account not found"
**解决**: 检查Account ID是否正确

### Token问题

**错误**: "Invalid token"
**解决**: 重新创建Token并更新GitHub Secret

**错误**: "Token expired"
**解决**: 创建新Token并更新

### 部署失败

**错误**: "Worker name already exists"
**解决**: 检查wrangler.toml中的worker名称是否唯一

## 📱 Token权限参考

### 完整权限列表

```yaml
# 最小权限（仅Workers部署）
Account permissions:
  - Cloudflare Workers:Edit

# 推荐权限（支持自定义域名）
Account permissions:
  - Cloudflare Workers:Edit
Zone permissions:
  - Zone:Read
  - Zone Settings:Edit

# 完整权限（如需要更多功能）
Account permissions:
  - Cloudflare Workers:Edit
  - Account:Read
Zone permissions:
  - Zone:Read
  - Zone Settings:Edit
  - DNS:Edit
```

## 🔄 Token轮换

定期轮换API Token的步骤：

1. 在Cloudflare创建新Token
2. 更新GitHub中的`CLOUDFLARE_API_TOKEN` Secret
3. 测试部署确认新Token工作正常
4. 在Cloudflare中删除旧Token

---

**📞 需要帮助？**

如果遇到权限配置问题：
1. 检查 [GitHub Actions日志](../../actions) 中的详细错误
2. 参考 [Cloudflare API文档](https://developers.cloudflare.com/api/)
3. 确认Token权限配置是否正确
