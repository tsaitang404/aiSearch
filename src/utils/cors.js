/**
 * CORS 处理工具
 * @version 1.0.0
 */

// 设置CORS头
export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json"
  };
}

// 处理CORS预检请求
export function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}
