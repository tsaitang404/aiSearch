# 版本管理示例

## 支持的版本格式

现在项目支持任何以`v`开头的标签进行自动部署：

### 标准语义化版本
```bash
git tag v1.0.0    # 主版本
git tag v1.1.0    # 功能版本  
git tag v1.1.1    # 补丁版本
```

### 预发布版本
```bash
git tag v1.0.0-alpha.1    # Alpha版本
git tag v1.0.0-beta.2     # Beta版本
git tag v1.0.0-rc.1       # Release Candidate
```

### 其他格式
```bash
git tag v2.0.0-dev        # 开发版本
git tag v1.5.0-hotfix.1   # 热修复版本
```

## 使用发布脚本

运行交互式发布脚本：

```bash
npm run release
```

脚本会：
1. 显示最近5个版本标签
2. 基于最新标签自动建议下一个版本号
3. 验证版本号格式
4. 创建并推送标签
5. 自动触发GitHub Actions部署

## 手动创建标签

```bash
# 创建标签
git tag v1.2.0 -m "Release v1.2.0: 新增自动部署功能"

# 推送标签（触发部署）
git push origin v1.2.0
```

## 查看版本历史

```bash
# 查看所有版本标签
git tag -l "v*" | sort -V

# 查看最新5个版本
git tag -l "v*" | sort -V | tail -5

# 查看当前最新版本
git describe --tags --abbrev=0
```
