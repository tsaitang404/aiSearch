/**
 * D1 数据库工具模块
 * 提供用户认证相关的数据库操作
 * @version 1.0.0
 * @author NeoAI Team
 */

/**
 * 初始化数据库表 - 检查现有表结构，不重复创建
 * @param {D1Database} db - D1 数据库实例
 */
export async function initializeDatabase(db) {
    try {
        console.log('检查数据库连接...');
        
        // 检查数据库是否可用
        if (!db) {
            throw new Error('数据库未绑定');
        }

        // 检查现有表
        const tables = await db.prepare(`
            SELECT name FROM sqlite_master WHERE type='table'
        `).all();
        
        console.log('现有表:', tables.results?.map(t => t.name));
        
        // 数据库表已经存在，不需要创建新表
        // 现有结构：users, user_sessions, chat_history
        
        console.log('数据库检查完成');
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
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const result = await db.prepare(`
            INSERT INTO users (id, username, email, password_hash)
            VALUES (?, ?, ?, ?)
        `).bind(userId, username, email, passwordHash).run();

        return { success: true, userId: userId };
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
 * @param {string} userId - 用户ID
 * @param {string} sessionId - 会话ID
 * @param {number} expiresIn - 过期时间（秒）
 */
export async function createSession(db, userId, sessionId, expiresIn = 3600 * 24 * 7) {
    try {
        const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
        
        await db.prepare(`
            INSERT INTO user_sessions (id, user_id, token_hash, expires_at)
            VALUES (?, ?, ?, ?)
        `).bind(sessionId, userId, sessionId, expiresAt).run();

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
            FROM user_sessions s
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
            UPDATE user_sessions SET is_active = 0 WHERE id = ?
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
 * @param {string} userId - 用户ID
 * @param {string} sessionId - 会话ID（暂时不用，因为表中没有这个字段）
 * @param {string} message - 用户消息
 * @param {string} response - AI响应
 */
export async function saveChatHistory(db, userId, sessionId, message, response) {
    try {
        const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.prepare(`
            INSERT INTO chat_history (id, user_id, message, response)
            VALUES (?, ?, ?, ?)
        `).bind(chatId, userId, message, response).run();

        return { success: true };
    } catch (error) {
        console.error('保存聊天记录失败:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 获取用户聊天历史
 * @param {D1Database} db - D1 数据库实例
 * @param {string} userId - 用户ID
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
