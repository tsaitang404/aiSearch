/**
 * 性能监控和优化工具
 * @version 1.0.0
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      averageResponseTime: 0,
      lastReset: Date.now()
    };
  }

  // 记录请求开始时间
  startRequest() {
    return Date.now();
  }

  // 记录请求完成
  endRequest(startTime, success = true) {
    const responseTime = Date.now() - startTime;
    this.metrics.requests++;
    
    if (!success) {
      this.metrics.errors++;
    }

    // 更新平均响应时间
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.requests - 1) + responseTime) 
      / this.metrics.requests;
  }

  // 获取性能报告
  getReport() {
    const uptime = Date.now() - this.metrics.lastReset;
    return {
      ...this.metrics,
      uptime: uptime,
      errorRate: this.metrics.requests > 0 ? 
        (this.metrics.errors / this.metrics.requests * 100).toFixed(2) + '%' : '0%',
      requestsPerMinute: this.metrics.requests / (uptime / 60000)
    };
  }

  // 重置指标
  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      averageResponseTime: 0,
      lastReset: Date.now()
    };
  }
}

// 创建全局实例
const performanceMonitor = new PerformanceMonitor();

export { PerformanceMonitor, performanceMonitor };
