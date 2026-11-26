/**
 * Centralized Model Registry and Dynamic Routing Service
 * Single source of truth for all supported model configurations, aliases, tiers, and capabilities.
 */

export const DEFAULT_MODEL_ID = 'google/gemini-2.5-flash';
export const DEFAULT_FALLBACK_MODEL = 'google/gemini-2.5-flash';

import { isMahiEngine, MAHI_ENGINE_SYSTEM_PROMPT } from './mahiEngineResolver.js';

export { isMahiEngine, MAHI_ENGINE_SYSTEM_PROMPT };

export const MODEL_REGISTRY = {
  // Free / Active Models
  'google/gemini-2.5-flash': {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    tier: 'free',
    costTier: 'standard',
    contextWindow: 1048576,
    capabilities: { streaming: true, image: false, reasoning: false, coding: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'google/gemini-3.8-flash': {
    id: 'google/gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'google',
    tier: 'pro',
    costTier: 'standard',
    contextWindow: 1048576,
    capabilities: { streaming: true, image: false, reasoning: false, coding: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'qwen/qwen-2.5-coder-32b-instruct': {
    id: 'qwen/qwen-2.5-coder-32b-instruct',
    name: 'Qwen 2.5 Coder',
    provider: 'qwen',
    tier: 'free',
    costTier: 'standard',
    contextWindow: 32768,
    capabilities: { streaming: true, image: false, reasoning: false, coding: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'openai/gpt-5-mini': {
    id: 'openai/gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'openai',
    tier: 'free',
    costTier: 'standard',
    contextWindow: 128000,
    capabilities: { streaming: true, image: false, reasoning: false, coding: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'openai/gpt-4o-mini': {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    tier: 'free',
    costTier: 'standard',
    contextWindow: 128000,
    capabilities: { streaming: true, image: false, reasoning: false, coding: true, tools: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'openai/o3-mini': {
    id: 'openai/o3-mini',
    name: 'o3-mini',
    provider: 'openai',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 200000,
    capabilities: { streaming: true, image: false, reasoning: true, coding: true, tools: true },
    fallback: 'openai/gpt-4o-mini'
  },
  'mistralai/mistral-small-24b-instruct-2501': {
    id: 'mistralai/mistral-small-24b-instruct-2501',
    name: 'Mistral Small',
    provider: 'mistral',
    tier: 'free',
    costTier: 'standard',
    contextWindow: 32768,
    capabilities: { streaming: true, image: false, reasoning: false },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'nvidia/llama-3.1-nemotron-70b-instruct': {
    id: 'nvidia/llama-3.1-nemotron-70b-instruct',
    name: 'Nemotron Fast',
    provider: 'nvidia',
    tier: 'free',
    costTier: 'standard',
    contextWindow: 131072,
    capabilities: { streaming: true, image: false, reasoning: false },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'moonshotai/kimi-k3': {
    id: 'moonshotai/kimi-k3',
    name: 'Kimi K3',
    provider: 'moonshot',
    tier: 'free',
    costTier: 'standard',
    contextWindow: 8192,
    capabilities: { streaming: true, image: false, reasoning: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'moonshotai/moonshot-v1-8k': {
    id: 'moonshotai/moonshot-v1-8k',
    name: 'Moonshot v1 8k',
    provider: 'moonshot',
    tier: 'free',
    costTier: 'standard',
    contextWindow: 8192,
    capabilities: { streaming: true, image: false, reasoning: false },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'deepseek/deepseek-chat': {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    tier: 'free',
    costTier: 'standard',
    contextWindow: 65536,
    capabilities: { streaming: true, image: false, reasoning: false, coding: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'deepseek/deepseek-v4-flash-0731': {
    id: 'deepseek/deepseek-v4-flash-0731',
    name: 'DeepSeek V4 Flash',
    provider: 'deepseek',
    tier: 'free',
    costTier: 'standard',
    contextWindow: 65536,
    capabilities: { streaming: true, image: false, reasoning: false, coding: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },

  // Pro / Frontier Models
  'openai/gpt-4o': {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 128000,
    capabilities: { streaming: true, image: false, reasoning: true, coding: true, tools: true },
    fallback: 'openai/gpt-4o-mini'
  },
  'google/gemini-pro-1.5': {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini 3.1 Pro',
    provider: 'google',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 2097152,
    capabilities: { streaming: true, image: false, reasoning: true, coding: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'google/gemini-3.1-pro-preview': {
    id: 'google/gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    provider: 'google',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 2097152,
    capabilities: { streaming: true, image: false, reasoning: true, coding: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'openai/gpt-6-sol': {
    id: 'openai/gpt-6-sol',
    name: 'GPT-6 Sol',
    provider: 'openai',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 128000,
    capabilities: { streaming: true, image: false, reasoning: true, coding: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'openai/chatgpt-4o-latest': {
    id: 'openai/chatgpt-4o-latest',
    name: 'GPT-6 Sol',
    provider: 'openai',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 128000,
    capabilities: { streaming: true, image: false, reasoning: true, coding: true },
    fallback: 'openai/gpt-4o-mini'
  },
  'anthropic/claude-sonnet-5': {
    id: 'anthropic/claude-sonnet-5',
    name: 'Claude Sonnet 5',
    provider: 'anthropic',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 200000,
    capabilities: { streaming: true, image: false, reasoning: true, coding: true },
    fallback: 'anthropic/claude-haiku-4.5'
  },
  'anthropic/claude-3-5-sonnet': {
    id: 'anthropic/claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 200000,
    capabilities: { streaming: true, image: false, reasoning: true, coding: true },
    fallback: 'anthropic/claude-3-5-haiku'
  },
  'anthropic/claude-3.5-sonnet': {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 200000,
    capabilities: { streaming: true, image: false, reasoning: true, coding: true },
    fallback: 'anthropic/claude-3.5-haiku'
  },
  'deepseek/deepseek-r1': {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 65536,
    capabilities: { streaming: true, image: false, reasoning: true, coding: true },
    fallback: 'deepseek/deepseek-chat'
  },
  'deepseek/deepseek-v4-pro-0813': {
    id: 'deepseek/deepseek-v4-pro-0813',
    name: 'DeepSeek V4 Pro',
    provider: 'deepseek',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 65536,
    capabilities: { streaming: true, image: false, reasoning: true, coding: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'qwen/qwen3.8-max-0902': {
    id: 'qwen/qwen3.8-max-0902',
    name: 'Qwen 3.8 Max',
    provider: 'qwen',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 32768,
    capabilities: { streaming: true, image: false, reasoning: true, coding: true },
    fallback: 'qwen/qwen-2.5-coder-32b-instruct'
  },
  'qwen/qwen-2.5-72b-instruct': {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B',
    provider: 'qwen',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 32768,
    capabilities: { streaming: true, image: false, reasoning: true, coding: true },
    fallback: 'qwen/qwen-2.5-coder-32b-instruct'
  },
  'qwen/qwen-max': {
    id: 'qwen/qwen-max',
    name: 'Qwen 3.5 Max',
    provider: 'qwen',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 32768,
    capabilities: { streaming: true, image: false, reasoning: true, coding: true },
    fallback: 'qwen/qwen-2.5-coder-32b-instruct'
  },
  'moonshotai/moonshot-v1-32k': {
    id: 'moonshotai/moonshot-v1-32k',
    name: 'Kimi K3 (32k)',
    provider: 'moonshot',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 32768,
    capabilities: { streaming: true, image: false, reasoning: true },
    fallback: 'moonshotai/moonshot-v1-8k'
  },
  'zhipu/glm-4': {
    id: 'zhipu/glm-4',
    name: 'GLM 5.3',
    provider: 'zhipu',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 128000,
    capabilities: { streaming: true, image: false, reasoning: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'x-ai/grok-4.3': {
    id: 'x-ai/grok-4.3',
    name: 'Grok 4.3',
    provider: 'xai',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 131072,
    capabilities: { streaming: true, image: false, reasoning: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'x-ai/grok-2-1212': {
    id: 'x-ai/grok-2-1212',
    name: 'Grok 2',
    provider: 'xai',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 131072,
    capabilities: { streaming: true, image: false, reasoning: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'anthropic/claude-haiku-4.5': {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude 4.5 Haiku',
    provider: 'anthropic',
    tier: 'pro',
    costTier: 'standard',
    contextWindow: 200000,
    capabilities: { streaming: true, image: false, reasoning: false, coding: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'anthropic/claude-3-5-haiku': {
    id: 'anthropic/claude-3-5-haiku',
    name: 'Claude 4.5 Haiku',
    provider: 'anthropic',
    tier: 'pro',
    costTier: 'standard',
    contextWindow: 200000,
    capabilities: { streaming: true, image: false, reasoning: false, coding: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'anthropic/claude-3.5-haiku': {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 4.5 Haiku',
    provider: 'anthropic',
    tier: 'pro',
    costTier: 'standard',
    contextWindow: 200000,
    capabilities: { streaming: true, image: false, reasoning: false, coding: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'x-ai/grok-4.7': {
    id: 'x-ai/grok-4.7',
    name: 'Grok 4.7',
    provider: 'xai',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 131072,
    capabilities: { streaming: true, image: false, reasoning: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'x-ai/grok-2': {
    id: 'x-ai/grok-2',
    name: 'Grok 2',
    provider: 'xai',
    tier: 'pro',
    costTier: 'high',
    contextWindow: 131072,
    capabilities: { streaming: true, image: false, reasoning: true },
    fallback: DEFAULT_FALLBACK_MODEL
  },
  'anthropic/claude-opus-5.5': {
    id: 'anthropic/claude-opus-5.5',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    tier: 'max',
    costTier: 'ultra',
    contextWindow: 200000,
    capabilities: { streaming: true, image: false, reasoning: true, coding: true },
    fallback: 'anthropic/claude-3-5-sonnet'
  },
  'anthropic/claude-3-opus': {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    tier: 'max',
    costTier: 'ultra',
    contextWindow: 200000,
    capabilities: { streaming: true, image: false, reasoning: true, coding: true },
    fallback: 'anthropic/claude-3-5-sonnet'
  }
};

/**
 * Maps frontend dropdown keys, slugs, and UI labels to canonical OpenRouter endpoints.
 */
export const MODEL_ALIASES = {
  // Free / Active Models (Exclusively OpenRouter Models - Mahi Engine is handled by Dedicated System B)
  'gpt-5-mini': 'openai/gpt-4o-mini',
  'GPT-5 Mini': 'openai/gpt-4o-mini',
  'gpt 5 mini': 'openai/gpt-4o-mini',
  'o3-mini': 'openai/o3-mini',
  'gemini-2.5-flash': 'google/gemini-2.5-flash',
  'gemini-2-5-flash': 'google/gemini-2.5-flash',
  'Gemini 2.5 Flash': 'google/gemini-2.5-flash',
  'gemini-3.5-flash': 'google/gemini-2.5-flash',
  'gemini-3-5-flash': 'google/gemini-2.5-flash',
  'Gemini 3.5 Flash': 'google/gemini-2.5-flash',
  'qwen-2.5-coder': 'qwen/qwen-2.5-coder-32b-instruct',
  'qwen 2.5 coder': 'qwen/qwen-2.5-coder-32b-instruct',
  'qwen-2-5-coder': 'qwen/qwen-2.5-coder-32b-instruct',
  'Qwen 2.5 Coder': 'qwen/qwen-2.5-coder-32b-instruct',
  'qwen/qwen-2.5-coder-32b-instruct': 'qwen/qwen-2.5-coder-32b-instruct',
  'qwen-3-7-coder': 'qwen/qwen-2.5-coder-32b-instruct',
  'qwen 3.7 coder': 'qwen/qwen-2.5-coder-32b-instruct',
  'Qwen 3.7 Coder': 'qwen/qwen-2.5-coder-32b-instruct',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'GPT-4o Mini': 'openai/gpt-4o-mini',
  'mistral-small': 'mistralai/mistral-small-24b-instruct-2501',
  'Mistral Small': 'mistralai/mistral-small-24b-instruct-2501',
  'nemotron-fast': 'nvidia/llama-3.1-nemotron-70b-instruct',
  'Nemotron Fast': 'nvidia/llama-3.1-nemotron-70b-instruct',
  'kimi-k3-fast': 'moonshotai/moonshot-v1-8k',
  'Kimi K3 Fast': 'moonshotai/moonshot-v1-8k',
  'deepseek-v4-flash': 'deepseek/deepseek-chat',
  'deepseek v4 flash': 'deepseek/deepseek-chat',
  'DeepSeek V4 Flash': 'deepseek/deepseek-chat',
  'deepseek/deepseek-v4-flash-0731': 'deepseek/deepseek-chat',

  // Pro / Frontier Models
  'gpt-4o': 'openai/gpt-4o',
  'GPT-4o': 'openai/gpt-4o',
  'gemini-3.1-pro': 'google/gemini-3.1-pro-preview',
  'gemini-3-1-pro': 'google/gemini-3.1-pro-preview',
  'gemini 3.1 pro': 'google/gemini-3.1-pro-preview',
  'Gemini 3.1 Pro': 'google/gemini-3.1-pro-preview',
  'google/gemini-3.1-pro-preview': 'google/gemini-3.1-pro-preview',
  // Legacy fictional/unreleased UI aliases safely mapped to real available OpenRouter models
  'gpt-6-sol': 'google/gemini-2.5-flash',
  'gpt 6 sol': 'google/gemini-2.5-flash',
  'GPT-6 Sol': 'google/gemini-2.5-flash',
  'openai/gpt-6-sol': 'google/gemini-2.5-flash',
  'gpt-5-mini': 'openai/gpt-4o-mini',
  'GPT-5 Mini': 'openai/gpt-4o-mini',
  'openai/gpt-5-mini': 'openai/gpt-4o-mini',
  'claude-sonnet-5': 'anthropic/claude-3-5-sonnet',
  'claude sonnet 5': 'anthropic/claude-3-5-sonnet',
  'Claude Sonnet 5': 'anthropic/claude-3-5-sonnet',
  'anthropic/claude-sonnet-5': 'anthropic/claude-3-5-sonnet',
  'anthropic/claude-3.5-sonnet': 'anthropic/claude-3-5-sonnet',
  'deepseek-v4-pro': 'deepseek/deepseek-r1',
  'deepseek v4 pro': 'deepseek/deepseek-r1',
  'DeepSeek V4 Pro': 'deepseek/deepseek-r1',
  'deepseek/deepseek-v4-pro-0813': 'deepseek/deepseek-r1',
  'deepseek-v4-flash': 'deepseek/deepseek-chat',
  'deepseek v4 flash': 'deepseek/deepseek-chat',
  'DeepSeek V4 Flash': 'deepseek/deepseek-chat',
  'deepseek/deepseek-v4-flash-0731': 'deepseek/deepseek-chat',
  'deepseek-r1': 'deepseek/deepseek-r1',
  'DeepSeek R1': 'deepseek/deepseek-r1',
  'qwen-3.8-max': 'qwen/qwen-2.5-72b-instruct',
  'qwen-3-8-max': 'qwen/qwen-2.5-72b-instruct',
  'qwen 3.8 max': 'qwen/qwen-2.5-72b-instruct',
  'Qwen 3.8 Max': 'qwen/qwen-2.5-72b-instruct',
  'qwen/qwen3.8-max-0902': 'qwen/qwen-2.5-72b-instruct',
  'qwen-3-5-max': 'qwen/qwen-2.5-72b-instruct',
  'Qwen 3.5 Max': 'qwen/qwen-2.5-72b-instruct',
  'kimi-k3': 'moonshotai/moonshot-v1-8k',
  'kimi k3': 'moonshotai/moonshot-v1-8k',
  'Kimi K3': 'moonshotai/moonshot-v1-8k',
  'moonshotai/kimi-k3': 'moonshotai/moonshot-v1-8k',
  'glm-5-3': 'zhipu/glm-4',
  'GLM 5.3': 'zhipu/glm-4',
  'grok-4.3': 'x-ai/grok-2-1212',
  'grok-4-3': 'x-ai/grok-2-1212',
  'grok 4.3': 'x-ai/grok-2-1212',
  'Grok 4.3': 'x-ai/grok-2-1212',
  'x-ai/grok-4.3': 'x-ai/grok-2-1212',
  'claude-4-5-haiku': 'anthropic/claude-haiku-4.5',
  'claude 4.5 haiku': 'anthropic/claude-haiku-4.5',
  'Claude 4.5 Haiku': 'anthropic/claude-haiku-4.5',
  'anthropic/claude-haiku-4.5': 'anthropic/claude-haiku-4.5',
  'grok-4.7': 'x-ai/grok-2-1212',
  'grok-4-7': 'x-ai/grok-2-1212',
  'grok 4.7': 'x-ai/grok-2-1212',
  'Grok 4.7': 'x-ai/grok-2-1212',
  'x-ai/grok-4.7': 'x-ai/grok-2-1212',
  'gemini-3.8-flash': 'google/gemini-2.5-flash',
  'gemini-3-8-flash': 'google/gemini-2.5-flash',
  'gemini 3.8 flash': 'google/gemini-2.5-flash',
  'Gemini 3.8 Flash': 'google/gemini-2.5-flash',
  'google/gemini-3.8-flash': 'google/gemini-2.5-flash',
  'claude-opus-5.5': 'anthropic/claude-3-opus',
  'claude-opus-5-5': 'anthropic/claude-3-opus',
  'claude opus 5.5': 'anthropic/claude-3-opus',
  'Claude Opus 5.5': 'anthropic/claude-3-opus',
  'anthropic/claude-opus-5.5': 'anthropic/claude-3-opus'
};

/**
 * Checks if a model identifier is a known registered model, alias, or Mahi Engine.
 */
export function isKnownModel(modelIdentifier) {
  if (!modelIdentifier || typeof modelIdentifier !== 'string') return false;
  if (isMahiEngine(modelIdentifier)) return true;
  const trimmed = modelIdentifier.trim();
  if (MODEL_REGISTRY[trimmed] || MODEL_ALIASES[trimmed]) return true;

  const lower = trimmed.toLowerCase();
  for (const alias of Object.keys(MODEL_ALIASES)) {
    if (alias.toLowerCase() === lower) return true;
  }
  return false;
}

/**
 * Resolves any model identifier, slug, or friendly label to its canonical OpenRouter endpoint.
 */
export function resolveModel(modelIdentifier) {
  if (!modelIdentifier || typeof modelIdentifier !== 'string') {
    return DEFAULT_MODEL_ID;
  }

  const trimmed = modelIdentifier.trim();
  if (!trimmed) return DEFAULT_MODEL_ID;

  // 1. Direct registry lookup if already canonical
  if (MODEL_REGISTRY[trimmed]) {
    return trimmed;
  }

  // 2. Direct exact alias match
  if (MODEL_ALIASES[trimmed]) {
    return MODEL_ALIASES[trimmed];
  }

  // 3. Case-insensitive alias match
  const lower = trimmed.toLowerCase();
  for (const [alias, canonical] of Object.entries(MODEL_ALIASES)) {
    if (alias.toLowerCase() === lower) {
      return canonical;
    }
  }

  // 4. Fuzzy heuristics matching UI labels
  if (lower.includes('mahi') || lower === 'auto' || lower === 'default') {
    return DEFAULT_MODEL_ID;
  }
  if (lower.includes('gemini-3.1') || lower.includes('gemini 3.1') || lower.includes('3-1-pro') || lower.includes('3.1-pro') || lower.includes('gemini-pro')) {
    return 'google/gemini-3.1-pro-preview';
  }
  if (lower.includes('gemini-3.8') || lower.includes('gemini 3.8') || lower.includes('3-8-flash') || lower.includes('3.8-flash')) {
    return 'google/gemini-3.8-flash';
  }
  if (lower.includes('gemini-2.5') || lower.includes('gemini 2.5') || lower.includes('gemini-3.5') || lower.includes('gemini 3.5')) {
    return 'google/gemini-2.5-flash';
  }
  if (lower.includes('qwen-2.5-coder') || lower.includes('qwen-3.7') || lower.includes('coder')) {
    return 'qwen/qwen-2.5-coder-32b-instruct';
  }
  if (lower.includes('qwen') && (lower.includes('3.8') || lower.includes('3-8') || lower.includes('max-0902'))) {
    return 'qwen/qwen3.8-max-0902';
  }
  if (lower.includes('qwen') && lower.includes('72b')) {
    return 'qwen/qwen-2.5-72b-instruct';
  }
  if (lower.includes('qwen') && (lower.includes('max') || lower.includes('3.5'))) {
    return 'qwen/qwen-max';
  }
  if (lower.includes('o3-mini') || lower.includes('o3')) {
    return 'openai/o3-mini';
  }
  if (lower.includes('gpt-5-mini') || lower.includes('5-mini') || lower.includes('5 mini')) {
    return 'openai/gpt-5-mini';
  }
  if (lower.includes('4o-mini') || lower.includes('gpt-4o-mini')) {
    return 'openai/gpt-4o-mini';
  }
  if (lower.includes('gpt-6') || lower.includes('sol')) {
    return 'openai/gpt-6-sol';
  }
  if (lower.includes('gpt-4o') || lower === 'gpt-4o') {
    return 'openai/gpt-4o';
  }
  if (lower.includes('sonnet') || lower.includes('claude-5') || lower.includes('claude 5')) {
    return 'anthropic/claude-sonnet-5';
  }
  if (lower.includes('haiku')) {
    return 'anthropic/claude-haiku-4.5';
  }
  if (lower.includes('opus')) {
    return 'anthropic/claude-opus-5.5';
  }
  if (lower.includes('deepseek') && (lower.includes('r1') || lower.includes('reasoner'))) {
    return 'deepseek/deepseek-r1';
  }
  if (lower.includes('deepseek') && (lower.includes('pro') || lower.includes('0813') || lower.includes('v4-pro') || lower.includes('v4 pro'))) {
    return 'deepseek/deepseek-v4-pro-0813';
  }
  if (lower.includes('deepseek') && (lower.includes('flash') || lower.includes('0731') || lower.includes('v4-flash') || lower.includes('v4 flash'))) {
    return 'deepseek/deepseek-v4-flash-0731';
  }
  if (lower.includes('deepseek')) {
    return 'deepseek/deepseek-chat';
  }
  if (lower.includes('mistral')) {
    return 'mistralai/mistral-small-24b-instruct-2501';
  }
  if (lower.includes('nemotron')) {
    return 'nvidia/llama-3.1-nemotron-70b-instruct';
  }
  if (lower.includes('kimi') || lower.includes('moonshot')) {
    return 'moonshotai/kimi-k3';
  }
  if (lower.includes('glm')) {
    return 'zhipu/glm-4';
  }
  if (lower.includes('grok') && (lower.includes('4.7') || lower.includes('4-7') || lower.includes('4 7'))) {
    return 'x-ai/grok-4.7';
  }
  if (lower.includes('grok') && (lower.includes('4.3') || lower.includes('4-3') || lower.includes('4 3'))) {
    return 'x-ai/grok-4.3';
  }
  if (lower.includes('grok')) {
    return 'x-ai/grok-2';
  }

  // 5. Safe default fallback for unrecognized models (prevents arbitrary model injection)
  return DEFAULT_MODEL_ID;
}

/**
 * Returns metadata and capabilities for a resolved model.
 */
export function getModelMetadata(canonicalModelId) {
  return MODEL_REGISTRY[canonicalModelId] || {
    id: canonicalModelId,
    name: canonicalModelId,
    provider: 'unknown',
    tier: 'standard',
    costTier: 'standard',
    contextWindow: 32768,
    capabilities: { streaming: true, image: false },
    fallback: DEFAULT_FALLBACK_MODEL
  };
}

/**
 * Returns configured fallback model for a given model.
 */
export function getFallbackModel(canonicalModelId) {
  const meta = getModelMetadata(canonicalModelId);
  return meta.fallback || DEFAULT_FALLBACK_MODEL;
}

/**
 * Returns per-model sampling configuration.
 * Reasoning models (o3-mini, deepseek-r1, etc.) use provider defaults without temperature/top_p overrides.
 */
export function getSamplingConfig(canonicalModelId) {
  const id = String(canonicalModelId || '').toLowerCase();
  const isReasoningModel =
    id.includes('o3-mini') ||
    id.includes('o1') ||
    id.includes('deepseek-r1') ||
    id.includes('kimi-k3');

  const meta = getModelMetadata(canonicalModelId);
  const maxTokens = isReasoningModel
    ? 8192
    : (meta.tier === 'pro' ? 8192 : 4096);

  if (isReasoningModel) {
    return {
      isReasoning: true,
      max_tokens: maxTokens
    };
  }

  return {
    isReasoning: false,
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: maxTokens
  };
}

/**
 * Validates model access against a plan tier (for future plan-based policies).
 */
export function validateModelForPlan(canonicalModelId, userPlan = 'free') {
  const meta = getModelMetadata(canonicalModelId);
  if (userPlan === 'pro' || userPlan === 'max') {
    return { allowed: true };
  }
  // Currently in free tier mode, all configured models are accessible or downgraded gracefully
  return { allowed: true, tier: meta.tier };
}

/**
 * Returns the single-source-of-truth catalog of verified, honest models for GET /api/models.
 */
export function getAvailableModelsCatalog() {
  return [
    {
      id: 'mahi-engine',
      name: 'Mahi Engine',
      provider: 'custom',
      icon: 'zap',
      isLocked: false,
      isPro: false,
      isDefault: true,
      tier: 'free',
      group: 'Default Engine',
      desc: 'Fast, balanced everyday assistant by Mestrio AI',
      openRouterModel: 'mahi-engine',
      capabilities: { streaming: true, image: false, reasoning: false, coding: true, tools: false }
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      icon: 'openai',
      isLocked: false,
      isPro: false,
      tier: 'free',
      group: 'OpenAI',
      desc: 'Fast, affordable everyday model by OpenAI',
      openRouterModel: 'openai/gpt-4o-mini',
      capabilities: MODEL_REGISTRY['openai/gpt-4o-mini'].capabilities
    },
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      icon: 'openai',
      isLocked: true,
      isPro: true,
      tier: 'pro',
      group: 'OpenAI',
      desc: 'Flagship multimodal model by OpenAI',
      openRouterModel: 'openai/gpt-4o',
      capabilities: MODEL_REGISTRY['openai/gpt-4o'].capabilities
    },
    {
      id: 'o3-mini',
      name: 'o3-mini',
      provider: 'openai',
      icon: 'openai',
      isLocked: true,
      isPro: true,
      badge: 'Thinking',
      tag: 'Thinking',
      tier: 'pro',
      group: 'OpenAI',
      desc: 'High-speed STEM & logic reasoning by OpenAI',
      openRouterModel: 'openai/o3-mini',
      capabilities: MODEL_REGISTRY['openai/o3-mini'].capabilities
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'google',
      icon: 'gemini',
      isLocked: false,
      isPro: false,
      tier: 'free',
      group: 'Google',
      desc: 'Low-latency multimodal model by Google',
      openRouterModel: 'google/gemini-2.5-flash',
      capabilities: MODEL_REGISTRY['google/gemini-2.5-flash'].capabilities
    },
    {
      id: 'gemini-3.1-pro',
      name: 'Gemini 3.1 Pro',
      provider: 'google',
      icon: 'gemini',
      isLocked: true,
      isPro: true,
      tier: 'pro',
      group: 'Google',
      desc: 'Deep reasoning & long-context model by Google',
      openRouterModel: 'google/gemini-3.1-pro-preview',
      capabilities: MODEL_REGISTRY['google/gemini-3.1-pro-preview'].capabilities
    },
    {
      id: 'claude-4-5-haiku',
      name: 'Claude 4.5 Haiku',
      provider: 'anthropic',
      icon: 'anthropic',
      isLocked: true,
      isPro: true,
      tier: 'pro',
      group: 'Anthropic',
      desc: 'Fast, crisp intelligence by Anthropic',
      openRouterModel: 'anthropic/claude-haiku-4.5',
      capabilities: MODEL_REGISTRY['anthropic/claude-haiku-4.5'].capabilities
    },
    {
      id: 'claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      icon: 'anthropic',
      isLocked: true,
      isPro: true,
      tier: 'pro',
      group: 'Anthropic',
      desc: 'Exceptional coding & nuanced writing by Anthropic',
      openRouterModel: 'anthropic/claude-3-5-sonnet',
      capabilities: MODEL_REGISTRY['anthropic/claude-3-5-sonnet'].capabilities
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      icon: 'anthropic',
      isLocked: true,
      isPro: true,
      tier: 'max',
      group: 'Anthropic',
      desc: 'Deep synthesis & complex analysis by Anthropic',
      openRouterModel: 'anthropic/claude-3-opus',
      capabilities: MODEL_REGISTRY['anthropic/claude-3-opus'].capabilities
    },
    {
      id: 'deepseek-chat',
      name: 'DeepSeek V3',
      provider: 'deepseek',
      icon: 'deepseek',
      isLocked: false,
      isPro: false,
      tier: 'free',
      group: 'DeepSeek',
      desc: 'Fast, capable open-weights model',
      openRouterModel: 'deepseek/deepseek-chat',
      capabilities: MODEL_REGISTRY['deepseek/deepseek-chat'].capabilities
    },
    {
      id: 'deepseek-r1',
      name: 'DeepSeek R1',
      provider: 'deepseek',
      icon: 'deepseek',
      isLocked: true,
      isPro: true,
      badge: 'Thinking',
      tag: 'Thinking',
      tier: 'pro',
      group: 'DeepSeek',
      desc: 'Open reasoning model with chain-of-thought',
      openRouterModel: 'deepseek/deepseek-r1',
      capabilities: MODEL_REGISTRY['deepseek/deepseek-r1'].capabilities
    },
    {
      id: 'qwen-2.5-coder',
      name: 'Qwen 2.5 Coder 32B',
      provider: 'qwen',
      icon: 'qwen',
      isLocked: false,
      isPro: false,
      tier: 'free',
      group: 'Open & Specialized',
      desc: 'Specialized code generation & debugging by Alibaba',
      openRouterModel: 'qwen/qwen-2.5-coder-32b-instruct',
      capabilities: MODEL_REGISTRY['qwen/qwen-2.5-coder-32b-instruct'].capabilities
    },
    {
      id: 'qwen-2.5-72b',
      name: 'Qwen 2.5 72B',
      provider: 'qwen',
      icon: 'qwen',
      isLocked: true,
      isPro: true,
      tier: 'pro',
      group: 'Open & Specialized',
      desc: 'High-capacity multilingual model by Alibaba',
      openRouterModel: 'qwen/qwen-2.5-72b-instruct',
      capabilities: MODEL_REGISTRY['qwen/qwen-2.5-72b-instruct'].capabilities
    },
    {
      id: 'mistral-small',
      name: 'Mistral Small 24B',
      provider: 'mistral',
      icon: 'mistral',
      isLocked: false,
      isPro: false,
      tier: 'free',
      group: 'Open & Specialized',
      desc: 'Compact, fast European instruction model',
      openRouterModel: 'mistralai/mistral-small-24b-instruct-2501',
      capabilities: MODEL_REGISTRY['mistralai/mistral-small-24b-instruct-2501'].capabilities
    },
    {
      id: 'nemotron-fast',
      name: 'Nemotron 70B',
      provider: 'nvidia',
      icon: 'nvidia',
      isLocked: false,
      isPro: false,
      tier: 'free',
      group: 'Open & Specialized',
      desc: 'NVIDIA Llama 3.1 Nemotron 70B Instruct',
      openRouterModel: 'nvidia/llama-3.1-nemotron-70b-instruct',
      capabilities: MODEL_REGISTRY['nvidia/llama-3.1-nemotron-70b-instruct'].capabilities
    },
    {
      id: 'grok-2',
      name: 'Grok 2',
      provider: 'xai',
      icon: 'xai',
      isLocked: true,
      isPro: true,
      tier: 'pro',
      group: 'xAI',
      desc: 'Direct, candid intelligence by xAI',
      openRouterModel: 'x-ai/grok-2-1212',
      capabilities: MODEL_REGISTRY['x-ai/grok-2-1212'].capabilities
    }
  ];
}

export default {
  DEFAULT_MODEL_ID,
  DEFAULT_FALLBACK_MODEL,
  MAHI_ENGINE_SYSTEM_PROMPT,
  MODEL_REGISTRY,
  MODEL_ALIASES,
  isMahiEngine,
  isKnownModel,
  resolveModel,
  getModelMetadata,
  getFallbackModel,
  getSamplingConfig,
  getAvailableModelsCatalog,
  validateModelForPlan
};
