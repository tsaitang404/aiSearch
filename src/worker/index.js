/**
 * Cloudflare Worker for AI Search - 单Worker架构
 * 同时提供前端页面和API服务
 * @version 1.0.0
 * @author AI Search Team
 */

// 配置常量
const CONFIG = {
  AUTO_RAG_INSTANCE: "jolly-water-bbff",
  LLM_MODEL: "@cf/meta/llama-2-7b-chat-int8",
  MAX_REQUEST_SIZE: 1024 * 1024, // 1MB
  CACHE_TTL: 3600, // 1 hour
  // 可用的回落模型列表
  FALLBACK_MODELS: {
    "@cf/meta/llama-2-7b-chat-int8": "Llama 2 7B (默认)",
    "@cf/mistral/mistral-7b-instruct-v0.1": "Mistral 7B Instruct",
    "@cf/meta/llama-2-7b-chat-fp16": "Llama 2 7B FP16",
    "@cf/microsoft/phi-2": "Microsoft Phi-2",
    "@cf/qwen/qwen1.5-0.5b-chat": "Qwen 1.5 0.5B Chat",
    "@cf/qwen/qwen1.5-1.8b-chat": "Qwen 1.5 1.8B Chat",
    "@cf/qwen/qwen1.5-7b-chat-awq": "Qwen 1.5 7B Chat AWQ"
  }
};

// HTML内容
const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Search 智能搜索</title>
    <style>
        /* 基本样式设置 */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f7fa;
        }

        .container {
            max-width: 900px;
            margin: 40px auto;
            padding: 20px;
        }

        h1 {
            text-align: center;
            margin-bottom: 30px;
            color: #1e40af;
        }

        h2, h3 {
            margin-bottom: 15px;
            color: #1e40af;
        }

        /* 搜索区域样式 */
        .search-container {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-bottom: 30px;
        }

        textarea {
            padding: 15px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 16px;
            min-height: 120px;
            resize: vertical;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            outline: none;
            transition: border-color 0.3s;
        }

        textarea:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        button {
            padding: 12px 20px;
            background-color: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        button:hover {
            background-color: #1d4ed8;
        }

        button:disabled {
            background-color: #93c5fd;
            cursor: not-allowed;
        }

        /* 选项区域样式 */
        .options-container {
            background-color: #fff;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .toggle-options {
            color: #3b82f6;
            cursor: pointer;
            font-size: 14px;
            font-weight: normal;
        }

        .options-panel {
            margin-top: 15px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }

        .option-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .option-group label {
            font-size: 14px;
            font-weight: 500;
            color: #4b5563;
        }

        .option-group input, .option-group select {
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
        }

        .option-group input[type="range"] {
            padding: 0;
        }

        /* 模型状态显示样式 */
        .model-status {
            margin-top: 4px;
            padding: 2px 6px;
            background-color: #f3f4f6;
            border-radius: 3px;
            display: inline-block;
        }

        /* 结果区域样式 */
        .results-container {
            background-color: #fff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .answer-container {
            background-color: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 0 8px 8px 0;
            line-height: 1.7;
        }

        .sources-container {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }

        .sources-container ul {
            list-style: none;
            margin-left: 10px;
        }

        .sources-container li {
            padding: 8px 0;
            font-size: 14px;
            color: #4b5563;
            display: flex;
            align-items: flex-start;
        }

        .sources-container li:before {
            content: "•";
            color: #3b82f6;
            font-weight: bold;
            margin-right: 10px;
        }

        /* 模型信息显示 */
        .model-info {
            background-color: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 8px 12px;
            margin-bottom: 15px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .model-label {
            font-weight: 500;
            color: #0369a1;
        }

        .model-name {
            background-color: #0ea5e9;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }

        .model-name.fallback {
            background-color: #f59e0b;
        }

        /* 加载指示器 */
        .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(59, 130, 246, 0.2);
            border-radius: 50%;
            border-top-color: #3b82f6;
            animation: spin 1s ease-in-out infinite;
            margin-bottom: 15px;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        /* 辅助类 */
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI Search 智能搜索</h1>
        <div class="search-container">
            <textarea id="queryInput" placeholder="输入您的问题..."></textarea>
            <button id="submitBtn">提交查询</button>
        </div>
        
        <div class="options-container">
            <h3>高级选项 <span class="toggle-options">(展开)</span></h3>
            <div class="options-panel hidden">
                <div class="option-group">
                    <label for="useAutoRAG">使用AutoRAG:</label>
                    <select id="useAutoRAG">
                        <option value="true">是 (优先使用AutoRAG)</option>
                        <option value="false">否 (直接使用回落模型)</option>
                    </select>
                </div>
                <div class="option-group">
                    <label for="fallbackModel">回落模型选择:</label>
                    <select id="fallbackModel">
                        <option value="@cf/meta/llama-2-7b-chat-int8">Llama 2 7B (默认)</option>
                        <option value="@cf/mistral/mistral-7b-instruct-v0.1">Mistral 7B Instruct</option>
                        <option value="@cf/meta/llama-2-7b-chat-fp16">Llama 2 7B FP16</option>
                        <option value="@cf/microsoft/phi-2">Microsoft Phi-2</option>
                        <option value="@cf/qwen/qwen1.5-0.5b-chat">Qwen 1.5 0.5B Chat</option>
                        <option value="@cf/qwen/qwen1.5-1.8b-chat">Qwen 1.5 1.8B Chat</option>
                        <option value="@cf/qwen/qwen1.5-7b-chat-awq">Qwen 1.5 7B Chat AWQ</option>
                    </select>
                </div>
                <div class="option-group">
                    <label for="maxTokens">最大生成令牌数:</label>
                    <input type="number" id="maxTokens" value="500" min="1" max="2000">
                </div>
                <div class="option-group">
                    <label for="temperature">温度 (创造性):</label>
                    <input type="range" id="temperature" min="0" max="1" step="0.1" value="0.7">
                    <span id="temperatureValue">0.7</span>
                </div>
                <div class="option-group">
                    <label for="retrievalMode">检索模式:</label>
                    <select id="retrievalMode">
                        <option value="hybrid">混合检索</option>
                        <option value="semantic">语义检索</option>
                        <option value="keyword">关键词检索</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="results-container hidden" id="resultsContainer">
            <h2>查询结果</h2>
            <div class="model-info" id="modelInfo">
                <span class="model-label">使用模型:</span>
                <span class="model-name" id="currentModel">AutoRAG</span>
            </div>
            <div class="loading hidden" id="loadingIndicator">
                <div class="spinner"></div>
                <p>正在处理您的查询...</p>
            </div>
            <div class="answer-container" id="answerContainer"></div>
            <div class="sources-container" id="sourcesContainer">
                <h3>参考来源</h3>
                <ul id="sourcesList"></ul>
            </div>
        </div>
    </div>
    
    <script>
        // 配置 - 使用当前页面域名的API
        const WORKER_API_URL = window.location.origin + "/api";

        // DOM元素
        const queryInput = document.getElementById('queryInput');
        const submitBtn = document.getElementById('submitBtn');
        const resultsContainer = document.getElementById('resultsContainer');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const answerContainer = document.getElementById('answerContainer');
        const sourcesList = document.getElementById('sourcesList');
        const toggleOptions = document.querySelector('.toggle-options');
        const optionsPanel = document.querySelector('.options-panel');
        const temperatureSlider = document.getElementById('temperature');
        const temperatureValue = document.getElementById('temperatureValue');
        const fallbackModelSelect = document.getElementById('fallbackModel');

        // 动态获取可用模型
        async function loadAvailableModels() {
            try {
                console.log('正在获取可用模型列表...');
                const response = await fetch(window.location.origin + '/api/models');
                const data = await response.json();
                
                if (data.models) {
                    // 清空现有选项
                    fallbackModelSelect.innerHTML = '';
                    
                    // 添加新的模型选项
                    Object.entries(data.models).forEach(([modelId, modelName]) => {
                        const option = document.createElement('option');
                        option.value = modelId;
                        option.textContent = modelName;
                        fallbackModelSelect.appendChild(option);
                    });
                    
                    console.log('已加载 ' + Object.keys(data.models).length + ' 个可用模型 (' + data.source + ')');
                    
                    // 添加模型获取状态显示
                    const modelStatus = document.createElement('small');
                    modelStatus.style.color = '#666';
                    modelStatus.style.fontSize = '12px';
                    modelStatus.textContent = data.source === 'dynamic' ? 
                        '✅ 已动态检测可用模型' : '⚠️ 使用预设模型列表';
                    
                    // 将状态显示添加到回落模型选择器后面
                    const modelGroup = fallbackModelSelect.parentElement;
                    const existingStatus = modelGroup.querySelector('.model-status');
                    if (existingStatus) {
                        existingStatus.remove();
                    }
                    modelStatus.className = 'model-status';
                    modelGroup.appendChild(modelStatus);
                    
                } else if (data.error) {
                    console.warn('获取模型列表失败:', data.error);
                }
            } catch (error) {
                console.error('获取模型列表时发生错误:', error);
                // 保持默认的静态模型列表
            }
        }

        // 事件监听器
        document.addEventListener('DOMContentLoaded', () => {
            // 加载可用模型
            loadAvailableModels();
            
            // 选项面板切换
            toggleOptions.addEventListener('click', () => {
                optionsPanel.classList.toggle('hidden');
                toggleOptions.textContent = optionsPanel.classList.contains('hidden') ? '(展开)' : '(收起)';
            });

            // 温度滑块更新显示值
            temperatureSlider.addEventListener('input', () => {
                temperatureValue.textContent = temperatureSlider.value;
            });

            // 提交查询
            submitBtn.addEventListener('click', handleSubmit);
            queryInput.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    handleSubmit();
                }
            });
        });

        // 处理查询提交
        async function handleSubmit() {
            const query = queryInput.value.trim();
            
            if (!query) {
                alert('请输入查询内容');
                return;
            }
            
            // 获取高级选项
            const options = {
                use_autorag: document.getElementById('useAutoRAG').value === 'true',
                max_tokens: parseInt(document.getElementById('maxTokens').value),
                temperature: parseFloat(document.getElementById('temperature').value),
                retrieval_mode: document.getElementById('retrievalMode').value,
                fallback_model: document.getElementById('fallbackModel').value
            };
            
            // 显示加载状态
            setLoading(true);
            
            try {
                const response = await fetchAutoRagResults(query, options);
                displayResults(response);
            } catch (error) {
                handleError(error);
            } finally {
                setLoading(false);
            }
        }

        // 调用AutoRAG API
        async function fetchAutoRagResults(query, options) {
            try {
                const response = await fetch(WORKER_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query, options })
                });
                
                if (!response.ok) {
                    throw new Error(\`API请求失败: \${response.status} \${response.statusText}\`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('API请求错误:', error);
                throw error;
            }
        }

        // 显示结果
        function displayResults(data) {
            // 显示结果容器
            resultsContainer.classList.remove('hidden');
            
            // 显示当前使用的模型
            const currentModelElement = document.getElementById('currentModel');
            if (data.model_used) {
                if (data.model_used === 'autorag') {
                    currentModelElement.textContent = 'AutoRAG';
                    currentModelElement.className = 'model-name';
                } else if (data.model_used === 'mock_autorag') {
                    currentModelElement.textContent = 'AutoRAG (模拟)';
                    currentModelElement.className = 'model-name';
                } else {
                    // 尝试从下拉选项中获取模型显示名称
                    const modelOption = fallbackModelSelect.querySelector(\`option[value="\${data.model_used}"]\`);
                    const displayName = modelOption ? modelOption.textContent : data.model_used.replace('@cf/', '');
                    
                    currentModelElement.textContent = displayName;
                    currentModelElement.className = 'model-name fallback';
                }
            } else {
                currentModelElement.textContent = '未知';
                currentModelElement.className = 'model-name';
            }
            
            // 显示回答
            if (data.answer || data.response) {
                answerContainer.innerHTML = formatAnswer(data.answer || data.response);
            } else {
                answerContainer.innerHTML = '<p>没有找到相关回答。</p>';
            }
            
            // 显示来源
            sourcesList.innerHTML = '';
            if (data.sources && data.sources.length > 0) {
                data.sources.forEach(source => {
                    const li = document.createElement('li');
                    li.textContent = formatSourceItem(source);
                    sourcesList.appendChild(li);
                });
            } else if (data.data && data.data.length > 0) {
                data.data.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = formatSourceItem(item);
                    sourcesList.appendChild(li);
                });
            } else {
                sourcesList.innerHTML = '<li>没有提供参考来源</li>';
            }

            // 滚动到结果区域
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        }

        // 格式化回答内容（支持简单Markdown转换）
        function formatAnswer(text) {
            // 替换Markdown语法为HTML
            return text
                .replace(/\\n\\n/g, '</p><p>')
                .replace(/\\n/g, '<br>')
                .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
                .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
                .replace(/\`\`\`([\\s\\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>')
                .replace(/\`([^\`]+)\`/g, '<code>$1</code>');
        }

        // 格式化来源项
        function formatSourceItem(source) {
            if (typeof source === 'string') {
                return source;
            }
            
            // 假设source是一个对象，包含title、url等属性
            if (source.title) {
                return \`\${source.title}\${source.url ? ' - ' + source.url : ''}\`;
            }
            
            return JSON.stringify(source);
        }

        // 设置加载状态
        function setLoading(isLoading) {
            submitBtn.disabled = isLoading;
            loadingIndicator.classList.toggle('hidden', !isLoading);
            
            if (isLoading) {
                answerContainer.innerHTML = '';
                sourcesList.innerHTML = '';
            }
        }

        // 处理错误
        function handleError(error) {
            console.error('错误:', error);
            resultsContainer.classList.remove('hidden');
            answerContainer.innerHTML = \`
                <p style="color: #e11d48;">发生错误: \${error.message || '未知错误'}</p>
                <p>请检查网络连接并重试，或联系管理员。</p>
            \`;
            sourcesList.innerHTML = '';
        }
    </script>
</body>
</html>`;

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

// 辅助函数：获取模型显示名称
function getModelDisplayName(modelId) {
  const nameMap = {
    "@cf/meta/llama-2-7b-chat-int8": "Llama 2 7B Chat (Int8)",
    "@cf/meta/llama-2-7b-chat-fp16": "Llama 2 7B Chat (FP16)", 
    "@cf/mistral/mistral-7b-instruct-v0.1": "Mistral 7B Instruct",
    "@cf/microsoft/phi-2": "Microsoft Phi-2",
    "@cf/qwen/qwen1.5-0.5b-chat": "Qwen 1.5 0.5B Chat",
    "@cf/qwen/qwen1.5-1.8b-chat": "Qwen 1.5 1.8B Chat",
    "@cf/qwen/qwen1.5-7b-chat-awq": "Qwen 1.5 7B Chat (AWQ)",
    "@cf/qwen/qwen1.5-14b-chat-awq": "Qwen 1.5 14B Chat (AWQ)",
    "@cf/meta/llama-3-8b-instruct": "Llama 3 8B Instruct",
    "@cf/meta/llama-3.1-8b-instruct": "Llama 3.1 8B Instruct",
    "@cf/google/gemma-7b-it": "Google Gemma 7B IT",
    "@cf/openchat/openchat-3.5-0106": "OpenChat 3.5"
  };
  
  return nameMap[modelId] || modelId.replace('@cf/', '').replace('/', ' ');
}

// 辅助函数：获取模型分类
function getModelCategory(modelId) {
  if (modelId.includes('llama')) return 'Meta Llama';
  if (modelId.includes('mistral')) return 'Mistral';
  if (modelId.includes('qwen')) return 'Qwen'; 
  if (modelId.includes('phi')) return 'Microsoft';
  if (modelId.includes('gemma')) return 'Google';
  if (modelId.includes('openchat')) return 'OpenChat';
  return 'Other';
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 处理CORS
    if (request.method === "OPTIONS") {
      return handleCORS();
    }

    // 提供前端页面
    if (request.method === "GET" && url.pathname === "/") {
      return new Response(HTML_CONTENT, {
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "public, max-age=3600",
        }
      });
    }

    // 获取可用模型列表
    if (request.method === "GET" && url.pathname === "/api/models") {
      try {
        let availableModels = {};
        
        if (env.AI) {
          // 尝试获取动态模型列表
          try {
            // 使用一些已知的模型来测试可用性
            const testModels = [
              "@cf/meta/llama-2-7b-chat-int8",
              "@cf/meta/llama-2-7b-chat-fp16", 
              "@cf/mistral/mistral-7b-instruct-v0.1",
              "@cf/microsoft/phi-2",
              "@cf/qwen/qwen1.5-0.5b-chat",
              "@cf/qwen/qwen1.5-1.8b-chat",
              "@cf/qwen/qwen1.5-7b-chat-awq",
              "@cf/qwen/qwen1.5-14b-chat-awq",
              "@cf/meta/llama-3-8b-instruct",
              "@cf/meta/llama-3.1-8b-instruct",
              "@cf/google/gemma-7b-it",
              "@cf/openchat/openchat-3.5-0106"
            ];

            // 并发测试模型可用性（使用简单的模型信息查询）
            const modelTests = await Promise.allSettled(
              testModels.map(async (modelId) => {
                try {
                  // 尝试用一个简单的查询来测试模型是否可用
                  const testResponse = await env.AI.run(modelId, {
                    messages: [{ role: "user", content: "Hi" }],
                    max_tokens: 1
                  });
                  
                  return {
                    id: modelId,
                    name: getModelDisplayName(modelId),
                    available: true,
                    category: getModelCategory(modelId)
                  };
                } catch (error) {
                  return {
                    id: modelId, 
                    name: getModelDisplayName(modelId),
                    available: false,
                    error: error.message,
                    category: getModelCategory(modelId)
                  };
                }
              })
            );

            // 处理测试结果
            modelTests.forEach((result, index) => {
              if (result.status === 'fulfilled') {
                const model = result.value;
                if (model.available) {
                  availableModels[model.id] = model.name;
                }
                console.log(`模型 ${model.id}: ${model.available ? '可用' : '不可用'}`);
              }
            });

          } catch (error) {
            console.error('动态模型检测失败:', error);
            // 如果动态检测失败，使用预设的模型列表
            availableModels = CONFIG.FALLBACK_MODELS;
          }
        } else {
          // 如果没有AI绑定，返回预设的模型列表
          availableModels = CONFIG.FALLBACK_MODELS;
        }

        return new Response(JSON.stringify({
          models: availableModels,
          timestamp: new Date().toISOString(),
          source: env.AI ? 'dynamic' : 'static'
        }), {
          headers: {
            ...corsHeaders(),
            'Cache-Control': 'public, max-age=300' // 缓存5分钟
          }
        });
        
      } catch (error) {
        console.error('获取模型列表失败:', error);
        return new Response(JSON.stringify({ 
          error: "获取模型列表失败",
          models: CONFIG.FALLBACK_MODELS // 返回备用列表
        }), {
          status: 500,
          headers: corsHeaders()
        });
      }
    }

    // API路由
    if (request.method === "POST" && url.pathname === "/api") {
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
          
          // 获取用户选择的回落模型，如果没有选择则使用默认模型
          const fallbackModel = options?.fallback_model || CONFIG.LLM_MODEL;
          const useAutoRAG = options?.use_autorag !== false; // 默认使用AutoRAG
          
          try {
            let answer;
            let modelUsed;
            
            // 根据用户选择决定是否尝试AutoRAG
            if (useAutoRAG) {
              try {
                answer = await env.AI.autorag(CONFIG.AUTO_RAG_INSTANCE).aiSearch({
                  query: query,
                  // 传递其他选项参数（排除fallback_model和use_autorag）
                  ...Object.fromEntries(
                    Object.entries(options || {}).filter(([key]) => 
                      key !== 'fallback_model' && key !== 'use_autorag')
                  )
                });
                
                modelUsed = 'autorag';
                // 为AutoRAG响应添加模型信息
                answer.model_used = modelUsed;
                
              } catch (autoragError) {
                console.log(`AutoRAG不可用，使用回落模型: ${fallbackModel}`, autoragError.message);
                
                // AutoRAG失败，使用回落模型
                modelUsed = fallbackModel;
                const response = await env.AI.run(fallbackModel, {
                  messages: [
                    {
                      role: "system",
                      content: "你是一个智能搜索助手，请根据用户的查询提供有用的回答。"
                    },
                    {
                      role: "user", 
                      content: query
                    }
                  ],
                  // 传递温度和最大token等参数
                  ...(options?.temperature && { temperature: options.temperature }),
                  ...(options?.max_tokens && { max_tokens: options.max_tokens })
                });
                
                answer = {
                  answer: response.response || "抱歉，无法生成回答",
                  sources: [`基于${CONFIG.FALLBACK_MODELS[fallbackModel] || fallbackModel}生成的回答`],
                  model_used: modelUsed
                };
              }
            } else {
              // 用户选择直接使用回落模型
              console.log(`用户选择直接使用回落模型: ${fallbackModel}`);
              modelUsed = fallbackModel;
              
              const response = await env.AI.run(fallbackModel, {
                messages: [
                  {
                    role: "system",
                    content: "你是一个智能搜索助手，请根据用户的查询提供有用的回答。"
                  },
                  {
                    role: "user", 
                    content: query
                  }
                ],
                // 传递温度和最大token等参数
                ...(options?.temperature && { temperature: options.temperature }),
                ...(options?.max_tokens && { max_tokens: options.max_tokens })
              });
              
              answer = {
                answer: response.response || "抱歉，无法生成回答",
                sources: [`基于${CONFIG.FALLBACK_MODELS[fallbackModel] || fallbackModel}生成的回答`],
                model_used: modelUsed
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
            ],
            model_used: 'mock_autorag'
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

    // 返回404对于其他路径
    return new Response("Not Found", { status: 404 });
  }
};
