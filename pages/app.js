// 配置
const WORKER_API_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:8787" 
  : "https://ai-search.tsaitang.workers.dev"; // 生产环境Worker URL

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
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
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
    if (data.answer) {
        answerContainer.innerHTML = formatAnswer(data.answer);
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
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// 格式化来源项
function formatSourceItem(source) {
    if (typeof source === 'string') {
        return source;
    }
    
    // 假设source是一个对象，包含title、url等属性
    if (source.title) {
        return `${source.title}${source.url ? ' - ' + source.url : ''}`;
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
    answerContainer.innerHTML = `
        <p style="color: #e11d48;">发生错误: ${error.message || '未知错误'}</p>
        <p>请检查网络连接并重试，或联系管理员。</p>
    `;
    sourcesList.innerHTML = '';
}
