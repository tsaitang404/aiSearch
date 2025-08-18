/**
 * 认证工具模块
 * 提供密码哈希、JWT生成、会话管理等功能
 * @version 1.0.0
 * @author NeoAI Team
 */

/**
 * 生成随机字符串
 * @param {number} length - 字符串长度
 * @returns {string} 随机字符串
 */
function generateRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * 生成会话ID
 * @returns {string} 唯一的会话ID
 */
export function generateSessionId() {
    return `sess_${Date.now()}_${generateRandomString(16)}`;
}

/**
 * 简单的密码哈希函数（使用 Web Crypto API）
 * @param {string} password - 明文密码
 * @param {string} salt - 盐值
 * @returns {Promise<string>} 哈希后的密码
 */
export async function hashPassword(password, salt = null) {
    if (!salt) {
        salt = generateRandomString(16);
    }
    
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    
    return `${salt}:${hashHex}`;
}

/**
 * 验证密码
 * @param {string} password - 明文密码
 * @param {string} hashedPassword - 存储的哈希密码
 * @returns {Promise<boolean>} 是否匹配
 */
export async function verifyPassword(password, hashedPassword) {
    try {
        const [salt, hash] = hashedPassword.split(':');
        const newHash = await hashPassword(password, salt);
        return newHash === hashedPassword;
    } catch (error) {
        console.error('密码验证失败:', error);
        return false;
    }
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否为有效邮箱
 */
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 验证用户名格式
 * @param {string} username - 用户名
 * @returns {boolean} 是否为有效用户名
 */
export function validateUsername(username) {
    // 用户名：3-20个字符，只能包含字母、数字、下划线
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {object} 验证结果
 */
export function validatePassword(password) {
    const result = {
        isValid: true,
        errors: []
    };

    if (password.length < 6) {
        result.isValid = false;
        result.errors.push('密码长度不能少于6个字符');
    }

    if (password.length > 128) {
        result.isValid = false;
        result.errors.push('密码长度不能超过128个字符');
    }

    if (!/[a-zA-Z]/.test(password)) {
        result.isValid = false;
        result.errors.push('密码必须包含字母');
    }

    if (!/[0-9]/.test(password)) {
        result.isValid = false;
        result.errors.push('密码必须包含数字');
    }

    return result;
}

/**
 * 从请求中提取会话ID
 * @param {Request} request - HTTP请求
 * @returns {string|null} 会话ID
 */
export function getSessionFromRequest(request) {
    // 优先从 Authorization header 获取
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // 从 Cookie 获取
    const cookie = request.headers.get('Cookie');
    if (cookie) {
        const match = cookie.match(/session=([^;]+)/);
        if (match) {
            return match[1];
        }
    }

    return null;
}

/**
 * 设置会话Cookie
 * @param {string} sessionId - 会话ID
 * @param {number} expiresIn - 过期时间（秒）
 * @returns {string} Cookie字符串
 */
export function setSessionCookie(sessionId, expiresIn = 3600 * 24 * 7) {
    const expires = new Date(Date.now() + expiresIn * 1000);
    return `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expires.toUTCString()}`;
}

/**
 * 清除会话Cookie
 * @returns {string} Cookie字符串
 */
export function clearSessionCookie() {
    return 'session=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
