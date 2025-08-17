/**
 * NeoAI 应用配置
 * @version 2.1.0
 */

// 应用信息
export const APP_NAME = "NeoAI";
export const APP_VERSION = "2.1.0";

// AI服务配置
export const AUTO_RAG_INSTANCE = "jolly-water-bbff";
export const LLM_MODEL = "@cf/meta/llama-2-7b-chat-int8";

// 系统限制
export const MAX_REQUEST_SIZE = 1024 * 1024; // 1MB
export const CACHE_TTL = 3600; // 1 hour
export const RATE_LIMIT_REQUESTS = 100; // 每小时请求限制

// 超时设置  
export const API_TIMEOUT = 30000; // 30秒

// 可用的回落模型列表
export const FALLBACK_MODELS = [
  "@cf/meta/llama-2-7b-chat-int8",
  "@cf/mistral/mistral-7b-instruct-v0.1", 
  "@cf/meta/llama-2-7b-chat-fp16",
  "@cf/microsoft/phi-2",
  "@cf/qwen/qwen1.5-0.5b-chat",
  "@cf/qwen/qwen1.5-1.8b-chat",
  "@cf/qwen/qwen1.5-7b-chat-awq"
];

// 完整配置对象（向后兼容）
export const CONFIG = {
  APP_NAME,
  APP_VERSION,
  AUTO_RAG_INSTANCE,
  LLM_MODEL,
  MAX_REQUEST_SIZE,
  CACHE_TTL,
  RATE_LIMIT_REQUESTS,
  API_TIMEOUT,
  FALLBACK_MODELS
};
