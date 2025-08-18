#!/bin/bash

# D1 数据库初始化脚本
# 用于创建和初始化 neoai D1 数据库

echo "🗄️  初始化 D1 数据库..."

# 创建用户表的 SQL
cat > init_db.sql << 'EOF'
-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- 会话表
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 聊天记录表
CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_id TEXT,
    message TEXT NOT NULL,
    response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (session_id) REFERENCES sessions (id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);

-- 插入一个测试用户（可选）
-- 密码为 "test123"，实际部署时应该删除
-- INSERT INTO users (username, email, password_hash) 
-- VALUES ('testuser', 'test@example.com', 'test_salt:hashed_password');

EOF

echo "📝 数据库初始化 SQL 文件已创建: init_db.sql"
echo ""
echo "请使用以下命令初始化数据库:"
echo "wrangler d1 execute neoai --file=init_db.sql"
echo ""
echo "或者通过 Cloudflare Dashboard 执行 SQL 语句"

# 清理临时文件（可选）
# rm init_db.sql
