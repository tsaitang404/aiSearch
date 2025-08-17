# 配置文件

这个目录包含项目的配置文件。

## wrangler.toml

Cloudflare Worker 的主要配置文件。

### 主要配置项

- `name`: Worker 的名称 (`aisearch`)
- `main`: Worker 入口文件路径 (`src/worker/index.js`)
- `compatibility_date`: API 兼容性日期
- `[ai]`: AI 服务绑定配置
- `[dev]`: 本地开发配置

### 自定义配置

如需添加其他 Cloudflare 资源，可以在此文件中配置:

```toml
# KV 存储
[[kv_namespaces]]
binding = "MY_KV"
id = "xxxxxxxx"

# D1 数据库  
[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "xxxxxxxx"

# 自定义域名
routes = [
  { pattern = "yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

### 环境变量

敏感信息应使用 Wrangler Secrets 而不是在配置文件中明文存储:

```bash
wrangler secret put SECRET_NAME
```

## 使用配置

所有 wrangler 命令都会自动使用此配置文件:

```bash
npm run dev      # 使用 --config config/wrangler.toml
npm run deploy   # 使用 --config config/wrangler.toml
```
