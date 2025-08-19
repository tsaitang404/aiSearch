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
    <!-- Markdown解析库 -->
    <script src="https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js"></script>
    <!-- 代码语法高亮 -->
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">
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
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 24px rgba(0, 0, 0, 0.08);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            position: sticky;
            top: 0;
            z-index: 100;
            min-height: 72px;
        }

        .header-left {
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex: 1;
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-shrink: 0;
        }

        .header h1 {
            margin: 0;
            color: #1a202c;
            font-size: 22px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
            line-height: 1.2;
        }

        .header h1::before {
            content: "🤖";
            font-size: 24px;
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
            gap: 8px;
            font-size: 13px;
            color: #64748b;
            background: rgba(248, 250, 252, 0.9);
            padding: 6px 12px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(226, 232, 240, 0.5);
            transition: all 0.3s ease;
            cursor: pointer;
            max-width: 200px;
            white-space: nowrap;
            flex-shrink: 2;
            min-width: 0;
            overflow: hidden;
        }
        
        .model-indicator span:first-child {
            flex-shrink: 0;
        }

        .model-indicator:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            background: rgba(255, 255, 255, 0.95);
            border-color: rgba(102, 126, 234, 0.3);
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
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 120px;
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

        /* 用户界面样式 */
        .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #2d3748;
            font-size: 14px;
            flex-shrink: 0;
        }

        .user-info .username {
            font-weight: 600;
        }

        .auth-buttons {
            display: flex;
            gap: 10px;
            flex-shrink: 0;
        }

        .auth-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .auth-btn.primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .auth-btn.secondary {
            background: rgba(255, 255, 255, 0.8);
            color: #2d3748;
            border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .auth-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        /* 认证模态框 */
        .auth-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        }

        .auth-modal.hidden {
            display: none;
        }

        .auth-form {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-50px) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .auth-form h2 {
            text-align: center;
            margin-bottom: 30px;
            color: #2d3748;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #4a5568;
            font-weight: 500;
        }

        .form-group input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }

        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }

        .form-buttons {
            display: flex;
            gap: 10px;
            margin-top: 30px;
        }

        .form-buttons button {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .form-buttons .primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .form-buttons .secondary {
            background: #e2e8f0;
            color: #4a5568;
        }

        .form-buttons button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .error-message {
            background: #fed7d7;
            color: #c53030;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }

        .success-message {
            background: #c6f6d5;
            color: #2f855a;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }

        /* 聊天容器 */
        .chat-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            max-width: 900px;
            margin: 0 auto;
            width: 100%;
            padding: 0 16px;
            min-height: 0;
        }

        /* 聊天消息区域 */
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 24px 0;
            display: flex;
            flex-direction: column;
            gap: 16px;
            min-height: 0;
            max-height: calc(100vh - 180px);
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
            gap: 12px;
            max-width: 80%;
            animation: messageSlideIn 0.4s ease-out;
            margin-bottom: 20px;
        }

        @keyframes messageSlideIn {
            from { 
                opacity: 0; 
                transform: translateY(12px) scale(0.98); 
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
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 13px;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
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
            background: rgba(255, 255, 255, 0.98);
            padding: 14px 18px;
            border-radius: 18px;
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
            position: relative;
            line-height: 1.5;
            transition: all 0.2s ease;
            word-wrap: break-word;
        }

        .message-content:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        .message.user .message-content {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            box-shadow: 0 2px 12px rgba(102, 126, 234, 0.25);
        }

        .message.user .message-content:hover {
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.35);
        }

        .message.assistant .message-content {
            background: rgba(255, 255, 255, 0.98);
            color: #2d3748;
            border: 1px solid rgba(226, 232, 240, 0.6);
        }

        .message.assistant .message-content:hover {
            box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15);
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
        .message-content blockquote,
        .message-content .markdown-blockquote {
            margin: 12px 0;
            padding: 12px 16px;
            border-left: 4px solid #6366f1;
            background: rgba(99, 102, 241, 0.05);
            border-radius: 0 8px 8px 0;
            font-style: italic;
            color: #4a5568;
            position: relative;
        }

        .message-content .markdown-blockquote::before {
            content: '"';
            font-size: 3em;
            color: rgba(99, 102, 241, 0.2);
            position: absolute;
            top: -10px;
            left: 10px;
            font-family: Georgia, serif;
        }

        /* 增强Prism.js代码高亮样式 */
        .code-block pre[class*="language-"] {
            margin: 0;
            padding: 16px !important;
            background: #1a1a1a !important;
            color: #e2e8f0 !important;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            border: none !important;
        }

        /* 针对不同语言的特殊处理 */
        .language-javascript .token.keyword,
        .language-js .token.keyword,
        .language-typescript .token.keyword,
        .language-ts .token.keyword {
            color: #c792ea !important;
        }

        .language-python .token.keyword {
            color: #ff5555 !important;
        }

        .language-json .token.property {
            color: #80cbc4 !important;
        }

        /* 添加行号支持的样式 */
        .code-block pre.line-numbers {
            padding-left: 3.8em !important;
            counter-reset: linenumber;
        }

        .code-block pre.line-numbers > code {
            position: relative;
            white-space: inherit;
        }

        .code-block .line-numbers-rows {
            position: absolute;
            pointer-events: none;
            top: 0;
            font-size: 100%;
            left: -3.8em;
            width: 3em;
            letter-spacing: -1px;
            border-right: 1px solid #444;
            user-select: none;
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
            padding: 20px 16px;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            border-top: 1px solid rgba(226, 232, 240, 0.6);
            border-radius: 20px 20px 0 0;
            position: sticky;
            bottom: 0;
            z-index: 100;
            box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.08);
        }

        .chat-input-wrapper {
            display: flex;
            gap: 12px;
            align-items: flex-end;
            max-width: 900px;
            margin: 0 auto;
        }

        .chat-input {
            flex: 1;
            border: 2px solid rgba(226, 232, 240, 0.8);
            border-radius: 20px;
            padding: 12px 18px;
            font-size: 16px;
            outline: none;
            transition: all 0.3s ease;
            resize: none;
            min-height: 24px;
            max-height: 100px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            font-family: inherit;
            overflow-y: auto;
            line-height: 1.5;
        }

        .chat-input:focus {
            border-color: #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
            transform: translateY(-1px);
        }

        .send-btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            flex-shrink: 0;
            font-size: 18px;
            box-shadow: 0 3px 12px rgba(102, 126, 234, 0.3);
        }
        
        .send-btn:hover:not(:disabled) {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
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
            gap: 12px;
            padding: 12px 18px;
            margin: 8px 16px;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.98);
            border-radius: 18px;
            backdrop-filter: blur(15px);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(226, 232, 240, 0.6);
            max-width: 200px;
        }

        .typing-indicator.show {
            opacity: 1;
            transform: translateY(0);
        }

        .typing-indicator .message-avatar {
            width: 32px;
            height: 32px;
            font-size: 12px;
            background: linear-gradient(135deg, #10b981, #059669);
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
            animation: avatarPulse 2s infinite;
        }

        .typing-dots {
            display: flex;
            gap: 4px;
            padding: 0;
            background: transparent;
            border-radius: 0;
            backdrop-filter: none;
            box-shadow: none;
        }

        .typing-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #10b981;
            animation: typing 1.4s ease-in-out infinite;
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
                transform: translateY(-6px);
                opacity: 1;
                background: #059669;
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
            .header {
                padding: 12px 16px;
                min-height: 64px;
            }
            
            .header-left {
                gap: 4px;
            }
            
            .header h1 {
                font-size: 18px;
            }
            
            .header-right {
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .model-indicator {
                font-size: 12px;
                padding: 4px 8px;
                gap: 6px;
                max-width: 160px;
            }
            
            .model-badge {
                font-size: 10px;
                padding: 2px 8px;
            }
            
            .chat-container {
                padding: 0 12px;
            }
            
            .chat-messages {
                padding: 16px 0;
                gap: 12px;
                max-height: calc(100vh - 160px);
            }
            
            .message {
                max-width: 90%;
                gap: 10px;
                margin-bottom: 16px;
            }
            
            .message-avatar {
                width: 32px;
                height: 32px;
                font-size: 12px;
            }
            
            .message-content {
                padding: 12px 16px;
                border-radius: 16px;
            }
            
            .chat-input-container {
                padding: 16px 12px;
                border-radius: 16px 16px 0 0;
            }
            
            .chat-input-wrapper {
                gap: 10px;
            }
            
            .chat-input {
                border-radius: 18px;
                padding: 10px 16px;
                font-size: 16px;
            }
            
            .send-btn {
                width: 44px;
                height: 44px;
                font-size: 16px;
            }
            
            .settings-panel {
                width: 100vw;
                right: -100vw;
            }
            
            .settings-panel.show {
                right: 0;
            }
            
            .auth-form {
                margin: 20px;
                padding: 32px;
                max-width: calc(100vw - 40px);
            }
        }

        @media (max-width: 480px) {
            .header {
                padding: 10px 12px;
                min-height: 60px;
            }
            
            .header-right {
                gap: 4px;
                flex-wrap: wrap;
                justify-content: flex-end;
                width: auto;
                max-width: calc(100vw - 200px);
            }
            
            .header h1 {
                font-size: 16px;
            }
            
            .header h1::before {
                font-size: 20px;
            }
            
            .model-indicator {
                font-size: 10px;
                max-width: 80px;
                padding: 2px 6px;
                order: 4;
                flex-shrink: 2;
            }
            
            .model-indicator span:first-child {
                display: none;
            }
            
            .user-info {
                font-size: 11px;
                order: 1;
                flex-basis: 100%;
                margin-bottom: 2px;
            }
            
            .auth-buttons {
                order: 2;
                gap: 4px;
                flex-shrink: 0;
            }
            
            .auth-btn {
                padding: 6px 12px;
                font-size: 12px;
            }
            
            .settings-btn {
                order: 3;
                width: 32px;
                height: 32px;
                font-size: 12px;
                flex-shrink: 0;
            }
            
            .chat-container {
                padding: 0 8px;
            }
            
            .message {
                max-width: 95%;
            }
            
            .message-content {
                padding: 10px 14px;
                border-radius: 14px;
            }
            
            .chat-input-container {
                padding: 12px 8px;
            }
            
            .chat-input {
                padding: 8px 14px;
                border-radius: 16px;
            }
            
            .send-btn {
                width: 40px;
                height: 40px;
                font-size: 14px;
            }
            
            .welcome-message {
                padding: 40px 20px;
                margin: 20px auto;
            }
            
            .welcome-message h2 {
                font-size: 24px;
            }
        }

        /* 隐藏类 */
        .hidden {
            display: none !important;
        }

        /* 欢迎消息 */
        .welcome-message {
            text-align: center;
            padding: 48px 24px;
            color: rgba(255, 255, 255, 0.95);
            animation: welcomeFadeIn 0.8s ease-out;
            max-width: 600px;
            margin: 32px auto;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @keyframes welcomeFadeIn {
            from {
                opacity: 0;
                transform: translateY(20px) scale(0.98);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .welcome-message h2 {
            color: white;
            margin-bottom: 16px;
            font-size: 28px;
            font-weight: 700;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }

        .welcome-message h2::before {
            content: "✨";
            font-size: 32px;
            animation: sparkle 2s ease-in-out infinite;
        }

        @keyframes sparkle {
            0%, 100% { 
                transform: rotate(0deg) scale(1);
                filter: brightness(1);
            }
            50% { 
                transform: rotate(10deg) scale(1.1);
                filter: brightness(1.2);
            }
        }

        .welcome-message p {
            font-size: 16px;
            line-height: 1.6;
            opacity: 0.9;
        }
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
        <div class="header-left">
            <h1>NeoAI 智能对话</h1>
        </div>
        <div class="header-right">
            <div class="model-indicator">
                <span>当前模型:</span>
                <span class="model-badge" id="currentModelBadge">AutoRAG</span>
            </div>
            <!-- 已登录用户信息 -->
            <div id="userInfo" class="user-info hidden">
                <span>👋 您好, <span class="username" id="username"></span></span>
                <button class="auth-btn secondary" id="logoutBtn">登出</button>
            </div>
            <!-- 未登录时的按钮 -->
            <div id="authButtons" class="auth-buttons">
                <button class="auth-btn secondary" id="loginBtn">登录</button>
                <button class="auth-btn primary" id="registerBtn">注册</button>
            </div>
            <button class="settings-btn" id="settingsBtn" title="设置">
                ⚙️
            </button>
        </div>
    </div>

    <!-- 登录模态框 -->
    <div id="loginModal" class="auth-modal hidden">
        <div class="auth-form">
            <h2>用户登录</h2>
            <div id="loginError" class="error-message hidden"></div>
            <div id="loginSuccess" class="success-message hidden"></div>
            <form id="loginForm">
                <div class="form-group">
                    <label for="loginIdentifier">用户名或邮箱</label>
                    <input type="text" id="loginIdentifier" name="identifier" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">密码</label>
                    <input type="password" id="loginPassword" name="password" required>
                </div>
                <div class="form-buttons">
                    <button type="button" class="secondary" id="loginCancelBtn">取消</button>
                    <button type="submit" class="primary">登录</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 注册模态框 -->
    <div id="registerModal" class="auth-modal hidden">
        <div class="auth-form">
            <h2>用户注册</h2>
            <div id="registerError" class="error-message hidden"></div>
            <div id="registerSuccess" class="success-message hidden"></div>
            <form id="registerForm">
                <div class="form-group">
                    <label for="registerUsername">用户名</label>
                    <input type="text" id="registerUsername" name="username" required 
                           placeholder="3-20个字符，只能包含字母、数字、下划线">
                </div>
                <div class="form-group">
                    <label for="registerEmail">邮箱</label>
                    <input type="email" id="registerEmail" name="email" required>
                </div>
                <div class="form-group">
                    <label for="registerPassword">密码</label>
                    <input type="password" id="registerPassword" name="password" required 
                           placeholder="至少6位，包含字母和数字">
                </div>
                <div class="form-buttons">
                    <button type="button" class="secondary" id="registerCancelBtn">取消</button>
                    <button type="submit" class="primary">注册</button>
                </div>
            </form>
        </div>
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
        let currentUser = null; // 当前登录用户信息
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
        
        // 认证相关DOM元素
        let userInfo, authButtons, loginBtn, registerBtn, logoutBtn;
        let loginModal, registerModal, loginForm, registerForm;
        let loginError, loginSuccess, registerError, registerSuccess;

        /**
         * 初始化应用
         */
        document.addEventListener('DOMContentLoaded', function() {
            console.log('页面DOM加载完成，开始初始化应用...');
            initializeElements();
            setupEventListeners();
            loadSettings();
            loadModels();
            setupAutoResize();
            setupImageClickHandlers();
            initializeMarkdown();
            checkUserAuth(); // 检查用户登录状态
            console.log('应用初始化完成');
        });

        /**
         * 初始化Markdown解析器
         */
        function initializeMarkdown() {
            // 等待marked.js加载完成
            if (typeof marked === 'undefined') {
                setTimeout(initializeMarkdown, 100);
                return;
            }

            // 配置Prism.js（如果可用）
            if (typeof Prism !== 'undefined') {
                // 设置Prism.js自动加载器
                if (Prism.plugins && Prism.plugins.autoloader) {
                    Prism.plugins.autoloader.languages_path = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/';
                }
                
                // 禁用自动高亮（我们会手动控制）
                Prism.manual = true;
                
                // 添加自定义语言别名
                if (Prism.languages) {
                    // JavaScript别名
                    if (Prism.languages.javascript) {
                        Prism.languages.js = Prism.languages.javascript;
                    }
                    
                    // TypeScript别名
                    if (Prism.languages.typescript) {
                        Prism.languages.ts = Prism.languages.typescript;
                    }
                    
                    // Python别名
                    if (Prism.languages.python) {
                        Prism.languages.py = Prism.languages.python;
                    }
                }
            }

            console.log('Markdown解析器初始化完成');
        }

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
            
            // 认证相关元素
            userInfo = document.getElementById('userInfo');
            authButtons = document.getElementById('authButtons');
            loginBtn = document.getElementById('loginBtn');
            registerBtn = document.getElementById('registerBtn');
            logoutBtn = document.getElementById('logoutBtn');
            
            loginModal = document.getElementById('loginModal');
            registerModal = document.getElementById('registerModal');
            loginForm = document.getElementById('loginForm');
            registerForm = document.getElementById('registerForm');
            
            loginError = document.getElementById('loginError');
            loginSuccess = document.getElementById('loginSuccess');
            registerError = document.getElementById('registerError');
            registerSuccess = document.getElementById('registerSuccess');
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
            
            // 认证相关事件监听
            setupAuthEventListeners();
        }

        /**
         * 设置认证相关事件监听器
         */
        function setupAuthEventListeners() {
            // 登录按钮
            if (loginBtn) {
                loginBtn.addEventListener('click', showLoginModal);
            }
            
            // 注册按钮
            if (registerBtn) {
                registerBtn.addEventListener('click', showRegisterModal);
            }
            
            // 登出按钮
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleLogout);
            }
            
            // 登录表单提交
            if (loginForm) {
                loginForm.addEventListener('submit', handleLogin);
            }
            
            // 注册表单提交
            if (registerForm) {
                registerForm.addEventListener('submit', handleRegister);
            }
            
            // 模态框关闭事件
            setupModalCloseEvents();
        }

        /**
         * 设置模态框关闭事件
         */
        function setupModalCloseEvents() {
            // 登录模态框关闭
            const loginCancelBtn = document.getElementById('loginCancelBtn');
            if (loginCancelBtn) {
                loginCancelBtn.addEventListener('click', hideLoginModal);
            }
            
            // 注册模态框关闭
            const registerCancelBtn = document.getElementById('registerCancelBtn');
            if (registerCancelBtn) {
                registerCancelBtn.addEventListener('click', hideRegisterModal);
            }
            
            // 点击模态框背景关闭
            if (loginModal) {
                loginModal.addEventListener('click', function(e) {
                    if (e.target === loginModal) {
                        hideLoginModal();
                    }
                });
            }
            
            if (registerModal) {
                registerModal.addEventListener('click', function(e) {
                    if (e.target === registerModal) {
                        hideRegisterModal();
                    }
                });
            }
            
            // ESC键关闭模态框
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    hideLoginModal();
                    hideRegisterModal();
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
                    addMessage('assistant', data.response, null, data.sources, data.model);
                    updateModelBadge(data.model);
                } else {
                    // 显示错误消息
                    addMessage('assistant', '抱歉，处理您的请求时出现了错误：' + data.error, null, [], '错误');
                }
                
            } catch (error) {
                console.error('发送消息失败:', error);
                addMessage('assistant', '抱歉，网络连接出现问题，请稍后再试。', null, [], '错误');
            }
            
            // 隐藏打字指示器
            hideTypingIndicator();
            
            // 重新启用输入
            setLoading(false);
        }

        /**
         * 添加消息到聊天界面
         * @param {string} role - 消息角色 ('user' 或 'assistant')
         * @param {string} content - 消息内容
         * @param {Date|null} timestamp - 消息时间戳（可选）
         * @param {Array} sources - 来源信息（可选）
         * @param {string} model - 模型信息（可选）
         */
        function addMessage(role, content, timestamp = null, sources = [], model = '') {
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
            
            // 处理消息内容（支持完整的Markdown）
            const processedContent = processMessageContent(content);
            messageContent.innerHTML = processedContent;
            
            // 对代码块进行语法高亮处理
            if (typeof Prism !== 'undefined') {
                const codeBlocks = messageContent.querySelectorAll('pre code[class*="language-"]');
                codeBlocks.forEach(block => {
                    try {
                        Prism.highlightElement(block);
                    } catch (error) {
                        console.warn('代码高亮失败:', error);
                    }
                });
            }
            
            // 添加时间戳
            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-time';
            const displayTime = timestamp || new Date();
            timeDiv.textContent = displayTime.toLocaleTimeString('zh-CN', {
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
                sourcesDiv.innerHTML = '<strong>参考来源:</strong><ul>' + 
                    sources.map(source => '<li>' + escapeHtml(source) + '</li>').join('') + 
                    '</ul>';
                contentWrapper.appendChild(sourcesDiv);
            }
            
            messageDiv.appendChild(contentWrapper);
            chatMessages.appendChild(messageDiv);
            
            // 滚动到底部
            scrollToBottom();
        }

        /**
         * 处理消息内容（使用marked.js解析Markdown）
         */
        function processMessageContent(content) {
            // 配置marked选项
            marked.setOptions({
                highlight: function(code, lang) {
                    // 如果Prism.js已加载且支持该语言，使用语法高亮
                    if (typeof Prism !== 'undefined' && Prism.languages[lang]) {
                        return Prism.highlight(code, Prism.languages[lang], lang);
                    }
                    return escapeHtml(code);
                },
                langPrefix: 'language-',
                breaks: true,  // 支持GitHub风格的换行
                gfm: true,     // 启用GitHub风格的Markdown
                tables: true,  // 支持表格
                sanitize: false,  // 允许HTML（我们稍后会手动清理）
                smartLists: true,
                smartypants: false,
                xhtml: false
            });

            // 自定义渲染器
            const renderer = new marked.Renderer();
            
            // 自定义代码块渲染
            renderer.code = function(code, language, escaped) {
                const validLanguage = language && language.match(/^[a-zA-Z0-9_+-]*$/);
                const langClass = validLanguage ? 'language-' + language : 'language-text';
                const langDisplay = validLanguage ? language.toUpperCase() : 'TEXT';
                
                return '<div class="code-block">' +
                    '<div class="code-language">' + langDisplay + '</div>' +
                    '<pre><code class="' + langClass + '">' + (escaped ? code : escapeHtml(code)) + '</code></pre>' +
                    '<button class="copy-code-btn" onclick="copyToClipboard(this)" title="复制代码">📋</button>' +
                '</div>';
            };

            // 自定义内联代码渲染
            renderer.codespan = function(code) {
                return '<code class="inline-code">' + escapeHtml(code) + '</code>';
            };

            // 自定义表格渲染
            renderer.table = function(header, body) {
                return '<table class="markdown-table">' +
                    '<thead>' + header + '</thead>' +
                    '<tbody>' + body + '</tbody>' +
                '</table>';
            };

            // 自定义链接渲染（添加安全属性）
            renderer.link = function(href, title, text) {
                // 验证链接安全性
                const isExternal = href.startsWith('http://') || href.startsWith('https://');
                const titleAttr = title ? ' title="' + escapeHtml(title) + '"' : '';
                const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
                
                return '<a href="' + escapeHtml(href) + '"' + titleAttr + targetAttr + '>' + text + '</a>';
            };

            // 自定义图片渲染
            renderer.image = function(href, title, text) {
                const titleAttr = title ? ' title="' + escapeHtml(title) + '"' : '';
                const altAttr = text ? ' alt="' + escapeHtml(text) + '"' : '';
                
                return '<img src="' + escapeHtml(href) + '" class="message-image" loading="lazy"' + titleAttr + altAttr + '>';
            };

            // 自定义引用块渲染
            renderer.blockquote = function(quote) {
                return '<blockquote class="markdown-blockquote">' + quote + '</blockquote>';
            };

            // 使用自定义渲染器
            marked.setOptions({ renderer: renderer });

            try {
                // 使用marked.js解析Markdown
                let html = marked.parse(content);
                
                // 后处理：添加列表样式类
                html = html.replace(/<ul>/g, '<ul class="message-list">');
                html = html.replace(/<ol>/g, '<ol class="message-list ordered">');
                
                return html;
            } catch (error) {
                console.error('Markdown解析错误:', error);
                // 如果解析失败，回退到简单的HTML转义
                return escapeHtml(content).replace(/\\n/g, '<br>');
            }
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

        // ==================== 认证相关函数 ====================

        /**
         * 检查用户认证状态
         */
        async function checkUserAuth() {
            try {
                console.log('检查用户认证状态...');
                const response = await fetch('/api/auth/profile', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        console.log('用户已登录:', data.user.username);
                        currentUser = data.user;
                        await updateAuthUI(true);
                        return;
                    }
                }
                
                // 用户未登录
                console.log('用户未登录');
                currentUser = null;
                updateAuthUI(false);
            } catch (error) {
                console.log('认证状态检查失败:', error);
                updateAuthUI(false);
            }
        }

        /**
         * 更新认证UI状态
         * @param {boolean} isLoggedIn - 是否已登录
         */
        async function updateAuthUI(isLoggedIn) {
            if (isLoggedIn && currentUser) {
                // 已登录状态
                userInfo.classList.remove('hidden');
                authButtons.classList.add('hidden');
                document.getElementById('username').textContent = currentUser.username;
                
                // 加载用户的历史聊天记录
                await loadChatHistory();
            } else {
                // 未登录状态
                userInfo.classList.add('hidden');
                authButtons.classList.remove('hidden');
                
                // 清除历史记录，只保留欢迎消息
                clearChatHistory();
            }
        }

        /**
         * 显示登录模态框
         */
        function showLoginModal() {
            clearAuthMessages();
            loginModal.classList.remove('hidden');
            document.getElementById('loginIdentifier').focus();
        }

        /**
         * 隐藏登录模态框
         */
        function hideLoginModal() {
            loginModal.classList.add('hidden');
            clearAuthMessages();
            loginForm.reset();
        }

        /**
         * 显示注册模态框
         */
        function showRegisterModal() {
            clearAuthMessages();
            registerModal.classList.remove('hidden');
            document.getElementById('registerUsername').focus();
        }

        /**
         * 隐藏注册模态框
         */
        function hideRegisterModal() {
            registerModal.classList.add('hidden');
            clearAuthMessages();
            registerForm.reset();
        }

        /**
         * 清除认证消息
         */
        function clearAuthMessages() {
            [loginError, loginSuccess, registerError, registerSuccess].forEach(el => {
                if (el) {
                    el.classList.add('hidden');
                    el.textContent = '';
                }
            });
        }

        /**
         * 显示认证错误消息
         * @param {HTMLElement} element - 错误元素
         * @param {string} message - 错误消息
         */
        function showAuthError(element, message) {
            element.textContent = message;
            element.classList.remove('hidden');
        }

        /**
         * 显示认证成功消息
         * @param {HTMLElement} element - 成功元素
         * @param {string} message - 成功消息
         */
        function showAuthSuccess(element, message) {
            element.textContent = message;
            element.classList.remove('hidden');
        }

        /**
         * 处理用户登录
         * @param {Event} event - 表单提交事件
         */
        async function handleLogin(event) {
            event.preventDefault();
            clearAuthMessages();

            const formData = new FormData(loginForm);
            const data = {
                identifier: formData.get('identifier'),
                password: formData.get('password')
            };

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    showAuthSuccess(loginSuccess, result.message);
                    currentUser = result.user;
                    setTimeout(() => {
                        hideLoginModal();
                        updateAuthUI(true);
                    }, 1500);
                } else {
                    showAuthError(loginError, result.error);
                }
            } catch (error) {
                console.error('登录失败:', error);
                showAuthError(loginError, '登录失败，请检查网络连接');
            }
        }

        /**
         * 处理用户注册
         * @param {Event} event - 表单提交事件
         */
        async function handleRegister(event) {
            event.preventDefault();
            clearAuthMessages();

            const formData = new FormData(registerForm);
            const data = {
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password')
            };

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    showAuthSuccess(registerSuccess, result.message + '，请登录');
                    setTimeout(() => {
                        hideRegisterModal();
                        showLoginModal();
                    }, 1500);
                } else {
                    showAuthError(registerError, result.error);
                }
            } catch (error) {
                console.error('注册失败:', error);
                showAuthError(registerError, '注册失败，请检查网络连接');
            }
        }

        /**
         * 处理用户登出
         */
        async function handleLogout() {
            try {
                const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });

                // 无论请求是否成功，都清除本地状态
                currentUser = null;
                updateAuthUI(false);
                
                // 可以选择刷新页面来清理所有状态
                // window.location.reload();
                
            } catch (error) {
                console.error('登出失败:', error);
                // 即使登出请求失败，也清除本地状态
                currentUser = null;
                updateAuthUI(false);
            }
        }

        /**
         * 获取带认证信息的请求头
         * @returns {Object} 请求头对象
         */
        function getAuthHeaders() {
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // 如果用户已登录，添加认证信息
            // 由于我们使用Cookie认证，浏览器会自动包含cookies
            
            return headers;
        }

        // ==================== 聊天历史记录相关函数 ====================

        /**
         * 加载用户聊天历史记录
         */
        async function loadChatHistory() {
            if (!currentUser) {
                console.log('用户未登录，跳过加载历史记录');
                return;
            }

            try {
                console.log('开始加载聊天历史记录...');
                
                const response = await fetch('/api/chat-history', {
                    method: 'GET',
                    credentials: 'include'
                });

                console.log('历史记录请求状态:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('历史记录响应数据:', data);
                    
                    if (data.success && data.history && data.history.length > 0) {
                        console.log('准备显示历史记录，共 ' + data.history.length + ' 条');
                        displayChatHistory(data.history);
                        console.log('历史记录显示完成');
                    } else {
                        console.log('没有找到历史记录或历史记录为空，显示欢迎消息');
                        showWelcomeMessage();
                    }
                } else {
                    const errorText = await response.text();
                    console.log('无法加载历史记录, HTTP状态码:', response.status, '错误信息:', errorText);
                    showWelcomeMessage();
                }
            } catch (error) {
                console.error('加载聊天历史失败:', error);
                showWelcomeMessage();
            }
        }

        /**
         * 显示聊天历史记录
         * @param {Array} history - 历史记录数组
         */
        function displayChatHistory(history) {
            console.log('开始显示聊天历史记录，共 ' + history.length + ' 条');
            
            // 直接清空聊天容器，不保留欢迎消息
            // 因为有历史记录时不应该显示欢迎消息
            chatMessages.innerHTML = '';

            // 按时间顺序显示历史记录（从旧到新）
            history.reverse().forEach((record, index) => {
                if (record.message && record.response) {
                    console.log('显示第 ' + (index + 1) + ' 条记录:', record.message.substring(0, 50) + '...');
                    // 添加用户消息
                    addMessage('user', record.message, new Date(record.created_at), [], '');
                    // 添加AI响应
                    addMessage('assistant', record.response, new Date(record.created_at), [], '');
                }
            });

            // 滚动到底部
            console.log('聊天历史记录显示完成，滚动到底部');
            scrollToBottomSmooth();
        }

        /**
         * 显示欢迎消息
         */
        function showWelcomeMessage() {
            chatMessages.innerHTML = '';
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message';
            welcomeDiv.innerHTML = '<h2>欢迎使用 NeoAI</h2><p>我是您的智能助手，可以回答问题、协助思考和提供信息。有什么我可以帮您的吗？</p>';
            chatMessages.appendChild(welcomeDiv);
        }

        /**
         * 清除聊天历史（保留欢迎消息）
         */
        function clearChatHistory() {
            showWelcomeMessage();
        }
    </script>
</body>
</html>`;
