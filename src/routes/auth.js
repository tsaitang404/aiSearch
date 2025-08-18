/**
 * 认证API路由模块
 * 处理用户注册、登录、登出等认证相关请求
 * @version 1.0.0
 * @author NeoAI Team
 */

import { corsHeaders } from '../utils/cors.js';
import { logRequest, logError } from '../utils/logger.js';
import { 
    hashPassword, 
    verifyPassword, 
    validateEmail, 
    validateUsername, 
    validatePassword,
    generateSessionId,
    getSessionFromRequest,
    setSessionCookie,
    clearSessionCookie
} from '../utils/auth.js';
import {
    initializeDatabase,
    createUser,
    findUser,
    createSession,
    validateSession,
    deleteSession
} from '../utils/database.js';

/**
 * 处理用户注册
 * @param {Request} request - HTTP请求
 * @param {Object} env - 环境变量
 * @returns {Response} 响应
 */
export async function handleRegister(request, env) {
    try {
        logRequest(request, 'auth/register');
        
        console.log('环境变量检查:', Object.keys(env));
        console.log('DB 绑定状态:', !!env.DB);

        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: '方法不允许' }), {
                status: 405,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 检查数据库连接
        if (!env.DB) {
            console.error('数据库未绑定');
            return new Response(JSON.stringify({ error: '数据库服务不可用' }), {
                status: 503,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 确保数据库已初始化
        await initializeDatabase(env.DB);

        const body = await request.json();
        const { username, email, password } = body;

        // 验证输入
        if (!username || !email || !password) {
            return new Response(JSON.stringify({ error: '缺少必要字段' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 验证用户名
        if (!validateUsername(username)) {
            return new Response(JSON.stringify({ 
                error: '用户名格式无效，只能包含3-20个字母、数字或下划线' 
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 验证邮箱
        if (!validateEmail(email)) {
            return new Response(JSON.stringify({ error: '邮箱格式无效' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 验证密码
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return new Response(JSON.stringify({ 
                error: '密码格式无效', 
                details: passwordValidation.errors 
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 检查用户是否已存在
        const existingUser = await findUser(env.DB, username);
        if (existingUser.success && existingUser.user) {
            return new Response(JSON.stringify({ error: '用户名或邮箱已存在' }), {
                status: 409,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const existingEmail = await findUser(env.DB, email);
        if (existingEmail.success && existingEmail.user) {
            return new Response(JSON.stringify({ error: '用户名或邮箱已存在' }), {
                status: 409,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 哈希密码
        const passwordHash = await hashPassword(password);

        // 创建用户
        const createResult = await createUser(env.DB, username, email, passwordHash);
        if (!createResult.success) {
            logError('注册失败', createResult.error, 'auth/register');
            return new Response(JSON.stringify({ error: '注册失败，请稍后重试' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: '注册成功',
            userId: createResult.userId 
        }), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        logError('注册请求处理失败', error, 'auth/register');
        return new Response(JSON.stringify({ error: '服务器内部错误' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

/**
 * 处理用户登录
 * @param {Request} request - HTTP请求
 * @param {Object} env - 环境变量
 * @returns {Response} 响应
 */
export async function handleLogin(request, env) {
    try {
        logRequest(request, 'auth/login');

        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: '方法不允许' }), {
                status: 405,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const body = await request.json();
        const { identifier, password } = body; // identifier 可以是用户名或邮箱

        // 验证输入
        if (!identifier || !password) {
            return new Response(JSON.stringify({ error: '缺少用户名/邮箱或密码' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 查找用户
        const userResult = await findUser(env.DB, identifier);
        if (!userResult.success || !userResult.user) {
            return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 验证密码
        const passwordValid = await verifyPassword(password, userResult.user.password_hash);
        if (!passwordValid) {
            return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 创建会话
        const sessionId = generateSessionId();
        const sessionResult = await createSession(env.DB, userResult.user.id, sessionId);
        
        if (!sessionResult.success) {
            logError('创建会话失败', sessionResult.error, 'auth/login');
            return new Response(JSON.stringify({ error: '登录失败，请稍后重试' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 设置会话Cookie
        const cookieHeader = setSessionCookie(sessionId);

        return new Response(JSON.stringify({ 
            success: true, 
            message: '登录成功',
            user: {
                id: userResult.user.id,
                username: userResult.user.username,
                email: userResult.user.email
            },
            sessionId
        }), {
            status: 200,
            headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json',
                'Set-Cookie': cookieHeader
            }
        });

    } catch (error) {
        logError('登录请求处理失败', error, 'auth/login');
        return new Response(JSON.stringify({ error: '服务器内部错误' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

/**
 * 处理用户登出
 * @param {Request} request - HTTP请求
 * @param {Object} env - 环境变量
 * @returns {Response} 响应
 */
export async function handleLogout(request, env) {
    try {
        logRequest(request, 'auth/logout');

        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: '方法不允许' }), {
                status: 405,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 获取会话ID
        const sessionId = getSessionFromRequest(request);
        if (!sessionId) {
            return new Response(JSON.stringify({ error: '未找到有效会话' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 删除会话
        const deleteResult = await deleteSession(env.DB, sessionId);
        if (!deleteResult.success) {
            logError('删除会话失败', deleteResult.error, 'auth/logout');
        }

        // 清除Cookie
        const cookieHeader = clearSessionCookie();

        return new Response(JSON.stringify({ 
            success: true, 
            message: '登出成功'
        }), {
            status: 200,
            headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json',
                'Set-Cookie': cookieHeader
            }
        });

    } catch (error) {
        logError('登出请求处理失败', error, 'auth/logout');
        return new Response(JSON.stringify({ error: '服务器内部错误' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

/**
 * 处理用户信息获取
 * @param {Request} request - HTTP请求
 * @param {Object} env - 环境变量
 * @returns {Response} 响应
 */
export async function handleProfile(request, env) {
    try {
        logRequest(request, 'auth/profile');

        if (request.method !== 'GET') {
            return new Response(JSON.stringify({ error: '方法不允许' }), {
                status: 405,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 获取并验证会话
        const sessionId = getSessionFromRequest(request);
        if (!sessionId) {
            return new Response(JSON.stringify({ error: '未授权' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const sessionResult = await validateSession(env.DB, sessionId);
        if (!sessionResult.success || !sessionResult.session) {
            return new Response(JSON.stringify({ error: '会话无效或已过期' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ 
            success: true,
            user: {
                id: sessionResult.session.user_id,
                username: sessionResult.session.username,
                email: sessionResult.session.email
            }
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        logError('获取用户信息失败', error, 'auth/profile');
        return new Response(JSON.stringify({ error: '服务器内部错误' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

/**
 * 认证中间件 - 验证用户是否已登录
 * @param {Request} request - HTTP请求
 * @param {Object} env - 环境变量
 * @returns {Object|null} 用户信息或null
 */
export async function authenticateUser(request, env) {
    try {
        const sessionId = getSessionFromRequest(request);
        if (!sessionId) {
            return null;
        }

        const sessionResult = await validateSession(env.DB, sessionId);
        if (!sessionResult.success || !sessionResult.session) {
            return null;
        }

        return {
            id: sessionResult.session.user_id,
            username: sessionResult.session.username,
            email: sessionResult.session.email,
            sessionId
        };
    } catch (error) {
        logError('用户认证失败', error, 'auth/middleware');
        return null;
    }
}
