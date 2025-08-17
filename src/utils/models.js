/**
 * AI模型相关工具
 * @version 1.0.0
 */

// 获取模型显示名称
export function getModelDisplayName(modelId) {
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

// 获取模型分类
export function getModelCategory(modelId) {
  if (modelId.includes('llama')) return 'Meta Llama';
  if (modelId.includes('mistral')) return 'Mistral';
  if (modelId.includes('qwen')) return 'Qwen'; 
  if (modelId.includes('phi')) return 'Microsoft';
  if (modelId.includes('gemma')) return 'Google';
  if (modelId.includes('openchat')) return 'OpenChat';
  return 'Other';
}

// 测试模型可用性
export async function testModelAvailability(env, modelId) {
  try {
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
}

// 获取可用模型列表
export async function getAvailableModels(env, fallbackModels) {
  if (!env.AI) {
    return { models: fallbackModels, source: 'static' };
  }

  try {
    // 测试的模型列表
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

    // 并发测试模型可用性
    const modelTests = await Promise.allSettled(
      testModels.map(modelId => testModelAvailability(env, modelId))
    );

    // 处理测试结果
    const availableModels = {};
    modelTests.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const model = result.value;
        if (model.available) {
          availableModels[model.id] = model.name;
        }
        console.log('模型 ' + model.id + ': ' + (model.available ? '可用' : '不可用'));
      }
    });

    return {
      models: Object.keys(availableModels).length > 0 ? availableModels : fallbackModels,
      source: 'dynamic'
    };

  } catch (error) {
    console.error('动态模型检测失败:', error);
    return { models: fallbackModels, source: 'static' };
  }
}
