/**
 * API响应标准化工具
 * @version 1.0.0
 */

// 标准响应格式
export class ApiResponse {
  constructor(success = true, data = null, error = null, meta = {}) {
    this.success = success;
    this.timestamp = new Date().toISOString();
    
    if (success) {
      this.data = data;
      if (Object.keys(meta).length > 0) {
        this.meta = meta;
      }
    } else {
      this.error = error;
    }
  }

  static success(data, meta = {}) {
    return new ApiResponse(true, data, null, meta);
  }

  static error(message, code = 'UNKNOWN_ERROR', statusCode = 500) {
    return new ApiResponse(false, null, {
      code,
      message,
      statusCode
    });
  }

  static paginated(data, pagination) {
    return new ApiResponse(true, data, null, {
      pagination
    });
  }

  toResponse(statusCode = 200, additionalHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Response-Time': new Date().toISOString(),
      ...additionalHeaders
    };

    // 如果是错误响应，使用错误状态码
    if (!this.success && this.error?.statusCode) {
      statusCode = this.error.statusCode;
    }

    return new Response(JSON.stringify(this, null, 2), {
      status: statusCode,
      headers
    });
  }
}

// 健康检查响应
export class HealthCheckResponse extends ApiResponse {
  constructor(status = 'healthy', checks = {}) {
    const data = {
      status,
      version: '2.1.0',
      uptime: process?.uptime ? `${Math.floor(process.uptime())}s` : 'unknown',
      checks
    };

    super(true, data);
  }

  static healthy(checks = {}) {
    return new HealthCheckResponse('healthy', checks);
  }

  static unhealthy(checks = {}, reason = 'Service degraded') {
    const response = new HealthCheckResponse('unhealthy', checks);
    response.error = { message: reason };
    response.success = false;
    return response;
  }
}

// 验证响应格式工具
export class ResponseValidator {
  static validateApiResponse(response) {
    if (!response || typeof response !== 'object') {
      return { valid: false, error: 'Response must be an object' };
    }

    if (typeof response.success !== 'boolean') {
      return { valid: false, error: 'Response must have a boolean success field' };
    }

    if (typeof response.timestamp !== 'string') {
      return { valid: false, error: 'Response must have a timestamp field' };
    }

    if (response.success) {
      if (response.data === undefined) {
        return { valid: false, error: 'Successful response must have data field' };
      }
    } else {
      if (!response.error || typeof response.error !== 'object') {
        return { valid: false, error: 'Error response must have error object' };
      }

      if (typeof response.error.message !== 'string') {
        return { valid: false, error: 'Error object must have message field' };
      }
    }

    return { valid: true };
  }
}

// 响应缓存工具
export class ResponseCache {
  constructor(maxAge = 300) { // 默认5分钟
    this.cache = new Map();
    this.maxAge = maxAge * 1000; // 转换为毫秒
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // 定期清理过期条目
    if (this.cache.size > 1000) { // 防止内存泄漏
      this.cleanup();
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// 导出工具实例
export const responseCache = new ResponseCache(300); // 5分钟缓存

// 定期清理缓存
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    responseCache.cleanup();
  }, 300000); // 每5分钟清理一次
}
