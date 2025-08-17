/**
 * 日志记录工具
 * @version 1.0.0
 */

// 记录请求日志
export function logRequest(request, extra = {}) {
  const timestamp = new Date().toISOString();
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || 'Unknown';
  console.log(`[${timestamp}] ${request.method} ${url.pathname}`, {
    userAgent: userAgent.substring(0, 100), // 截断长UA
    ...extra
  });
}

// 记录错误日志
export function logError(error, context = '') {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR ${context}:`, {
    message: error.message,
    stack: error.stack?.substring(0, 500) // 截断stack trace
  });
}
