/**
 * 安全配置和工具函数
 * @version 1.0.0
 */

// 安全配置常量
export const SECURITY_CONFIG = {
  // 内容安全政策
  CSP_HEADER: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'",
  
  // 速率限制配置
  RATE_LIMITS: {
    CHAT_API: {
      requests: 60,    // 每分钟最多60次请求
      window: 60000    // 时间窗口：1分钟
    },
    MODELS_API: {
      requests: 10,    // 每分钟最多10次请求
      window: 60000
    }
  },

  // 输入验证规则
  INPUT_RULES: {
    MAX_QUERY_LENGTH: 4000,
    MAX_TOKEN_LENGTH: 2000,
    DANGEROUS_PATTERNS: [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /eval\s*\(/gi,
      /Function\s*\(/gi
    ]
  },

  // 安全头配置
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  }
};

// 输入验证器类
export class InputValidator {
  static validate(input, type = 'query') {
    if (!input || typeof input !== 'string') {
      return { valid: false, error: '输入内容无效' };
    }

    // 检查长度
    const maxLength = type === 'query' ? 
      SECURITY_CONFIG.INPUT_RULES.MAX_QUERY_LENGTH : 
      SECURITY_CONFIG.INPUT_RULES.MAX_TOKEN_LENGTH;
    
    if (input.length > maxLength) {
      return { 
        valid: false, 
        error: `输入内容过长（最大${maxLength}字符）` 
      };
    }

    // 检查危险模式
    for (const pattern of SECURITY_CONFIG.INPUT_RULES.DANGEROUS_PATTERNS) {
      if (pattern.test(input)) {
        return { 
          valid: false, 
          error: '输入内容包含不安全字符' 
        };
      }
    }

    return { valid: true };
  }

  static sanitize(input) {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }
}

// 速率限制器类
export class RateLimiter {
  constructor() {
    this.requests = new Map();
  }

  isAllowed(identifier, endpoint) {
    const config = SECURITY_CONFIG.RATE_LIMITS[endpoint] || 
                  SECURITY_CONFIG.RATE_LIMITS.CHAT_API;
    
    const now = Date.now();
    const key = `${identifier}:${endpoint}`;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, { count: 1, resetTime: now + config.window });
      return true;
    }

    const record = this.requests.get(key);
    
    // 如果时间窗口已过，重置计数
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + config.window;
      return true;
    }

    // 检查是否超过限制
    if (record.count >= config.requests) {
      return false;
    }

    record.count++;
    return true;
  }

  // 清理过期记录
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// 安全工具函数
export class SecurityUtils {
  static getClientIP(request) {
    const cfConnectingIP = request.headers.get('CF-Connecting-IP');
    const xForwardedFor = request.headers.get('X-Forwarded-For');
    const xRealIP = request.headers.get('X-Real-IP');
    
    return cfConnectingIP || 
           (xForwardedFor && xForwardedFor.split(',')[0].trim()) || 
           xRealIP || 
           'unknown';
  }

  static getUserAgent(request) {
    const ua = request.headers.get('User-Agent') || 'unknown';
    return ua.substring(0, 200); // 限制长度防止日志溢出
  }

  static generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  static addSecurityHeaders(headers = {}) {
    return {
      ...headers,
      ...SECURITY_CONFIG.SECURITY_HEADERS
    };
  }
}

// 导出单例实例
export const rateLimiter = new RateLimiter();

// 定期清理速率限制记录
setInterval(() => {
  rateLimiter.cleanup();
}, 300000); // 每5分钟清理一次
