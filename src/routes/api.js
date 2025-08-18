/**
 * API路由处理模块
 * @version 2.0.0
 */

import { corsHeaders, handleCORS } from '../utils/cors.js';
import { validateInput, validateContentType, parseRequestBody } from '../utils/validation.js';
import { logRequest, logError } from '../utils/logger.js';
import { getAvailableModels } from '../utils/models.js';
import { APP_NAME, AUTO_RAG_INSTANCE, FALLBACK_MODELS } from '../config.js';
import { authenticateUser } from './auth.js';
import { saveChatHistory, getChatHistory } from '../utils/database.js';

/**
 * 处理聊天API请求
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量
 * @returns {Response} 响应对象
 */
export async function handleChatAPI(request, env) {
    try {
        // 记录请求
        logRequest(request, 'chat');

        // 验证请求方法和内容类型
        if (!validateContentType(request)) {
            throw new Error('请求必须是JSON格式');
        }

        // 解析请求体
        const body = await parseRequestBody(request);
        if (!body) {
            throw new Error('请求体无效或为空');
        }

        const { message, useAutoRAG = true, fallbackModel = FALLBACK_MODELS[0], temperature = 0.7, maxTokens = 500 } = body;

        // 验证消息内容
        if (!message || !validateInput(message)) {
            throw new Error('消息内容无效');
        }

        // 检查用户认证状态（可选，未登录也允许使用）
        const user = await authenticateUser(request, env);
        
        let response;
        let sources = [];
        let model = 'AutoRAG';

        try {
            if (useAutoRAG) {
                // 尝试使用AutoRAG
                response = await callAutoRAG(message, env);
                if (response && response.response) {
                    // 如果用户已登录，保存聊天记录
                    if (user && user.id) {
                        try {
                            await saveChatHistory(env.DB, user.id, user.sessionId, message, response.response);
                        } catch (saveError) {
                            logError('保存聊天记录失败', saveError, 'chat/save');
                        }
                    }
                    
                    return new Response(JSON.stringify({
                        response: response.response,
                        sources: response.sources || [],
                        model: 'AutoRAG',
                        timestamp: new Date().toISOString(),
                        user: user ? { username: user.username } : null
                    }), {
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders
                        }
                    });
                }
            }
        } catch (error) {
            logError(error, 'AutoRAG调用失败，尝试回落模型');
        }

        // 回落到AI模型
        try {
            response = await callFallbackModel(message, fallbackModel, temperature, maxTokens, env);
            model = fallbackModel;
        } catch (error) {
            logError(error, '回落模型调用失败');
            throw new Error('所有AI服务暂时不可用，请稍后再试');
        }

        // 如果用户已登录，保存聊天记录
        if (user && user.id && response) {
            try {
                await saveChatHistory(env.DB, user.id, user.sessionId, message, response);
            } catch (saveError) {
                logError('保存聊天记录失败', saveError, 'chat/save');
            }
        }

        return new Response(JSON.stringify({
            response: response,
            sources: sources,
            model: model,
            timestamp: new Date().toISOString(),
            user: user ? { username: user.username } : null
        }), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });

    } catch (error) {
        logError(error, '聊天API处理失败');
        
        return new Response(JSON.stringify({
            error: error.message || '处理请求时发生错误',
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });
    }
}

/**
 * 调用AutoRAG实例
 * @param {string} message - 用户消息
 * @param {Object} env - 环境变量
 * @returns {Promise<Object>} AutoRAG响应
 */
async function callAutoRAG(message, env) {
    if (!AUTO_RAG_INSTANCE) {
        throw new Error('AutoRAG实例未配置');
    }

    const autoragUrl = `https://${AUTO_RAG_INSTANCE}.autorag.run/v1/chat/completions`;
    
    const apiKey = env.AUTORAG_API_KEY;
    if (!apiKey) {
        throw new Error('AutoRAG API密钥未配置');
    }
    
    const response = await fetch(autoragUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        logError(new Error(`AutoRAG API错误: ${response.status} - ${errorText}`), 'AutoRAG调用');
        throw new Error(`AutoRAG服务响应错误: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
        throw new Error('AutoRAG返回的数据格式无效');
    }

    return {
        response: data.choices[0].message.content,
        sources: data.sources || []
    };
}

/**
 * 调用回落AI模型
 * @param {string} message - 用户消息
 * @param {string} model - 模型名称
 * @param {number} temperature - 温度参数
 * @param {number} maxTokens - 最大令牌数
 * @param {Object} env - 环境变量
 * @returns {Promise<string>} AI响应
 */
async function callFallbackModel(message, model, temperature, maxTokens, env) {
    try {
        const response = await env.AI.run(model, {
            messages: [
                {
                    role: 'system',
                    content: '你是一个有用的AI助手。请用中文回答问题，并提供准确、有帮助的信息。'
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            temperature: temperature,
            max_tokens: maxTokens
        });

        return response?.response || response?.content || '抱歉，我现在无法回答您的问题。';
    } catch (error) {
        logError(error, `回落模型 ${model} 调用失败`);
        throw new Error(`模型 ${model} 调用失败: ${error.message}`);
    }
}

/**
 * 处理模型列表API请求
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量
 * @returns {Response} 响应对象
 */
export async function handleModelsAPI(request, env) {
    try {
        logRequest(request, 'models');

        const modelsData = await getAvailableModels(env);
        
        return new Response(JSON.stringify({
            models: modelsData.models,
            timestamp: new Date().toISOString(),
            default: FALLBACK_MODELS[0],
            source: modelsData.source
        }), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });

    } catch (error) {
        logError(error, '模型列表API处理失败');
        
        return new Response(JSON.stringify({
            error: '获取模型列表失败',
            models: FALLBACK_MODELS.map(model => ({
                name: model,
                available: false,
                error: '无法检测模型状态'
            })),
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });
    }
}

/**
 * 处理状态检查API请求
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量
 * @returns {Response} 响应对象
 */
export async function handleHealthAPI(request, env) {
    try {
        logRequest(request, 'health');

        const health = {
            status: 'healthy',
            app: APP_NAME,
            timestamp: new Date().toISOString(),
            services: {
                autorag: {
                    enabled: !!AUTO_RAG_INSTANCE,
                    instance: AUTO_RAG_INSTANCE || 'not configured'
                },
                fallback_models: {
                    available: FALLBACK_MODELS,
                    count: FALLBACK_MODELS.length
                }
            }
        };

        // 测试AutoRAG连接性
        if (AUTO_RAG_INSTANCE) {
            try {
                const testResponse = await fetch(`https://${AUTO_RAG_INSTANCE}.autorag.run/health`, {
                    method: 'GET',
                    timeout: 3000
                });
                health.services.autorag.status = testResponse.ok ? 'healthy' : 'unhealthy';
            } catch (error) {
                health.services.autorag.status = 'unreachable';
            }
        }

        return new Response(JSON.stringify(health), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });

    } catch (error) {
        logError(error, '健康检查API处理失败');
        
        return new Response(JSON.stringify({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });
    }
}

/**
 * 处理聊天历史API请求
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量
 * @returns {Response} 响应对象
 */
export async function handleChatHistoryAPI(request, env) {
    try {
        logRequest(request, 'chat-history');

        if (request.method !== 'GET') {
            return new Response(JSON.stringify({ error: '方法不允许' }), {
                status: 405,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 验证用户认证
        const user = await authenticateUser(request, env);
        if (!user || !user.id) {
            return new Response(JSON.stringify({ error: '未授权，请先登录' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 获取查询参数
        const url = new URL(request.url);
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100); // 最多100条

        // 获取聊天历史
        const historyResult = await getChatHistory(env.DB, user.id, limit);
        if (!historyResult.success) {
            logError('获取聊天历史失败', historyResult.error, 'chat-history');
            return new Response(JSON.stringify({ error: '获取聊天历史失败' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({
            success: true,
            history: historyResult.history,
            user: { username: user.username },
            timestamp: new Date().toISOString()
        }), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });

    } catch (error) {
        logError(error, '聊天历史API处理失败');
        
        return new Response(JSON.stringify({
            error: error.message || '处理请求时发生错误',
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });
    }
}
