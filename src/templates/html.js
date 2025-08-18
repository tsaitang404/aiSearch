/**
 * HTML模板
 * @version 1.0.0
 */

export const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NeoAI 智能对话</title>
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
            cursor: pointer;
        }

        .model-indicator:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            background: rgba(255, 255, 255, 0.9);
        }

        .model-indicator:active {
            transform: translateY(0px);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
        }

        /* 设置按钮 */
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
        }

        /* 聊天容器 */
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
            min-height: 0;
            max-height: calc(100vh - 200px);
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

        /* Markdown 内容样式 */
        .message-content h1, 
        .message-content h2, 
        .message-content h3 {
            margin: 16px 0 8px 0;
            font-weight: 600;
            line-height: 1.4;
        }

        .message-content h1 {
            font-size: 1.5em;
            color: #1a202c;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
        }

        .message-content h2 {
            font-size: 1.3em;
            color: #2d3748;
        }

        .message-content h3 {
            font-size: 1.1em;
            color: #4a5568;
        }

        /* 代码块样式 */
        .code-block {
            position: relative;
            margin: 12px 0;
            border-radius: 8px;
            overflow: hidden;
            background: #1a1a1a;
            border: 1px solid #333;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .code-language {
            background: #333;
            color: #a0a0a0;
            padding: 6px 12px;
            font-size: 12px;
            font-weight: 500;
            border-bottom: 1px solid #444;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .code-block pre {
            margin: 0;
            padding: 16px;
            background: #1a1a1a;
            color: #e2e8f0;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            line-height: 1.5;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        .code-block code {
            background: transparent;
            color: inherit;
            padding: 0;
            border: none;
            font-size: inherit;
        }

        .copy-code-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #a0a0a0;
            padding: 6px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s ease;
            backdrop-filter: blur(5px);
        }

        .copy-code-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            color: #fff;
            transform: scale(1.05);
        }

        .copy-code-btn:active {
            transform: scale(0.95);
        }

        /* 内联代码样式 */
        .inline-code {
            background: rgba(99, 102, 241, 0.1);
            color: #6366f1;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9em;
            border: 1px solid rgba(99, 102, 241, 0.2);
        }

        /* 列表样式 */
        .message-list {
            margin: 12px 0;
            padding-left: 20px;
        }

        .message-list li {
            margin: 4px 0;
            line-height: 1.6;
        }

        .message-list.ordered {
            list-style-type: decimal;
        }

        .message-list:not(.ordered) {
            list-style-type: disc;
        }

        .message-list li::marker {
            color: #6366f1;
            font-weight: bold;
        }

        /* 引用块样式 */
        .message-content blockquote {
            margin: 12px 0;
            padding: 12px 16px;
            border-left: 4px solid #6366f1;
            background: rgba(99, 102, 241, 0.05);
            border-radius: 0 8px 8px 0;
            font-style: italic;
            color: #4a5568;
        }

        /* 水平分割线样式 */
        .message-content hr {
            margin: 20px 0;
            border: none;
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
        }

        /* 图片样式 */
        .message-content .message-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 12px 0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            cursor: pointer;
        }

        .message-content .message-image:hover {
            transform: scale(1.02);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        /* 图片加载失败样式 */
        .message-content .message-image[alt]:after {
            content: " (图片: " attr(alt) ")";
            color: #666;
            font-style: italic;
            display: block;
            text-align: center;
            padding: 20px;
            background: #f8fafc;
            border: 2px dashed #e2e8f0;
            border-radius: 8px;
        }

        /* 表格样式 */
        .markdown-table {
            width: 100%;
            margin: 12px 0;
            border-collapse: collapse;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            background: #fff;
        }

        .markdown-table th,
        .markdown-table td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }

        .markdown-table th {
            background: #f8fafc;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #d1d5db;
        }

        .markdown-table tr:hover {
            background: #f9fafb;
        }

        .markdown-table tr:last-child td {
            border-bottom: none;
        }

        /* 链接样式 */
        .message-content a {
            color: #6366f1;
            text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: all 0.2s ease;
        }

        .message-content a:hover {
            color: #4f46e5;
            border-bottom-color: #6366f1;
        }

        /* 删除线样式 */
        .message-content del {
            color: #9ca3af;
            text-decoration: line-through;
        }

        /* 输入区域 */
        .chat-input-container {
            padding: 25px 20px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-top: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 25px 25px 0 0;
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
            overflow-y: auto;
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
        }
        
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

        /* 加载指示器 */
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

        /* 底部按钮样式 */
        .bottom-action-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
            z-index: 1000;
            display: none;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .bottom-action-btn:hover {
            transform: translateY(-5px) scale(1.1);
            box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
            background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        }

        .bottom-action-btn:active {
            transform: translateY(-3px) scale(1.05);
        }

        .bottom-action-btn.show {
            display: flex;
            animation: slideInUp 0.3s ease;
        }

        @keyframes slideInUp {
            from {
                transform: translateY(100px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        /* 移动端响应式 */
        @media (max-width: 768px) {
            .bottom-action-btn {
                width: 50px;
                height: 50px;
                bottom: 15px;
                right: 15px;
                font-size: 20px;
            }
        }

        /* 模型切换弹窗 */
        .model-switch-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        }

        .model-switch-modal.show {
            display: flex;
            animation: fadeIn 0.3s ease;
        }

        .model-switch-content {
            background: white;
            border-radius: 20px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideInScale 0.3s ease;
        }

        .model-switch-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f1f5f9;
        }

        .model-switch-header h3 {
            color: #2d3748;
            font-size: 18px;
            font-weight: 600;
            margin: 0;
        }

        .modal-close-btn {
            background: #ef4444;
            border: none;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
            background: #dc2626;
            transform: scale(1.1);
        }

        .model-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            margin: 8px 0;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 2px solid transparent;
        }

        .model-option:hover {
            background: #f8fafc;
            border-color: #e2e8f0;
        }

        .model-option.active {
            background: #eff6ff;
            border-color: #3b82f6;
        }

        .model-option.active .model-option-badge {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }

        .model-option-info {
            display: flex;
            flex-direction: column;
            flex: 1;
        }

        .model-option-name {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 2px;
        }

        .model-option-desc {
            font-size: 12px;
            color: #64748b;
        }

        .model-option-badge {
            background: linear-gradient(135deg, #64748b, #475569);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        #modelSwitchOptions {
            max-height: 400px;
            overflow-y: auto;
            overflow-x: hidden;
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 #f1f5f9;
        }

        #modelSwitchOptions::-webkit-scrollbar {
            width: 6px;
        }

        #modelSwitchOptions::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
        }

        #modelSwitchOptions::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
            transition: all 0.2s ease;
        }

        #modelSwitchOptions::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }

        .model-features {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 6px;
        }

        .model-feature-tag {
            background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
            color: #475569;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 9px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            border: 1px solid #e2e8f0;
            transition: all 0.2s ease;
        }

        .model-option:hover .model-feature-tag {
            background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
            color: #334155;
        }

        .model-option.active .model-feature-tag {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            color: #1d4ed8;
            border-color: #3b82f6;
        }

        /* 特殊特性标签颜色 */
        .model-feature-tag:nth-child(1) {
            background: linear-gradient(135deg, #fef3c7, #fed7aa);
            color: #d97706;
        }

        .model-feature-tag:nth-child(2) {
            background: linear-gradient(135deg, #dcfce7, #bbf7d0);
            color: #16a34a;
        }

        .model-feature-tag:nth-child(3) {
            background: linear-gradient(135deg, #fae8ff, #f3e8ff);
            color: #a855f7;
        }

        .model-feature-tag:nth-child(4) {
            background: linear-gradient(135deg, #ecfdf5, #d1fae5);
            color: #059669;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>NeoAI 智能对话</h1>
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
                <h2>欢迎使用 NeoAI</h2>
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

    <!-- 底部回到底部按钮 -->
    <button class="bottom-action-btn" id="scrollToBottomBtn" title="回到底部">
        ↓
    </button>

    <!-- 模型切换弹窗 -->
    <div class="model-switch-modal" id="modelSwitchModal">
        <div class="model-switch-content">
            <div class="model-switch-header">
                <h3>选择模型</h3>
                <button class="modal-close-btn" id="closeModelSwitchBtn" title="关闭">
                    ✕
                </button>
            </div>
            <div id="modelSwitchOptions">
                <!-- 模型选项将通过 JavaScript 动态生成 -->
            </div>
        </div>
    </div>

    <script>
        /**
         * NeoAI 前端JavaScript - 内嵌版本
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
            setupImageClickHandlers();
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
                    addMessage('assistant', \`抱歉，处理您的请求时出现了错误：\${data.error}\`, [], '错误');
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
            messageDiv.className = \`message \${role}\`;
            
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
                sourcesDiv.innerHTML = \`
                    <strong>参考来源:</strong>
                    <ul>
                        \${sources.map(source => \`<li>\${escapeHtml(source)}</li>\`).join('')}
                    </ul>
                \`;
                contentWrapper.appendChild(sourcesDiv);
            }
            
            messageDiv.appendChild(contentWrapper);
            chatMessages.appendChild(messageDiv);
            
            // 滚动到底部
            scrollToBottom();
        }

        /**
         * 处理消息内容（完整的Markdown支持）
         */
        function processMessageContent(content) {
            // 首先进行HTML转义
            let html = escapeHtml(content);
            
            // 将反引号转换为占位符来避免转义问题
            html = html.replace(/\`/g, '___BACKTICK___');
            
            // 处理代码块（三个反引号占位符）
            html = html.replace(/___BACKTICK______BACKTICK______BACKTICK___([\\s\\S]*?)___BACKTICK______BACKTICK______BACKTICK___/g, function(match, code) {
                const lines = code.split('\\n');
                let language = '';
                let codeContent = code;
                
                // 检查第一行是否是语言标识符
                if (lines.length > 1 && lines[0].trim() && !lines[0].includes(' ')) {
                    language = lines[0].trim();
                    codeContent = lines.slice(1).join('\\n');
                }
                
                return '<div class="code-block">' +
                    (language ? '<div class="code-language">' + language + '</div>' : '') +
                    '<pre><code class="language-' + language + '">' + codeContent + '</code></pre>' +
                    '<button class="copy-code-btn" onclick="copyToClipboard(this)" title="复制代码">📋</button>' +
                '</div>';
            });
            
            // 处理内联代码（单个反引号占位符）
            html = html.replace(/___BACKTICK___([^_]+?)___BACKTICK___/g, '<code class="inline-code">$1</code>');
            
            // 处理粗体文本
            html = html.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
            html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
            
            // 处理斜体文本
            html = html.replace(/\\*([^*]+)\\*/g, '<em>$1</em>');
            html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
            
            // 处理删除线
            html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
            
            // 处理图片（必须在链接之前处理）
            html = html.replace(/!\\[([^\\]]*)\\]\\(([^)]+)\\)/g, '<img src="$2" alt="$1" class="message-image" loading="lazy">');
            
            // 保护图片和链接的URL，避免被自动链接处理
            const protectedUrls = [];
            html = html.replace(/(src="|href=")([^"]+)(")/g, function(match, prefix, url, suffix) {
                const placeholder = '___PROTECTED_URL_' + protectedUrls.length + '___';
                protectedUrls.push(url);
                return prefix + placeholder + suffix;
            });
            
            // 处理链接
            html = html.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
            
            // 处理自动链接（HTTP/HTTPS）
            html = html.replace(/(https?:\\/\\/[^\\s<>]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
            
            // 恢复保护的URL
            protectedUrls.forEach((url, index) => {
                const placeholder = '___PROTECTED_URL_' + index + '___';
                html = html.replace(placeholder, url);
            });
            
            // 处理标题
            html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
            html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
            html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
            
            // 处理无序列表
            html = html.replace(/^\\* (.+)$/gm, '<li>$1</li>');
            html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
            html = html.replace(/^• (.+)$/gm, '<li>$1</li>');
            
            // 处理有序列表
            html = html.replace(/^\\d+\\. (.+)$/gm, '<li class="ordered">$1</li>');
            
            // 包装连续的列表项
            html = html.replace(/(<li[^>]*>.*?<\\/li>\\s*)+/gs, function(match) {
                if (match.includes('class="ordered"')) {
                    return '<ol class="message-list ordered">' + match.replace(/ class="ordered"/g, '') + '</ol>';
                } else {
                    return '<ul class="message-list">' + match + '</ul>';
                }
            });
            
            // 处理引用块（需要处理HTML转义后的 &gt;）
            html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
            html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
            
            // 处理水平分割线
            html = html.replace(/^-{3,}$/gm, '<hr>');
            html = html.replace(/^\\*{3,}$/gm, '<hr>');
            html = html.replace(/^={3,}$/gm, '<hr>');
            
            // 处理表格
            html = processMarkdownTables(html);
            
            // 处理换行
            html = html.replace(/\\n/g, '<br>');
            
            return html;
        }

        /**
         * 处理Markdown表格
         */
        function processMarkdownTables(html) {
            const lines = html.split('\\n');
            let inTable = false;
            let tableRows = [];
            let result = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (line.includes('|') && !inTable) {
                    // 检查下一行是否是表格分隔符
                    if (i + 1 < lines.length && lines[i + 1].includes('---')) {
                        inTable = true;
                        tableRows = [line];
                        i++; // 跳过分隔符行
                        continue;
                    }
                } else if (inTable && line.includes('|')) {
                    tableRows.push(line);
                } else if (inTable) {
                    // 表格结束
                    result.push(createTableHTML(tableRows));
                    tableRows = [];
                    inTable = false;
                    result.push(line);
                } else {
                    result.push(line);
                }
            }
            
            // 处理文件末尾的表格
            if (inTable && tableRows.length > 0) {
                result.push(createTableHTML(tableRows));
            }
            
            return result.join('\\n');
        }

        /**
         * 创建表格HTML
         */
        function createTableHTML(rows) {
            if (rows.length === 0) return '';
            
            const headerRow = rows[0].split('|').map(cell => cell.trim()).filter(cell => cell !== '');
            const dataRows = rows.slice(1).map(row => 
                row.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
            );
            
            let table = '<table class="markdown-table">';
            
            // 表头
            table += '<thead><tr>';
            headerRow.forEach(header => {
                table += '<th>' + header + '</th>';
            });
            table += '</tr></thead>';
            
            // 表体
            table += '<tbody>';
            dataRows.forEach(row => {
                table += '<tr>';
                row.forEach((cell, index) => {
                    table += '<td>' + (cell || '') + '</td>';
                });
                table += '</tr>';
            });
            table += '</tbody>';
            
            table += '</table>';
            return table;
        }

        /**
         * 复制代码到剪贴板
         */
        window.copyToClipboard = function(button) {
            const codeBlock = button.closest('.code-block');
            const codeElement = codeBlock.querySelector('code');
            const text = codeElement.textContent;
            
            navigator.clipboard.writeText(text).then(() => {
                // 临时改变按钮文本以显示反馈
                const originalText = button.textContent;
                button.textContent = '✓';
                button.style.background = '#4CAF50';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '';
                }, 2000);
            }).catch(err => {
                console.error('复制失败:', err);
                // 显示错误反馈
                const originalText = button.textContent;
                button.textContent = '✗';
                button.style.background = '#f44336';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '';
                }, 2000);
            });
        };

        /**
         * 图片点击放大功能
         */
        function setupImageClickHandlers() {
            document.addEventListener('click', function(e) {
                if (e.target.classList.contains('message-image')) {
                    const imgSrc = e.target.src;
                    const imgAlt = e.target.alt;
                    
                    // 创建模态框
                    const modal = document.createElement('div');
                    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); display: flex; justify-content: center; align-items: center; z-index: 10000; cursor: pointer;';
                    
                    const img = document.createElement('img');
                    img.src = imgSrc;
                    img.alt = imgAlt;
                    img.style.cssText = 'max-width: 90%; max-height: 90%; border-radius: 8px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);';
                    
                    modal.appendChild(img);
                    document.body.appendChild(modal);
                    
                    // 点击模态框关闭
                    modal.addEventListener('click', () => {
                        document.body.removeChild(modal);
                    });
                    
                    // ESC键关闭
                    const escHandler = (event) => {
                        if (event.key === 'Escape') {
                            document.body.removeChild(modal);
                            document.removeEventListener('keydown', escHandler);
                        }
                    };
                    document.addEventListener('keydown', escHandler);
                }
            });
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
                statusDiv.textContent = \`找到 \${models.length} 个模型，其中 \${availableCount} 个可用\`;
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
                    const featureHtml = features.map(feature => \`<span class="model-feature-tag">\${feature}</span>\`).join('');
                    
                    return \`
                    <div class="model-option \${currentModel === model.type ? 'active' : ''} \${!model.available ? 'disabled' : ''}" 
                         data-model="\${model.type}" 
                         onclick="\${model.available ? \`selectModel('\${model.type}')\` : ''}">
                        <div class="model-option-info">
                            <div class="model-option-name">\${model.name}</div>
                            <div class="model-option-desc">\${model.desc}</div>
                            <div class="model-features">
                                \${featureHtml}
                            </div>
                        </div>
                        <div class="model-option-badge">
                            \${model.available ? '可用' : '不可用'}
                        </div>
                    </div>
                    \`;
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
                    const featureHtml = features.map(feature => \`<span class="model-feature-tag">\${feature}</span>\`).join('');
                    
                    return \`
                    <div class="model-option \${currentModel === model.type ? 'active' : ''}" 
                         data-model="\${model.type}" 
                         onclick="selectModel('\${model.type}')">
                        <div class="model-option-info">
                            <div class="model-option-name">\${model.name}</div>
                            <div class="model-option-desc">\${model.desc}</div>
                            <div class="model-features">
                                \${featureHtml}
                            </div>
                        </div>
                        <div class="model-option-badge">可用</div>
                    </div>
                    \`;
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
    </script>
</body>
</html>`;
