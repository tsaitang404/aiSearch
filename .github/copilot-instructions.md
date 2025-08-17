<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Cloudflare AutoRAG 应用指南

此项目是一个使用Cloudflare Worker和Pages与AutoRAG服务集成的应用。

## 项目结构
- `src/worker/` - 包含Cloudflare Worker代码，用于与AutoRAG API通信
- `pages/` - 包含Cloudflare Pages前端代码，提供用户界面

## 开发注意事项
- Worker需要处理CORS和错误处理
- 敏感信息（如API密钥）应通过Wrangler Secrets管理
- 前端页面应该易于使用，并能清晰展示AutoRAG的查询结果
- 添加适当的错误处理和加载状态

## API集成
- AutoRAG API通常需要查询文本和可选参数
- 响应通常包含生成的答案和相关来源
- 确保正确处理API限制和错误状态
