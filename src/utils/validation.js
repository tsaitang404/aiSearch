/**
 * 输入验证工具
 * @version 1.0.0
 */

// 输入验证函数
export function validateInput(input) {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: "输入内容无效" };
  }
  
  // 检查长度限制
  if (input.length > 4000) {
    return { valid: false, error: "输入内容过长（最大4000字符）" };
  }
  
  // 基本的XSS防护
  const dangerousPatterns = /<script|javascript:|on\w+=/i;
  if (dangerousPatterns.test(input)) {
    return { valid: false, error: "输入内容包含不安全字符" };
  }
  
  return { valid: true };
}

// 验证Content-Type
export function validateContentType(request) {
  const contentType = request.headers.get("Content-Type");
  return contentType && contentType.includes("application/json");
}

// 安全地解析JSON请求体
export async function parseRequestBody(request) {
  try {
    return await request.json();
  } catch (error) {
    throw new Error("请求体JSON格式无效");
  }
}
