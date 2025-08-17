/**
 * Cloudflare Worker for interacting with AutoRAG API
 */

// 配置您的AutoRAG API URL和密钥
const AUTO_RAG_API_URL = "https://your-autorag-api.workers.dev";
const API_KEY = "YOUR_API_KEY"; // 请替换为您的实际API密钥

// 本地开发模拟响应
const MOCK_RESPONSE = {
  answer: "这是一个模拟的AutoRAG响应。在本地开发环境中，您看到的是测试数据。请配置实际的AutoRAG API URL和密钥以获取真实结果。",
  sources: [
    "模拟数据源 1",
    "模拟数据源 2",
    "模拟数据源 3"
  ]
};

export default {
  async fetch(request, env, ctx) {
    // 处理CORS
    if (request.method === "OPTIONS") {
      return handleCORS();
    }

    // 只接受POST请求
    if (request.method !== "POST") {
      return new Response("只接受POST请求", { status: 405 });
    }

    try {
      // 解析请求体
      const { query, options } = await request.json();
      
      if (!query) {
        return new Response(JSON.stringify({ error: "查询内容不能为空" }), {
          status: 400,
          headers: corsHeaders()
        });
      }

      // 构建请求AutoRAG API的参数
      const autoRagRequest = {
        query: query,
        options: options || {}
      };

      // 如果配置了真实的API URL，调用实际的AutoRAG API
      if (AUTO_RAG_API_URL !== "https://your-autorag-api.workers.dev" && API_KEY !== "YOUR_API_KEY") {
        // 调用AutoRAG API
        const response = await fetch(AUTO_RAG_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
          },
          body: JSON.stringify(autoRagRequest)
        });

        // 获取API响应
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: corsHeaders()
        });
      } else {
        // 返回模拟数据用于本地开发
        console.log("使用模拟数据，查询:", query);
        return new Response(JSON.stringify(MOCK_RESPONSE), {
          headers: corsHeaders()
        });
      }
    } catch (error) {
      // 处理错误
      console.error("处理请求时出错:", error);
      return new Response(JSON.stringify({ error: "处理请求时出错" }), {
        status: 500,
        headers: corsHeaders()
      });
    }
  }
};

// 处理CORS预检请求
function handleCORS() {
  return new Response(null, {
    headers: corsHeaders()
  });
}

// 设置CORS头
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
  };
}
