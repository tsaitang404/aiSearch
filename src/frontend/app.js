/**
 * NeoAI 前端JavaScript
 * @version 1.0.0
 */

// 全局变量
let isLoading = false;
let currentSettings = {
    useAutoRAG: true,
    fallbackModel: '@cf/meta/llama-2-7b-chat-int8',
    temperature: 0.7,
    maxTokens: 500
};

// DOM元素引用
let chatMessages, chatInput, sendBtn, typingIndicator;
let settingsPanel, settingsBtn, closeSettingsBtn, settingsOverlay;
let currentModelBadge, useAutoRAGSelect, fallbackModelSelect;
let temperatureSlider, temperatureValue, maxTokensInput;

/**
 * 初始化应用
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    loadSettings();
    loadModels();
    setupAutoResize();
});

/**
 * 初始化DOM元素引用
 */
function initializeElements() {
    chatMessages = document.getElementById('chatMessages');
    chatInput = document.getElementById('chatInput');
    sendBtn = document.getElementById('sendBtn');
    typingIndicator = document.getElementById('typingIndicator');
    
    settingsPanel = document.getElementById('settingsPanel');
    settingsBtn = document.getElementById('settingsBtn');
    closeSettingsBtn = document.getElementById('closeSettingsBtn');
    settingsOverlay = document.getElementById('settingsOverlay');
    
    currentModelBadge = document.getElementById('currentModelBadge');
    useAutoRAGSelect = document.getElementById('useAutoRAG');
    fallbackModelSelect = document.getElementById('fallbackModel');
    temperatureSlider = document.getElementById('temperature');
    temperatureValue = document.getElementById('temperatureValue');
    maxTokensInput = document.getElementById('maxTokens');
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    // 发送按钮点击事件
    sendBtn.addEventListener('click', handleSendMessage);
    
    // 回车键发送消息
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    // 设置面板事件
    settingsBtn.addEventListener('click', openSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);
    settingsOverlay.addEventListener('click', closeSettings);
    
    // 设置变更事件
    useAutoRAGSelect.addEventListener('change', updateSettings);
    fallbackModelSelect.addEventListener('change', updateSettings);
    temperatureSlider.addEventListener('input', updateTemperature);
    maxTokensInput.addEventListener('change', updateSettings);
}

/**
 * 设置输入框自动调整高度
 */
function setupAutoResize() {
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
}

/**
 * 处理发送消息
 */
async function handleSendMessage() {
    const message = chatInput.value.trim();
    if (!message || isLoading) return;
    
    // 禁用输入和按钮
    setLoading(true);
    
    // 添加用户消息
    addMessage('user', message);
    
    // 清空输入框
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // 显示打字指示器
    showTypingIndicator();
    
    try {
        // 发送API请求
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                useAutoRAG: currentSettings.useAutoRAG,
                fallbackModel: currentSettings.fallbackModel,
                temperature: currentSettings.temperature,
                maxTokens: currentSettings.maxTokens
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // 添加AI回复
            addMessage('assistant', data.response, data.sources, data.model);
            updateModelBadge(data.model);
        } else {
            // 显示错误消息
            addMessage('assistant', `抱歉，处理您的请求时出现了错误：${data.error}`, [], '错误');
        }
        
    } catch (error) {
        console.error('发送消息失败:', error);
        addMessage('assistant', '抱歉，网络连接出现问题，请稍后再试。', [], '错误');
    }
    
    // 隐藏打字指示器
    hideTypingIndicator();
    
    // 重新启用输入
    setLoading(false);
}

/**
 * 添加消息到聊天界面
 */
function addMessage(role, content, sources = [], model = '') {
    // 移除欢迎消息
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? '您' : 'AI';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // 处理消息内容（支持简单的Markdown）
    const processedContent = processMessageContent(content);
    messageContent.innerHTML = processedContent;
    
    // 添加时间戳
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    messageDiv.appendChild(avatar);
    const contentWrapper = document.createElement('div');
    contentWrapper.appendChild(messageContent);
    contentWrapper.appendChild(timeDiv);
    
    // 添加来源信息（如果有）
    if (sources && sources.length > 0) {
        const sourcesDiv = document.createElement('div');
        sourcesDiv.className = 'message-sources';
        sourcesDiv.innerHTML = `
            <strong>参考来源:</strong>
            <ul>
                ${sources.map(source => `<li>${escapeHtml(source)}</li>`).join('')}
            </ul>
        `;
        contentWrapper.appendChild(sourcesDiv);
    }
    
    messageDiv.appendChild(contentWrapper);
    chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    scrollToBottom();
}

/**
 * 处理消息内容（简单的Markdown支持）
 */
function processMessageContent(content) {
    return escapeHtml(content)
        .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
        .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\\n/g, '<br>');
}

/**
 * HTML转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 显示打字指示器
 */
function showTypingIndicator() {
    typingIndicator.classList.add('show');
    scrollToBottom();
}

/**
 * 隐藏打字指示器
 */
function hideTypingIndicator() {
    typingIndicator.classList.remove('show');
}

/**
 * 滚动到底部
 */
function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

/**
 * 设置加载状态
 */
function setLoading(loading) {
    isLoading = loading;
    sendBtn.disabled = loading;
    chatInput.disabled = loading;
    
    if (loading) {
        chatInput.placeholder = '正在处理中...';
        sendBtn.style.opacity = '0.6';
    } else {
        chatInput.placeholder = '输入您的消息...';
        sendBtn.style.opacity = '1';
        chatInput.focus();
    }
}

/**
 * 更新模型标识
 */
function updateModelBadge(model) {
    if (!currentModelBadge) return;
    
    currentModelBadge.textContent = model === 'AutoRAG' ? 'AutoRAG' : getModelDisplayName(model);
    currentModelBadge.className = 'model-badge ' + (model === 'AutoRAG' ? '' : 'fallback');
}

/**
 * 获取模型显示名称
 */
function getModelDisplayName(model) {
    const displayNames = {
        '@cf/meta/llama-2-7b-chat-int8': 'Llama 2 7B',
        '@cf/microsoft/DialoGPT-medium': 'DialoGPT',
        '@cf/huggingface/CodeBERTa-small-v1': 'CodeBERTa'
    };
    return displayNames[model] || model.split('/').pop();
}

/**
 * 打开设置面板
 */
function openSettings() {
    settingsPanel.classList.add('show');
    settingsOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

/**
 * 关闭设置面板
 */
function closeSettings() {
    settingsPanel.classList.remove('show');
    settingsOverlay.classList.remove('show');
    document.body.style.overflow = '';
}

/**
 * 更新温度值显示
 */
function updateTemperature() {
    const value = temperatureSlider.value;
    temperatureValue.textContent = value;
    currentSettings.temperature = parseFloat(value);
    saveSettings();
}

/**
 * 更新设置
 */
function updateSettings() {
    currentSettings.useAutoRAG = useAutoRAGSelect.value === 'true';
    currentSettings.fallbackModel = fallbackModelSelect.value;
    currentSettings.maxTokens = parseInt(maxTokensInput.value);
    
    saveSettings();
    updateModelBadge(currentSettings.useAutoRAG ? 'AutoRAG' : currentSettings.fallbackModel);
}

/**
 * 加载设置
 */
function loadSettings() {
    try {
        const saved = localStorage.getItem('neoai-settings');
        if (saved) {
            currentSettings = { ...currentSettings, ...JSON.parse(saved) };
        }
    } catch (error) {
        console.warn('加载设置失败:', error);
    }
    
    // 应用到UI
    if (useAutoRAGSelect) useAutoRAGSelect.value = currentSettings.useAutoRAG.toString();
    if (fallbackModelSelect) fallbackModelSelect.value = currentSettings.fallbackModel;
    if (temperatureSlider) {
        temperatureSlider.value = currentSettings.temperature;
        temperatureValue.textContent = currentSettings.temperature;
    }
    if (maxTokensInput) maxTokensInput.value = currentSettings.maxTokens;
    
    updateModelBadge(currentSettings.useAutoRAG ? 'AutoRAG' : currentSettings.fallbackModel);
}

/**
 * 保存设置
 */
function saveSettings() {
    try {
        localStorage.setItem('neoai-settings', JSON.stringify(currentSettings));
    } catch (error) {
        console.warn('保存设置失败:', error);
    }
}

/**
 * 加载可用模型
 */
async function loadModels() {
    try {
        const response = await fetch('/api/models');
        if (response.ok) {
            const data = await response.json();
            updateModelOptions(data.models || []);
        }
    } catch (error) {
        console.warn('加载模型列表失败:', error);
    }
}

/**
 * 更新模型选项
 */
function updateModelOptions(models) {
    if (!fallbackModelSelect) return;
    
    // 清空现有选项
    fallbackModelSelect.innerHTML = '';
    
    // 添加模型选项
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.name || model;
        option.textContent = getModelDisplayName(model.name || model);
        if (model.available === false) {
            option.textContent += ' (不可用)';
            option.disabled = true;
        }
        fallbackModelSelect.appendChild(option);
    });
    
    // 设置当前选中的模型
    if (currentSettings.fallbackModel) {
        fallbackModelSelect.value = currentSettings.fallbackModel;
    }
    
    // 更新状态显示
    const statusDiv = fallbackModelSelect.parentElement.querySelector('.model-status');
    if (statusDiv) {
        const availableCount = models.filter(m => m.available !== false).length;
        statusDiv.textContent = `找到 ${models.length} 个模型，其中 ${availableCount} 个可用`;
    }
}
