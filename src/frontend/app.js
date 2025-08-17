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
let scrollToBottomBtn, modelIndicator, modelSwitchModal, closeModelSwitchBtn;

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
    
    // 回到底部按钮
    scrollToBottomBtn = document.getElementById('scrollToBottomBtn');
    
    // 模型切换相关元素
    modelIndicator = document.querySelector('.model-indicator');
    modelSwitchModal = document.getElementById('modelSwitchModal');
    closeModelSwitchBtn = document.getElementById('closeModelSwitchBtn');
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
    
    // 回到底部按钮事件
    scrollToBottomBtn.addEventListener('click', scrollToBottomSmooth);
    
    // 监听聊天区域滚动事件，控制按钮显示
    chatMessages.addEventListener('scroll', handleChatScroll);
    
    // 模型指示器点击事件
    modelIndicator.addEventListener('click', showModelSwitchModal);
    
    // 模型切换弹窗事件
    closeModelSwitchBtn.addEventListener('click', closeModelSwitchModal);
    modelSwitchModal.addEventListener('click', function(e) {
        if (e.target === modelSwitchModal) {
            closeModelSwitchModal();
        }
    });
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

/**
 * 处理聊天区域滚动事件
 */
function handleChatScroll() {
    if (!scrollToBottomBtn || !chatMessages) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatMessages;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 距离底部100px内算作在底部
    
    if (isNearBottom) {
        scrollToBottomBtn.classList.remove('show');
    } else {
        scrollToBottomBtn.classList.add('show');
    }
}

/**
 * 通过按钮滚动到底部（平滑滚动）
 */
function scrollToBottomSmooth() {
    if (!chatMessages) return;
    
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
    
    // 隐藏回到底部按钮
    if (scrollToBottomBtn) {
        scrollToBottomBtn.classList.remove('show');
    }
}

/**
 * 显示模型切换弹窗
 */
async function showModelSwitchModal() {
    modelSwitchModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    await generateModelOptions();
}

/**
 * 关闭模型切换弹窗
 */
function closeModelSwitchModal() {
    modelSwitchModal.classList.remove('show');
    document.body.style.overflow = '';
}

/**
 * 生成模型选项
 */
async function generateModelOptions() {
    const optionsContainer = document.getElementById('modelSwitchOptions');
    if (!optionsContainer) return;

    // 显示加载状态
    optionsContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #64748b;">正在加载模型列表...</div>';

    try {
        // 获取可用模型列表
        const response = await fetch('/api/models');
        let availableModels = [];
        
        if (response.ok) {
            const data = await response.json();
            availableModels = data.models || [];
        }

        // 构建模型列表（始终包含AutoRAG）
        const models = [
            {
                name: 'AutoRAG',
                desc: '智能检索增强生成',
                type: 'AutoRAG',
                available: true
            },
            ...availableModels.map(model => ({
                name: getModelDisplayName(model.name || model),
                desc: getModelDescription(model.name || model),
                type: model.name || model,
                available: model.available !== false
            }))
        ];

        const currentModel = getActiveModel();

        optionsContainer.innerHTML = models.map(model => {
            const features = getModelFeatures(model.type);
            const featureHtml = features.map(feature => `<span class="model-feature-tag">${feature}</span>`).join('');
            
            return `
            <div class="model-option ${currentModel === model.type ? 'active' : ''} ${!model.available ? 'disabled' : ''}" 
                 data-model="${model.type}" 
                 onclick="${model.available ? `selectModel('${model.type}')` : ''}">
                <div class="model-option-info">
                    <div class="model-option-name">${model.name}</div>
                    <div class="model-option-desc">${model.desc}</div>
                    <div class="model-features">
                        ${featureHtml}
                    </div>
                </div>
                <div class="model-option-badge">
                    ${model.available ? '可用' : '不可用'}
                </div>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.warn('加载模型列表失败:', error);
        // 如果API调用失败，显示基本模型选项
        const fallbackModels = [
            {
                name: 'AutoRAG',
                desc: '智能检索增强生成',
                type: 'AutoRAG',
                available: true
            },
            {
                name: 'Llama 2 7B',
                desc: 'Meta开源大语言模型',
                type: '@cf/meta/llama-2-7b-chat-int8',
                available: true
            }
        ];

        const currentModel = getActiveModel();
        optionsContainer.innerHTML = fallbackModels.map(model => {
            const features = getModelFeatures(model.type);
            const featureHtml = features.map(feature => `<span class="model-feature-tag">${feature}</span>`).join('');
            
            return `
            <div class="model-option ${currentModel === model.type ? 'active' : ''}" 
                 data-model="${model.type}" 
                 onclick="selectModel('${model.type}')">
                <div class="model-option-info">
                    <div class="model-option-name">${model.name}</div>
                    <div class="model-option-desc">${model.desc}</div>
                    <div class="model-features">
                        ${featureHtml}
                    </div>
                </div>
                <div class="model-option-badge">可用</div>
            </div>
            `;
        }).join('');
    }
}

/**
 * 获取模型显示名称
 */
function getModelDisplayName(modelType) {
    const modelNames = {
        'AutoRAG': 'AutoRAG',
        '@cf/meta/llama-2-7b-chat-int8': 'Llama 2 7B',
        '@cf/mistral/mistral-7b-instruct-v0.1': 'Mistral 7B',
        '@cf/google/gemma-2b-it': 'Gemma 2B',
        '@cf/microsoft/phi-2': 'Phi-2',
        '@cf/openchat/openchat-3.5-0106': 'OpenChat 3.5',
        '@cf/tiiuae/falcon-7b-instruct': 'Falcon 7B',
        '@cf/thebloke/codellama-7b-instruct-awq': 'CodeLlama 7B'
    };
    return modelNames[modelType] || modelType;
}

/**
 * 获取模型描述
 */
function getModelDescription(modelType) {
    const modelDescriptions = {
        'AutoRAG': '智能检索增强生成',
        '@cf/meta/llama-2-7b-chat-int8': 'Meta开源大语言模型',
        '@cf/mistral/mistral-7b-instruct-v0.1': 'Mistral AI 指令调优模型',
        '@cf/google/gemma-2b-it': 'Google Gemma 轻量级模型',
        '@cf/microsoft/phi-2': 'Microsoft 高效小型模型',
        '@cf/openchat/openchat-3.5-0106': 'OpenChat 开源对话模型',
        '@cf/tiiuae/falcon-7b-instruct': 'TII UAE Falcon 指令模型',
        '@cf/thebloke/codellama-7b-instruct-awq': 'CodeLlama 代码生成模型',
        '@cf/meta/llama-3.1-8b-instruct': 'Llama 3.1 8B 指令模型',
        '@cf/meta/llama-3-8b-instruct': 'Llama 3 8B 指令模型',
        '@cf/stability-ai/stable-diffusion-xl-base-1.0': 'Stable Diffusion XL 图像生成',
        '@cf/black-forest-labs/flux-1-schnell': 'Flux 快速图像生成',
        '@cf/lykon/dreamshaper-8-lcm': 'DreamShaper 图像生成',
        '@cf/runwayml/stable-diffusion-v1-5-img2img': 'Stable Diffusion 图像转换',
        '@cf/huggingface/CodeBERTa-small-v1': 'CodeBERTa 代码理解',
        '@cf/openai/whisper-tiny.en': 'Whisper 语音识别'
    };
    return modelDescriptions[modelType] || '大语言模型';
}

/**
 * 获取模型特性标签
 */
function getModelFeatures(modelType) {
    const modelFeatures = {
        'AutoRAG': ['智能检索', 'RAG增强', '知识库'],
        '@cf/meta/llama-2-7b-chat-int8': ['对话', '通用'],
        '@cf/mistral/mistral-7b-instruct-v0.1': ['指令优化', '推理'],
        '@cf/google/gemma-2b-it': ['轻量级', '快速'],
        '@cf/microsoft/phi-2': ['小型', '高效', '推理'],
        '@cf/openchat/openchat-3.5-0106': ['开源', '对话'],
        '@cf/tiiuae/falcon-7b-instruct': ['指令'],
        '@cf/thebloke/codellama-7b-instruct-awq': ['代码生成', '编程', '函数调用'],
        '@cf/meta/llama-3.1-8b-instruct': ['深度思考', '推理', '函数调用'],
        '@cf/meta/llama-3-8b-instruct': ['推理', '对话'],
        '@cf/stability-ai/stable-diffusion-xl-base-1.0': ['图像生成', '多模态', 'SDXL'],
        '@cf/black-forest-labs/flux-1-schnell': ['图像生成', '快速', '高质量'],
        '@cf/lykon/dreamshaper-8-lcm': ['图像生成', '艺术风格'],
        '@cf/runwayml/stable-diffusion-v1-5-img2img': ['图像转换', '图像编辑', '多模态'],
        '@cf/huggingface/CodeBERTa-small-v1': ['代码理解', '语义分析'],
        '@cf/openai/whisper-tiny.en': ['语音识别', '多模态', '英文']
    };
    return modelFeatures[modelType] || ['通用'];
}

/**
 * 获取当前激活的模型
 */
function getActiveModel() {
    return currentSettings.useAutoRAG ? 'AutoRAG' : currentSettings.fallbackModel;
}

/**
 * 选择模型
 */
function selectModel(modelType) {
    if (modelType === 'AutoRAG') {
        currentSettings.useAutoRAG = true;
    } else {
        currentSettings.useAutoRAG = false;
        currentSettings.fallbackModel = modelType;
    }

    // 更新设置UI
    if (useAutoRAGSelect) useAutoRAGSelect.value = currentSettings.useAutoRAG.toString();
    if (fallbackModelSelect) fallbackModelSelect.value = currentSettings.fallbackModel;

    // 更新模型标识
    updateModelBadge(modelType === 'AutoRAG' ? 'AutoRAG' : modelType);

    // 保存设置
    saveSettings();

    // 关闭弹窗
    closeModelSwitchModal();
}
