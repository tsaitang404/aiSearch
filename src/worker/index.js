/**
 * Cloudflare Worker for NeoAI Chat - 模块化架构
 * 主入口文件，协调各个模块提供前端页面和API服务
 * @version 3.0.0
 * @author NeoAI Team
 * 
 * 架构特点:
 * - 单Worker部署模式，保持性能优势
 * - 模块化代码组织，提升维护性
 * - 统一错误处理和日志记录
 * - 支持前端HTML和后端API双重功能
 */

// 导入模块
import { HTML_CONTENT } from '../templates/html.js';
import { handleChatAPI, handleModelsAPI, handleHealthAPI, handleChatHistoryAPI } from '../routes/api.js';
import { handleRegister, handleLogin, handleLogout, handleProfile } from '../routes/auth.js';
import { corsHeaders, handleCORS } from '../utils/cors.js';
import { logRequest, logError } from '../utils/logger.js';
import { APP_NAME } from '../config.js';

/**
 * 主请求处理器
 * 统一处理所有传入的HTTP请求，进行路由分发和错误处理
 * @param {Request} request - 传入的请求
 * @param {Object} env - 环境变量（包含AI绑定和配置）
 * @param {Object} ctx - 执行上下文
 * @returns {Response} HTTP响应
 */
export default {
    async fetch(request, env, ctx) {
        try {
            // 记录请求
            logRequest(request, 'main');
            
            // 处理CORS预检请求
            if (request.method === 'OPTIONS') {
                return handleCORS();
            }
            
            const url = new URL(request.url);
            const pathname = url.pathname;
            
            // 路由分发 - 根据URL路径决定处理方式
            if (pathname === '/') {
                // 主页面：返回包含HTML模板和内嵌JavaScript的响应
                return handleHomePage(request);
            } else if (pathname.startsWith('/api/')) {
                // API端点：处理聊天、模型查询、健康检查等功能
                return handleAPIRequest(request, env, pathname);
            } else if (pathname.startsWith('/js/') || pathname.startsWith('/css/') || pathname.startsWith('/assets/')) {
                // 静态资源：处理JavaScript、CSS、图片等静态文件请求
                return handleStaticAssets(request, pathname);
            } else {
                // 未知路径：返回404错误
                return handle404(request);
            }
            
        } catch (error) {
            logError(error, '主请求处理失败');
            return handleError(error);
        }
    }
};

/**
 * 处理首页请求
 * 返回包含完整前端界面的HTML页面，包括内嵌的CSS和JavaScript
 * @param {Request} request - 请求对象
 * @returns {Response} HTML响应
 */
function handleHomePage(request) {
    try {
        return new Response(HTML_CONTENT, {
            headers: {
                'Content-Type': 'text/html;charset=UTF-8',
                'Cache-Control': 'public, max-age=3600',
                ...corsHeaders
            }
        });
    } catch (error) {
        logError(error, '首页渲染失败');
        return new Response('页面加载失败', { status: 500 });
    }
}

/**
 * 处理API请求
 * 根据路径分发到不同的API处理函数，支持聊天、模型查询、健康检查等功能
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量（包含AI绑定）
 * @param {string} pathname - 请求路径
 * @returns {Response} API响应
 */
async function handleAPIRequest(request, env, pathname) {
    try {
        // 根据路径选择处理函数
        const handler = getAPIHandler(pathname);
        if (!handler) {
            return createAPINotFoundResponse();
        }
        
        // 验证HTTP方法
        if (!isValidMethodForAPI(request.method, pathname)) {
            return createMethodNotAllowedResponse(pathname);
        }
        
        // 调用相应的处理函数
        return await handler(request, env);
        
    } catch (error) {
        logError(error, `API请求处理失败: ${pathname}`);
        return createAPIErrorResponse(error);
    }
}

/**
 * 获取API路径对应的处理函数
 * @param {string} pathname - API路径
 * @returns {Function|null} 处理函数
 */
function getAPIHandler(pathname) {
    const handlers = {
        '/api/chat': handleChatAPI,
        '/api/models': handleModelsAPI,
        '/api/health': handleHealthAPI,
        '/api/chat-history': handleChatHistoryAPI,
        '/api/auth/register': handleRegister,
        '/api/auth/login': handleLogin,
        '/api/auth/logout': handleLogout,
        '/api/auth/profile': handleProfile
    };
    return handlers[pathname] || null;
}

/**
 * 验证HTTP方法是否适用于特定API端点
 * @param {string} method - HTTP方法
 * @param {string} pathname - API路径
 * @returns {boolean} 是否有效
 */
function isValidMethodForAPI(method, pathname) {
    const methodMap = {
        '/api/chat': 'POST',
        '/api/models': 'GET',
        '/api/health': 'GET'
    };
    return methodMap[pathname] === method;
}

/**
 * 创建方法不允许的响应
 * @param {string} pathname - API路径
 * @returns {Response} 405响应
 */
function createMethodNotAllowedResponse(pathname) {
    const methodMap = {
        '/api/chat': 'POST',
        '/api/models': 'GET', 
        '/api/health': 'GET'
    };
    const allowedMethod = methodMap[pathname] || 'GET';
    
    return new Response(JSON.stringify({ 
        error: `仅支持${allowedMethod}方法` 
    }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
}

/**
 * 创建API未找到响应
 * @returns {Response} 404响应
 */
function createAPINotFoundResponse() {
    return new Response(JSON.stringify({ 
        error: '未找到API端点',
        available: ['/api/chat', '/api/models', '/api/health']
    }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
}

/**
 * 创建API错误响应
 * @param {Error} error - 错误对象
 * @returns {Response} 500响应
 */
function createAPIErrorResponse(error) {
    return new Response(JSON.stringify({ 
        error: '内部服务器错误',
        timestamp: new Date().toISOString()
    }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
}

/**
 * 处理静态资源请求
 * @param {Request} request - 请求对象
 * @param {string} pathname - 请求路径
 * @returns {Response} 静态资源响应
 */
async function handleStaticAssets(request, pathname) {
    try {
        // 根据路径返回相应的静态资源
        if (pathname === '/js/app.js') {
            // 在Cloudflare Worker环境中，前端JavaScript已经内嵌在HTML中
            // 这里返回一个简化的响应
            const appJSContent = `
// NeoAI Frontend JavaScript - Embedded Version
console.log('NeoAI前端JavaScript已加载');

// 由于模块架构的限制，主要的前端功能已内嵌在HTML模板中
// 这个文件主要用于处理外部JavaScript请求

window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM已加载，NeoAI应用已就绪');
});
            `;
            
            return new Response(appJSContent, {
                headers: {
                    'Content-Type': 'application/javascript',
                    'Cache-Control': 'public, max-age=86400',
                    ...corsHeaders
                }
            });
        }
        
        return handle404(request);
        
    } catch (error) {
        logError(error, `静态资源处理失败: ${pathname}`);
        return new Response('资源不存在', { 
            status: 404,
            headers: corsHeaders
        });
    }
}

/**
 * 处理404错误
 * @param {Request} request - 请求对象
 * @returns {Response} 404响应
 */
function handle404(request) {
    const url = new URL(request.url);
    
    return new Response(JSON.stringify({
        error: '页面未找到',
        path: url.pathname,
        message: '请检查URL是否正确',
        timestamp: new Date().toISOString()
    }), {
        status: 404,
        headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
        }
    });
}

/**
 * 处理全局错误
 * @param {Error} error - 错误对象
 * @returns {Response} 错误响应
 */
function handleError(error) {
    logError(error, '全局错误处理');
    
    return new Response(JSON.stringify({
        error: '服务暂时不可用',
        message: '请稍后再试',
        app: APP_NAME,
        timestamp: new Date().toISOString()
    }), {
        status: 500,
        headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
        }
    });
}
