export interface AIModel {
  id: string;
  name: string;
  provider: 'custom' | 'google' | 'qwen' | 'openai' | 'mistral' | 'nvidia' | 'kimi' | 'deepseek' | 'anthropic' | 'zhipu' | 'xai' | 'mahi' | 'moonshot' | 'alibaba';
  icon: string;
  isLocked: boolean;
  isPro?: boolean;
  isDefault?: boolean;
  badge?: 'New' | 'Thinking';
  tag?: 'New' | 'Thinking' | 'Max';
  group?: string;
  description?: string;
  desc?: string;
  color?: string;
  openRouterModel?: string;
}

export const MODELS: AIModel[] = [
  {
    id: 'mahi-engine',
    name: 'Mahi Engine',
    provider: 'custom',
    icon: 'zap',
    isLocked: false,
    isPro: false,
    isDefault: true,
    group: 'Default Engine',
    description: 'Fast, balanced everyday assistant by Mestrio AI',
    desc: 'Fast, balanced everyday assistant by Mestrio AI',
    color: 'bg-amber-500',
    openRouterModel: 'mahi-engine'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    icon: 'openai',
    isLocked: false,
    isPro: false,
    group: 'OpenAI',
    description: 'Fast, affordable everyday model by OpenAI',
    desc: 'Fast, affordable everyday model by OpenAI',
    color: 'bg-emerald-600',
    openRouterModel: 'openai/gpt-4o-mini'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    icon: 'openai',
    isLocked: true,
    isPro: true,
    group: 'OpenAI',
    description: 'Flagship multimodal model by OpenAI',
    desc: 'Flagship multimodal model by OpenAI',
    color: 'bg-emerald-700',
    openRouterModel: 'openai/gpt-4o'
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
    group: 'OpenAI',
    description: 'High-speed STEM & logic reasoning by OpenAI',
    desc: 'High-speed STEM & logic reasoning by OpenAI',
    color: 'bg-emerald-800',
    openRouterModel: 'openai/o3-mini'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    icon: 'gemini',
    isLocked: false,
    isPro: false,
    group: 'Google',
    description: 'Low-latency multimodal model by Google',
    desc: 'Low-latency multimodal model by Google',
    color: 'bg-blue-600',
    openRouterModel: 'google/gemini-2.5-flash'
  },
  {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro',
    provider: 'google',
    icon: 'gemini',
    isLocked: true,
    isPro: true,
    group: 'Google',
    description: 'Deep reasoning & long-context model by Google',
    desc: 'Deep reasoning & long-context model by Google',
    color: 'bg-blue-700',
    openRouterModel: 'google/gemini-3.1-pro-preview'
  },
  {
    id: 'claude-4-5-haiku',
    name: 'Claude 4.5 Haiku',
    provider: 'anthropic',
    icon: 'anthropic',
    isLocked: true,
    isPro: true,
    group: 'Anthropic',
    description: 'Fast, crisp intelligence by Anthropic',
    desc: 'Fast, crisp intelligence by Anthropic',
    color: 'bg-amber-600',
    openRouterModel: 'anthropic/claude-haiku-4.5'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    icon: 'anthropic',
    isLocked: true,
    isPro: true,
    group: 'Anthropic',
    description: 'Exceptional coding & nuanced writing by Anthropic',
    desc: 'Exceptional coding & nuanced writing by Anthropic',
    color: 'bg-amber-700',
    openRouterModel: 'anthropic/claude-3-5-sonnet'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    icon: 'anthropic',
    isLocked: true,
    isPro: true,
    group: 'Anthropic',
    description: 'Deep synthesis & complex analysis by Anthropic',
    desc: 'Deep synthesis & complex analysis by Anthropic',
    color: 'bg-amber-800',
    openRouterModel: 'anthropic/claude-3-opus'
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    icon: 'deepseek',
    isLocked: false,
    isPro: false,
    group: 'DeepSeek',
    description: 'Fast, capable open-weights model',
    desc: 'Fast, capable open-weights model',
    color: 'bg-cyan-600',
    openRouterModel: 'deepseek/deepseek-chat'
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
    group: 'DeepSeek',
    description: 'Open reasoning model with chain-of-thought',
    desc: 'Open reasoning model with chain-of-thought',
    color: 'bg-cyan-700',
    openRouterModel: 'deepseek/deepseek-r1'
  },
  {
    id: 'qwen-2.5-coder',
    name: 'Qwen 2.5 Coder 32B',
    provider: 'qwen',
    icon: 'qwen',
    isLocked: false,
    isPro: false,
    group: 'Open & Specialized',
    description: 'Specialized code generation & debugging by Alibaba',
    desc: 'Specialized code generation & debugging by Alibaba',
    color: 'bg-indigo-600',
    openRouterModel: 'qwen/qwen-2.5-coder-32b-instruct'
  },
  {
    id: 'qwen-2.5-72b',
    name: 'Qwen 2.5 72B',
    provider: 'qwen',
    icon: 'qwen',
    isLocked: true,
    isPro: true,
    group: 'Open & Specialized',
    description: 'High-capacity multilingual model by Alibaba',
    desc: 'High-capacity multilingual model by Alibaba',
    color: 'bg-orange-600',
    openRouterModel: 'qwen/qwen-2.5-72b-instruct'
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small 24B',
    provider: 'mistral',
    icon: 'mistral',
    isLocked: false,
    isPro: false,
    group: 'Open & Specialized',
    description: 'Compact, fast European instruction model',
    desc: 'Compact, fast European instruction model',
    color: 'bg-orange-500',
    openRouterModel: 'mistralai/mistral-small-24b-instruct-2501'
  },
  {
    id: 'nemotron-fast',
    name: 'Nemotron 70B',
    provider: 'nvidia',
    icon: 'nvidia',
    isLocked: false,
    isPro: false,
    group: 'Open & Specialized',
    description: 'NVIDIA Llama 3.1 Nemotron 70B Instruct',
    desc: 'NVIDIA Llama 3.1 Nemotron 70B Instruct',
    color: 'bg-lime-600',
    openRouterModel: 'nvidia/llama-3.1-nemotron-70b-instruct'
  },
  {
    id: 'grok-2',
    name: 'Grok 2',
    provider: 'xai',
    icon: 'xai',
    isLocked: true,
    isPro: true,
    group: 'xAI',
    description: 'Direct, candid intelligence by xAI',
    desc: 'Direct, candid intelligence by xAI',
    color: 'bg-zinc-900',
    openRouterModel: 'x-ai/grok-2-1212'
  }
];

export const UNLIMITED_MODELS: AIModel[] = MODELS.filter(m => !m.isPro);
export const PREMIUM_MODELS: AIModel[] = MODELS.filter(m => m.isPro);

export const DEFAULT_MODEL_LABEL = 'Model';
export const DEFAULT_MODEL_ID = 'mahi-engine';
export const DEFAULT_MODEL_NAME = 'Mahi Engine';
