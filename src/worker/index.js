/**
 * Cloudflare Worker for AI Search API
 */

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

      // 使用Cloudflare Workers AI
      if (env.AI) {
        console.log("调用Cloudflare Workers AI，查询:", query);
        
        try {
          // 先尝试AutoRAG（如果可用）
          let answer;
          try {
            answer = await env.AI.autorag("jolly-water-bbff").aiSearch({
              query: query,
              // 可以添加其他选项参数
              ...options
            });
          } catch (autoragError) {
            console.log("AutoRAG不可用，使用标准AI模型:", autoragError.message);
            
            // 如果AutoRAG不可用，使用标准的LLM模型
            const response = await env.AI.run("@cf/meta/llama-2-7b-chat-int8", {
              messages: [
                {
                  role: "system",
                  content: "你是一个智能搜索助手，请根据用户的查询提供有用的回答。"
                },
                {
                  role: "user", 
                  content: query
                }
              ]
            });
            
            answer = {
              answer: response.response || "抱歉，无法生成回答",
              sources: ["基于AI生成的回答"]
            };
          }

          return new Response(JSON.stringify(answer), {
            headers: corsHeaders()
          });
        } catch (aiError) {
          console.error("AI调用失败:", aiError);
          
          // 如果所有AI调用都失败，返回友好的错误信息
          return new Response(JSON.stringify({ 
            error: "AI服务暂时不可用，请稍后重试",
            details: aiError.message
          }), {
            status: 500,
            headers: corsHeaders()
          });
        }
      } else {
        // 如果没有AI绑定，返回模拟数据（用于开发测试）
        console.log("使用模拟数据，查询:", query);
        const mockResponse = {
          answer: "这是一个模拟的AutoRAG响应。请确保Worker已正确配置AI绑定以使用真实的AutoRAG服务。",
          sources: [
            "模拟数据源 1",
            "模拟数据源 2", 
            "模拟数据源 3"
          ]
        };
        
        return new Response(JSON.stringify(mockResponse), {
          headers: corsHeaders()
        });
      }
    } catch (error) {
      // 处理错误
      console.error("处理请求时出错:", error);
      return new Response(JSON.stringify({ 
        error: "处理请求时出错",
        details: error.message 
      }), {
        status: 500,
        headers: corsHeaders()
      });
    }
  }
};
