/**
 * Cloudflare Worker for serving static frontend files
 * Serves the AI Search frontend at https://search.tsaitang.workers.dev
 */

// 导入前端文件内容
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
        // 配置 - 使用API后端Worker
        const WORKER_API_URL = "https://api.search.tsaitang.workers.dev";

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

        // 事件监听器
        document.addEventListener('DOMContentLoaded', () => {
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
                max_tokens: parseInt(document.getElementById('maxTokens').value),
                temperature: parseFloat(document.getElementById('temperature').value),
                retrieval_mode: document.getElementById('retrievalMode').value
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

export default {
  async fetch(request, env, ctx) {
    // 处理CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
      });
    }

    // 服务HTML页面
    if (request.method === "GET") {
      return new Response(HTML_CONTENT, {
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "public, max-age=3600",
        }
      });
    }

    return new Response("Method not allowed", { status: 405 });
  }
};
