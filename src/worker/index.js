/**
 * Cloudflare Worker for AI Chat - 单Worker架构
 * 同时提供前端页面和API服务
 * @version 2.0.0
 * @author AI Chat Team
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
    <title>AI Chat 智能对话</title>
    <style>
        /* 基本样式设置 */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: backgroundShift 20s ease-in-out infinite;
        }

        @keyframes backgroundShift {
            0%, 100% { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            50% { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        }

        /* 顶部导航栏 */
                .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            padding: 20px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header h1 {
            margin: 0;
            color: #2d3748;
            font-size: 24px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .header h1::before {
            content: "🤖";
            font-size: 28px;
            animation: bounce 2s infinite;
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-3px); }
            60% { transform: translateY(-2px); }
        }

        .model-indicator {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            color: #4a5568;
            background: rgba(255, 255, 255, 0.8);
            padding: 8px 16px;
            border-radius: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
        }

        .model-indicator:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .model-badge {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
            animation: pulse 3s infinite;
        }

        @keyframes pulse {
            0%, 100% { box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3); }
            50% { box-shadow: 0 2px 15px rgba(76, 175, 80, 0.5); }
        }

        .model-badge.fallback {
            background: linear-gradient(135deg, #FF9800, #f57c00);
            box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
        }        /* 设置按钮 */
        .settings-btn {
            background: rgba(255, 255, 255, 0.9);
            border: none;
            cursor: pointer;
            padding: 12px;
            border-radius: 50%;
            color: #4a5568;
            transition: all 0.3s ease;
            font-size: 16px;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .settings-btn:hover {
            background: rgba(255, 255, 255, 1);
            transform: rotate(90deg) scale(1.1);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }        /* 聊天容器 */
        .chat-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            max-width: 800px;
            margin: 0 auto;
            width: 100%;
            padding: 0 20px;
        }

        /* 聊天消息区域 */
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 20px 0;
            display: flex;
            flex-direction: column;
            gap: 20px;
            min-height: 0; /* 确保flex项可以收缩 */
            max-height: calc(100vh - 200px); /* 限制最大高度，为输入框留空间 */
            scroll-behavior: smooth;
        }

        /* 自定义滚动条样式 */
        .chat-messages::-webkit-scrollbar {
            width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
            transition: background 0.3s ease;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
        }

        /* 消息样式 */
        .message {
            display: flex;
            gap: 15px;
            max-width: 85%;
            animation: messageSlideIn 0.5s ease-out;
            margin-bottom: 24px;
        }

        @keyframes messageSlideIn {
            from { 
                opacity: 0; 
                transform: translateY(20px) scale(0.95); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0) scale(1); 
            }
        }

        .message.user {
            align-self: flex-end;
            flex-direction: row-reverse;
        }

        .message.assistant {
            align-self: flex-start;
        }

        .message-avatar {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
            flex-shrink: 0;
            box-shadow: 0 3px 15px rgba(0, 0, 0, 0.2);
            position: relative;
        }

        .message.user .message-avatar {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }

        .message.user .message-avatar::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            opacity: 0.3;
            animation: avatarPulse 3s infinite;
        }

        @keyframes avatarPulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.1); opacity: 0.1; }
        }

        .message.assistant .message-avatar {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
        }

        .message-content {
            background: rgba(255, 255, 255, 0.95);
            padding: 16px 20px;
            border-radius: 20px;
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            position: relative;
            line-height: 1.6;
            transition: all 0.3s ease;
            word-wrap: break-word;
        }

        .message-content:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
        }

        .message.user .message-content {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
        }

        .message.user .message-content:hover {
            box-shadow: 0 6px 25px rgba(102, 126, 234, 0.3);
        }

        .message.assistant .message-content {
            background: rgba(255, 255, 255, 0.98);
            color: #2d3748;
        }

        .message.assistant .message-content:hover {
            box-shadow: 0 6px 25px rgba(16, 185, 129, 0.2);
        }

        .message.assistant .message-content {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
        }

        /* 消息时间戳 */
        .message-time {
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
            text-align: right;
        }

        .message.assistant .message-time {
            text-align: left;
        }

        /* 来源信息 */
        .message-sources {
            margin-top: 8px;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
        }

        .message-sources ul {
            list-style: none;
            margin: 4px 0 0 0;
        }

        .message-sources li {
            padding: 2px 0;
            position: relative;
            padding-left: 12px;
        }

        .message-sources li:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #3b82f6;
        }

        /* 输入区域 */
        .chat-input-container {
            padding: 25px 20px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-top: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 25px 25px 0 0; /* 顶部圆角 */
            position: sticky;
            bottom: 0;
            z-index: 100;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
        }

        .chat-input-wrapper {
            display: flex;
            gap: 15px;
            align-items: flex-end;
            padding: 0;
            max-width: 800px;
            margin: 0 auto;
        }

        .chat-input {
            flex: 1;
            border: 2px solid rgba(255, 255, 255, 0.5);
            border-radius: 25px;
            padding: 16px 20px;
            font-size: 16px;
            outline: none;
            transition: all 0.3s ease;
            resize: none;
            min-height: 24px;
            max-height: 120px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            font-family: inherit;
        }
            max-height: 120px;
            overflow-y: auto;
            font-family: inherit;
        }

        .chat-input:focus {
            border-color: #667eea;
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
            transform: translateY(-2px);
        }

        .chat-input::placeholder {
            color: #a0aec0;
            font-style: italic;
        }

        .send-btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 50%;
            width: 52px;
            height: 52px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            flex-shrink: 0;
            font-size: 20px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            position: relative;
            overflow: hidden;
        }

        .send-btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transition: all 0.3s ease;
            transform: translate(-50%, -50%);
        .send-btn:hover:not(:disabled) {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
        }

        .send-btn:hover:not(:disabled)::before {
            width: 100%;
            height: 100%;
        }

        .send-btn:active {
            transform: translateY(-1px) scale(1.02);
        }

        .send-btn:disabled {
            background: linear-gradient(135deg, #94a3b8, #64748b);
            cursor: not-allowed;
            box-shadow: 0 2px 8px rgba(148, 163, 184, 0.3);
        }
        }

        /* 加载指示器 */
        .typing-indicator {
            display: none;
            align-items: center;
            gap: 12px;
            padding: 20px 0;
        }

        .typing-indicator.show {
            display: flex;
        }

        .typing-dots {
            display: flex;
            gap: 4px;
        }

        .typing-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #94a3b8;
        /* 打字指示器优化 */
        .typing-indicator {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 20px;
            margin: 10px 0;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
        }

        .typing-indicator.show {
            opacity: 1;
            transform: translateY(0);
        }

        .typing-indicator .message-avatar {
            background: linear-gradient(135deg, #10b981, #059669);
            box-shadow: 0 3px 15px rgba(16, 185, 129, 0.3);
            animation: avatarPulse 2s infinite;
        }

        .typing-dots {
            display: flex;
            gap: 6px;
            padding: 12px 18px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            backdrop-filter: blur(15px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .typing-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            animation: typing 1.5s ease-in-out infinite;
        }

        .typing-dot:nth-child(2) {
            animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes typing {
            0%, 60%, 100% {
                transform: translateY(0);
                opacity: 0.4;
            }
            30% {
                transform: translateY(-8px);
                opacity: 1;
                background: linear-gradient(135deg, #10b981, #059669);
            }
        }

        /* 设置面板 */
        .settings-panel {
            position: fixed !important;
            top: 0 !important;
            right: -400px !important;
            width: 400px !important;
            height: 100vh !important;
            background: white !important;
            box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15) !important;
            transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            z-index: 10000 !important;
            overflow-y: auto !important;
            transform: translateZ(0) !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        .settings-panel.show {
            right: 0 !important;
        }

        .settings-header {
            padding: 20px !important;
            border-bottom: 1px solid #e2e8f0 !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            background: #f8fafc !important;
        }

        .settings-header h3 {
            margin: 0 !important;
            color: #1e293b !important;
            font-size: 18px !important;
            font-weight: 600 !important;
        }

        .settings-content {
            padding: 20px !important;
            background: white !important;
        }

        .setting-group {
            margin-bottom: 24px !important;
        }

        .setting-group label {
            display: block !important;
            font-weight: 600 !important;
            color: #1e293b !important;
            margin-bottom: 8px !important;
            font-size: 14px !important;
        }

        .setting-group input,
        .setting-group select {
            width: 100% !important;
            padding: 8px 12px !important;
            border: 1px solid #d1d5db !important;
            border-radius: 6px !important;
            font-size: 14px !important;
            background: white !important;
            color: #1e293b !important;
        }

        .setting-group input[type="range"] {
            margin: 8px 0 !important;
            background: transparent !important;
            border: none !important;
        }

        .range-value {
            font-size: 12px !important;
            color: #64748b !important;
            margin-top: 4px !important;
        }

        .model-status {
            margin-top: 8px !important;
            font-size: 12px !important;
            color: #64748b !important;
            padding: 4px 8px !important;
            background: #f3f4f6 !important;
            border-radius: 4px !important;
        }

        /* 设置按钮样式统一 */
        .settings-btn {
            background: rgba(255, 255, 255, 0.9) !important;
            border: none !important;
            cursor: pointer !important;
            padding: 12px !important;
            border-radius: 50% !important;
            color: #4a5568 !important;
            transition: all 0.3s ease !important;
            font-size: 16px !important;
            width: 44px !important;
            height: 44px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            backdrop-filter: blur(10px) !important;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
        }

        .settings-btn:hover {
            background: rgba(255, 255, 255, 1) !important;
            transform: scale(1.1) !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
            .settings-panel {
                width: 100vw;
                right: -100vw;
            }
            
            .settings-panel.show {
                right: 0;
            }
            
            .message {
                max-width: 95%;
                gap: 12px;
            }
            
            .message-avatar {
                width: 36px;
                height: 36px;
                font-size: 12px;
            }
            
            .header {
                padding: 15px 20px;
            }
            
            .header h1 {
                font-size: 20px;
            }
            
            .chat-container {
                padding: 0 15px;
            }
            
            .welcome-message {
                padding: 40px 20px;
                margin: 20px auto;
            }
            
            .welcome-message h2 {
                font-size: 26px;
            }
            
            .welcome-message p {
                font-size: 16px;
                padding: 15px 20px;
            }
            
            .chat-input {
                padding: 14px 18px;
                font-size: 16px;
            }
            
            .send-btn {
                width: 48px;
                height: 48px;
                font-size: 18px;
            }
        }

        @media (max-width: 480px) {
            .header h1 {
                font-size: 18px;
            }
            
            .model-indicator {
                font-size: 12px;
                gap: 8px;
            }
            
            .message-content {
                padding: 12px 16px;
            }
            
            .chat-input-container {
                padding: 20px 0;
            }
        }
            .header {
                padding: 12px 16px;
            }
            
            .chat-container {
                padding: 0 16px;
            }
        }

        /* 隐藏类 */
        .hidden {
            display: none !important;
        }

        /* 欢迎消息 */
        .welcome-message {
            text-align: center;
            padding: 60px 30px;
            color: rgba(255, 255, 255, 0.9);
            animation: welcomeFadeIn 1s ease-out;
            max-width: 600px;
            margin: 40px auto;
        }

        @keyframes welcomeFadeIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .welcome-message h2 {
            color: white;
            margin-bottom: 20px;
            font-size: 32px;
            font-weight: 700;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }

        .welcome-message h2::before {
            content: "✨";
            font-size: 36px;
            animation: sparkle 2s ease-in-out infinite;
        }

        @keyframes sparkle {
            0%, 100% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
        }

        .welcome-message p {
            opacity: 0.95;
            font-size: 18px;
            line-height: 1.6;
            background: rgba(255, 255, 255, 0.1);
            padding: 20px 30px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        /* 设置覆盖层 */
        .settings-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.5) !important;
            z-index: 9999 !important;
            opacity: 0 !important;
            visibility: hidden !important;
            transition: opacity 0.3s ease, visibility 0.3s ease !important;
            pointer-events: none !important;
        }

        .settings-overlay.show {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>AI Chat 智能对话</h1>
        <div class="model-indicator">
            <span>当前模型:</span>
            <span class="model-badge" id="currentModelBadge">AutoRAG</span>
        </div>
        <button class="settings-btn" id="settingsBtn" title="设置">
            ⚙️
        </button>
    </div>

    <div class="chat-container">
        <div class="chat-messages" id="chatMessages">
            <div class="welcome-message">
                <h2>欢迎使用 AI Chat</h2>
                <p>我是您的智能助手，可以回答问题、协助思考和提供信息。有什么我可以帮您的吗？</p>
            </div>
        </div>

        <div class="typing-indicator" id="typingIndicator">
            <div class="message-avatar">
                <span>AI</span>
            </div>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>正在思考中...</span>
        </div>

        <div class="chat-input-container">
            <div class="chat-input-wrapper">
                <textarea id="chatInput" class="chat-input" placeholder="输入您的消息..." rows="1"></textarea>
                <button id="sendBtn" class="send-btn" title="发送">
                    ➤
                </button>
            </div>
        </div>
    </div>

    <!-- 设置覆盖层 -->
    <div class="settings-overlay" id="settingsOverlay"></div>

    <!-- 设置面板 -->
    <div class="settings-panel" id="settingsPanel">
        <div class="settings-header">
            <h3>对话设置</h3>
            <button class="settings-btn" id="closeSettingsBtn" title="关闭">
                ✕
            </button>
        </div>
        <div class="settings-content">
            <div class="setting-group">
                <label for="useAutoRAG">使用AutoRAG:</label>
                <select id="useAutoRAG">
                    <option value="true">是 (优先使用AutoRAG)</option>
                    <option value="false">否 (直接使用回落模型)</option>
                </select>
            </div>
            <div class="setting-group">
                <label for="fallbackModel">回落模型:</label>
                <select id="fallbackModel">
                    <option value="@cf/meta/llama-2-7b-chat-int8">Llama 2 7B (默认)</option>
                </select>
                <div class="model-status">
                    正在加载模型列表...
                </div>
            </div>
            <div class="setting-group">
                <label for="temperature">创造性 (Temperature):</label>
                <input type="range" id="temperature" min="0" max="1" step="0.1" value="0.7">
                <div class="range-value">当前值: <span id="temperatureValue">0.7</span></div>
            </div>
            <div class="setting-group">
                <label for="maxTokens">最大生成长度:</label>
                <input type="number" id="maxTokens" value="500" min="1" max="2000">
            </div>
        </div>
    </div>

    <script>
        // 配置 - 使用当前页面域名的API
        const WORKER_API_URL = window.location.origin + "/api";
        
        // DOM元素 (在DOMContentLoaded中初始化)
        let chatMessages, chatInput, sendBtn, typingIndicator, currentModelBadge;
        let settingsBtn, settingsPanel, settingsOverlay, closeSettingsBtn;
        let fallbackModelSelect, temperatureSlider, temperatureValue;
        let useAutoRAGSelect, maxTokensInput;
        
        // 聊天历史
        let chatHistory = [];

        // 页面初始化
        document.addEventListener('DOMContentLoaded', () => {
            // 初始化DOM元素
            chatMessages = document.getElementById('chatMessages');
            chatInput = document.getElementById('chatInput');
            sendBtn = document.getElementById('sendBtn');
            typingIndicator = document.getElementById('typingIndicator');
            currentModelBadge = document.getElementById('currentModelBadge');
            settingsBtn = document.getElementById('settingsBtn');
            settingsPanel = document.getElementById('settingsPanel');
            settingsOverlay = document.getElementById('settingsOverlay');
            closeSettingsBtn = document.getElementById('closeSettingsBtn');
            fallbackModelSelect = document.getElementById('fallbackModel');
            temperatureSlider = document.getElementById('temperature');
            temperatureValue = document.getElementById('temperatureValue');
            useAutoRAGSelect = document.getElementById('useAutoRAG');
            maxTokensInput = document.getElementById('maxTokens');
            
            // 确保设置面板初始状态是隐藏的
            if (settingsPanel) {
                settingsPanel.classList.remove('show');
                // 强制设置为固定定位，确保脱离文档流
                settingsPanel.style.position = 'fixed';
                settingsPanel.style.right = '-400px';
                settingsPanel.style.zIndex = '10000';
                
                // 直接应用样式确保显示
                applySettingsStyles();
            }
            if (settingsOverlay) {
                settingsOverlay.classList.remove('show');
                settingsOverlay.style.position = 'fixed';
                settingsOverlay.style.zIndex = '9999';
            }
            
            // 加载可用模型
            loadAvailableModels();
            
            // 设置面板事件
            if (settingsBtn && settingsPanel && settingsOverlay) {
                settingsBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // 显示设置面板
                    settingsPanel.classList.add('show');
                    settingsPanel.style.right = '0px';
                    
                    // 显示覆盖层
                    settingsOverlay.classList.add('show');
                });
            }

            if (closeSettingsBtn) {
                closeSettingsBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeSettings();
                });
            }
            
            if (settingsOverlay) {
                settingsOverlay.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeSettings();
                });
            }

            // 温度滑块更新显示值
            if (temperatureSlider) {
                temperatureSlider.addEventListener('input', () => {
                    temperatureValue.textContent = temperatureSlider.value;
                });
            }

            // 发送按钮事件
            if (sendBtn) {
                sendBtn.addEventListener('click', () => {
                    sendMessage();
                });
            }
            
            // 输入框事件
            if (chatInput) {
                chatInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                });

                // 自动调整输入框高度
                chatInput.addEventListener('input', autoResize);
            }
        });

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
                    
                    // 更新模型状态显示
                    const modelStatus = document.querySelector('.model-status');
                    if (modelStatus) {
                        modelStatus.textContent = data.source === 'dynamic' ? 
                            '✅ 已动态检测可用模型' : '⚠️ 使用预设模型列表';
                    }
                    
                } else if (data.error) {
                    console.warn('获取模型列表失败:', data.error);
                }
            } catch (error) {
                console.error('获取模型列表时发生错误:', error);
                // 保持默认的静态模型列表
            }
        }

        function closeSettings() {
            if (settingsPanel) {
                settingsPanel.classList.remove('show');
                settingsPanel.style.right = '-400px';
            }
            if (settingsOverlay) {
                settingsOverlay.classList.remove('show');
            }
        }

        // 直接应用设置面板样式
        function applySettingsStyles() {
            if (!settingsPanel) return;
            
            // 设置面板主体样式
            Object.assign(settingsPanel.style, {
                width: '400px',
                height: '100vh',
                background: 'white',
                boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
                transition: 'right 0.3s ease',
                overflowY: 'auto'
            });
            
            // 设置头部样式
            const header = settingsPanel.querySelector('.settings-header');
            if (header) {
                Object.assign(header.style, {
                    padding: '20px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f8fafc'
                });
                
                const h3 = header.querySelector('h3');
                if (h3) {
                    Object.assign(h3.style, {
                        margin: '0',
                        color: '#1e293b',
                        fontSize: '18px',
                        fontWeight: '600'
                    });
                }
                
                const closeBtn = header.querySelector('.settings-btn');
                if (closeBtn) {
                    Object.assign(closeBtn.style, {
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        color: '#4a5568',
                        fontSize: '16px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    });
                }
            }
            
            // 设置内容样式
            const content = settingsPanel.querySelector('.settings-content');
            if (content) {
                Object.assign(content.style, {
                    padding: '20px',
                    background: 'white'
                });
            }
            
            // 设置组样式
            const groups = settingsPanel.querySelectorAll('.setting-group');
            groups.forEach(group => {
                group.style.marginBottom = '24px';
                
                const label = group.querySelector('label');
                if (label) {
                    Object.assign(label.style, {
                        display: 'block',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '8px',
                        fontSize: '14px'
                    });
                }
                
                const inputs = group.querySelectorAll('input, select');
                inputs.forEach(input => {
                    if (input.type !== 'range') {
                        Object.assign(input.style, {
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            background: 'white',
                            color: '#1e293b'
                        });
                    }
                });
                
                const status = group.querySelector('.model-status');
                if (status) {
                    Object.assign(status.style, {
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#64748b',
                        padding: '4px 8px',
                        background: '#f3f4f6',
                        borderRadius: '4px'
                    });
                }
                
                const rangeValue = group.querySelector('.range-value');
                if (rangeValue) {
                    Object.assign(rangeValue.style, {
                        fontSize: '12px',
                        color: '#64748b',
                        marginTop: '4px'
                    });
                }
            });
        }

        function autoResize() {
            chatInput.style.height = 'auto';
            chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
        }

        // 发送消息
        async function sendMessage() {
            if (!chatInput) {
                return;
            }
            
            const message = chatInput.value.trim();
            
            if (!message) {
                return;
            }
            
            // 添加用户消息
            addMessage('user', message);
            
            // 清空输入框并重置高度
            chatInput.value = '';
            chatInput.style.height = '44px';
            
            // 禁用发送按钮
            sendBtn.disabled = true;
            
            // 显示打字指示器
            showTypingIndicator();
            
            try {
                // 获取设置
                const options = {
                    use_autorag: useAutoRAGSelect ? useAutoRAGSelect.value === 'true' : true,
                    fallback_model: fallbackModelSelect ? fallbackModelSelect.value : '@cf/meta/llama-2-7b-chat-int8',
                    temperature: temperatureSlider ? parseFloat(temperatureSlider.value) : 0.7,
                    max_tokens: maxTokensInput ? parseInt(maxTokensInput.value) : 500
                };
                
                // 调用API
                const response = await fetch(WORKER_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query: message,
                        options: options
                    })
                });

                if (!response.ok) {
                    throw new Error('网络请求失败: ' + response.status);
                }

                const data = await response.json();
                
                // 隐藏打字指示器
                hideTypingIndicator();
                
                // 更新当前使用的模型
                updateCurrentModel(data.model_used);
                
                // 添加AI回复
                addMessage('assistant', data.answer || data.response, data.sources);
                
            } catch (error) {
                console.error('发送消息失败:', error);
                hideTypingIndicator();
                addMessage('assistant', '抱歉，我现在无法回复您的消息。请稍后重试。', null, true);
            } finally {
                // 启用发送按钮
                sendBtn.disabled = false;
            }
        }

        // 添加消息到聊天界面
        function addMessage(role, content, sources = null, isError = false) {
            // 移除欢迎消息
            const welcomeMessage = document.querySelector('.welcome-message');
            if (welcomeMessage) {
                welcomeMessage.remove();
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + role;
            
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.textContent = role === 'user' ? '您' : 'AI';
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            
            if (isError) {
                messageContent.style.color = '#dc2626';
                messageContent.style.borderColor = '#fecaca';
                messageContent.style.background = '#fef2f2';
            }
            
            // 处理内容格式化
            messageContent.innerHTML = formatMessage(content);
            
            // 添加时间戳
            const timestamp = document.createElement('div');
            timestamp.className = 'message-time';
            timestamp.textContent = new Date().toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            messageContent.appendChild(timestamp);
            
            // 添加来源信息
            if (sources && sources.length > 0 && role === 'assistant') {
                const sourcesDiv = document.createElement('div');
                sourcesDiv.className = 'message-sources';
                sourcesDiv.innerHTML = '<strong>参考来源:</strong>';
                
                const sourcesList = document.createElement('ul');
                sources.forEach(source => {
                    const li = document.createElement('li');
                    li.textContent = source;
                    sourcesList.appendChild(li);
                });
                
                sourcesDiv.appendChild(sourcesList);
                messageContent.appendChild(sourcesDiv);
            }
            
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageContent);
            
            chatMessages.appendChild(messageDiv);
            
            // 滚动到底部
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // 更新聊天历史
            chatHistory.push({
                role: role,
                content: content,
                timestamp: new Date(),
                sources: sources
            });
        }

        // 格式化消息内容
        function formatMessage(text) {
            if (!text) return '';
            
            // 简单的文本格式化
            return text.replace(/\\n/g, '<br>');
        }

        // 显示打字指示器
        function showTypingIndicator() {
            typingIndicator.classList.add('show');
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // 隐藏打字指示器
        function hideTypingIndicator() {
            typingIndicator.classList.remove('show');
        }

        // 更新当前模型显示
        function updateCurrentModel(modelUsed) {
            if (!modelUsed) return;
            
            if (modelUsed === 'autorag') {
                currentModelBadge.textContent = 'AutoRAG';
                currentModelBadge.className = 'model-badge';
            } else if (modelUsed === 'mock_autorag') {
                currentModelBadge.textContent = 'AutoRAG (模拟)';
                currentModelBadge.className = 'model-badge';
            } else {
                // 尝试从下拉选项中获取模型显示名称
                const modelOption = fallbackModelSelect.querySelector('option[value="' + modelUsed + '"]');
                const displayName = modelOption ? modelOption.textContent : modelUsed.replace('@cf/', '');
                
                currentModelBadge.textContent = displayName;
                currentModelBadge.className = 'model-badge fallback';
            }
        }
    </script>
</body>
</html>`;

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
                console.log('模型 ' + model.id + ': ' + (model.available ? '可用' : '不可用'));
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
                console.log('AutoRAG不可用，使用回落模型: ' + fallbackModel, autoragError.message);
                
                // AutoRAG失败，使用回落模型
                modelUsed = fallbackModel;
                const response = await env.AI.run(fallbackModel, {
                  messages: [
                    {
                      role: "system",
                      content: "你是一个智能聊天助手，请根据用户的问题提供有帮助的回答。保持对话自然、友好。"
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
                  sources: ['基于' + (CONFIG.FALLBACK_MODELS[fallbackModel] || fallbackModel) + '生成的回答'],
                  model_used: modelUsed
                };
              }
            } else {
              // 用户选择直接使用回落模型
              console.log('用户选择直接使用回落模型: ' + fallbackModel);
              modelUsed = fallbackModel;
              
              const response = await env.AI.run(fallbackModel, {
                messages: [
                  {
                    role: "system",
                    content: "你是一个智能聊天助手，请根据用户的问题提供有帮助的回答。保持对话自然、友好。"
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
                sources: ['基于' + (CONFIG.FALLBACK_MODELS[fallbackModel] || fallbackModel) + '生成的回答'],
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
            answer: "这是一个模拟的AI回复。请确保Worker已正确配置AI绑定以使用真实的AI服务。您的问题是：" + query,
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

// 辅助函数：处理CORS
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
