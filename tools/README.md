# 开发工具

这个目录包含项目的开发工具和脚本。

## scripts/ 目录

### dev-start.sh
启动本地开发环境的脚本。

使用方法:
```bash
./tools/scripts/dev-start.sh
```

功能:
- 检查并安装依赖
- 启动 Cloudflare Worker 开发服务器
- 显示访问地址和说明

### get-worker-url.sh  
获取 Worker 部署状态和 URL 信息的脚本。

使用方法:
```bash
./tools/scripts/get-worker-url.sh
```

功能:
- 检查 Worker 部署状态
- 显示 Worker URL
- 测试 Worker 连接

## 添加新工具

如果需要添加新的开发工具，请:

1. 在相应子目录中创建文件
2. 确保脚本有执行权限: `chmod +x script_name.sh`
3. 在 `package.json` 中添加对应的 npm 脚本 (如果适用)
4. 更新相关文档
