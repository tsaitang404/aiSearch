/**
 * D1 数据库工具模块
 * 提供用户认证相关的数据库操作
 * @version 1.0.0
 * @author NeoAI Team
 */

/**
 * 初始化数据库表
 * @param {D1Database} db - D1 数据库实例
 */
export async function initializeDatabase(db) {
    try {
        // 创建用户表
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            )
        `);

        // 创建会话表
        await db.exec(`
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);

        // 创建用户聊天记录表
        await db.exec(`
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                session_id TEXT,
                message TEXT NOT NULL,
                response TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (session_id) REFERENCES sessions (id)
            )
        `);

        console.log('数据库表初始化成功');
        return { success: true };
    } catch (error) {
        console.error('数据库初始化失败:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 创建新用户
 * @param {D1Database} db - D1 数据库实例
 * @param {string} username - 用户名
 * @param {string} email - 邮箱
 * @param {string} passwordHash - 密码哈希
 */
export async function createUser(db, username, email, passwordHash) {
    try {
        const result = await db.prepare(`
            INSERT INTO users (username, email, password_hash)
            VALUES (?, ?, ?)
        `).bind(username, email, passwordHash).run();

        return { success: true, userId: result.meta.last_row_id };
    } catch (error) {
        console.error('创建用户失败:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 根据用户名或邮箱查找用户
 * @param {D1Database} db - D1 数据库实例
 * @param {string} identifier - 用户名或邮箱
 */
export async function findUser(db, identifier) {
    try {
        const result = await db.prepare(`
            SELECT * FROM users 
            WHERE (username = ? OR email = ?) AND is_active = 1
        `).bind(identifier, identifier).first();

        return { success: true, user: result };
    } catch (error) {
        console.error('查找用户失败:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 创建用户会话
 * @param {D1Database} db - D1 数据库实例
 * @param {number} userId - 用户ID
 * @param {string} sessionId - 会话ID
 * @param {number} expiresIn - 过期时间（秒）
 */
export async function createSession(db, userId, sessionId, expiresIn = 3600 * 24 * 7) {
    try {
        const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
        
        await db.prepare(`
            INSERT INTO sessions (id, user_id, expires_at)
            VALUES (?, ?, ?)
        `).bind(sessionId, userId, expiresAt).run();

        return { success: true };
    } catch (error) {
        console.error('创建会话失败:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 验证会话
 * @param {D1Database} db - D1 数据库实例
 * @param {string} sessionId - 会话ID
 */
export async function validateSession(db, sessionId) {
    try {
        const result = await db.prepare(`
            SELECT s.*, u.username, u.email 
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ? AND s.is_active = 1 AND s.expires_at > datetime('now') AND u.is_active = 1
        `).bind(sessionId).first();

        return { success: true, session: result };
    } catch (error) {
        console.error('验证会话失败:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 删除会话（登出）
 * @param {D1Database} db - D1 数据库实例
 * @param {string} sessionId - 会话ID
 */
export async function deleteSession(db, sessionId) {
    try {
        await db.prepare(`
            UPDATE sessions SET is_active = 0 WHERE id = ?
        `).bind(sessionId).run();

        return { success: true };
    } catch (error) {
        console.error('删除会话失败:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 保存聊天记录
 * @param {D1Database} db - D1 数据库实例
 * @param {number} userId - 用户ID
 * @param {string} sessionId - 会话ID
 * @param {string} message - 用户消息
 * @param {string} response - AI响应
 */
export async function saveChatHistory(db, userId, sessionId, message, response) {
    try {
        await db.prepare(`
            INSERT INTO chat_history (user_id, session_id, message, response)
            VALUES (?, ?, ?, ?)
        `).bind(userId, sessionId, message, response).run();

        return { success: true };
    } catch (error) {
        console.error('保存聊天记录失败:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 获取用户聊天历史
 * @param {D1Database} db - D1 数据库实例
 * @param {number} userId - 用户ID
 * @param {number} limit - 记录数量限制
 */
export async function getChatHistory(db, userId, limit = 50) {
    try {
        const result = await db.prepare(`
            SELECT message, response, created_at 
            FROM chat_history 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        `).bind(userId, limit).all();

        return { success: true, history: result.results };
    } catch (error) {
        console.error('获取聊天历史失败:', error);
        return { success: false, error: error.message };
    }
}
