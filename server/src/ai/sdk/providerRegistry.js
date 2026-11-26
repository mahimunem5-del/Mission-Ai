import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import config from '../../config/env.js';
import { isMahiEngine, resolveMahiEngineConfig } from '../../services/mahiEngineResolver.js';
import { resolveModel, getFallbackModel, getModelMetadata } from '../../services/modelRouter.js';
import { ConfigurationError } from '../../utils/errors.js';

let openrouterProvider = null;
let cachedOpenRouterKey = null;

function getOpenRouterProvider() {
  const apiKey = config.openrouter.apiKey;
  if (!apiKey) {
    throw new ConfigurationError('OPENROUTER_API_KEY is not configured');
  }
  if (!openrouterProvider || cachedOpenRouterKey !== apiKey) {
    openrouterProvider = createOpenRouter({
      apiKey,
      baseURL: config.openrouter.baseURL,
      headers: {
        'HTTP-Referer': config.openrouter.siteUrl,
        'X-Title': config.openrouter.siteName
      }
    });
    cachedOpenRouterKey = apiKey;
  }
  return openrouterProvider;
}

let mahiProvider = null;
let cachedMahiKey = null;
let cachedMahiUrl = null;

function getMahiEngineProvider() {
  const engineCfg = resolveMahiEngineConfig();
  if (!engineCfg.apiKey) {
    throw new ConfigurationError('MAHI_ENGINE_API_KEY is not configured');
  }
  if (!mahiProvider || cachedMahiKey !== engineCfg.apiKey || cachedMahiUrl !== engineCfg.baseURL) {
    mahiProvider = createOpenAICompatible({
      name: 'mahi-engine',
      baseURL: engineCfg.baseURL,
      apiKey: engineCfg.apiKey,
      headers: {
        'x-goog-api-key': engineCfg.apiKey
      }
    });
    cachedMahiKey = engineCfg.apiKey;
    cachedMahiUrl = engineCfg.baseURL;
  }
  return mahiProvider;
}

/**
 * Provider Compatibility Registry
 * Active: openrouter (@openrouter/ai-sdk-provider), mahi-engine (@ai-sdk/openai-compatible)
 * Architecture-ready (staged activation): openai, google, anthropic, xai, deepseek
 */
export const PROVIDER_CAPABILITY_STATUS = {
  openrouter: { active: true, package: '@openrouter/ai-sdk-provider' },
  'mahi-engine': { active: true, package: '@ai-sdk/openai-compatible' },
  openai: { active: false, stagedPackage: '@ai-sdk/openai' },
  google: { active: false, stagedPackage: '@ai-sdk/google' },
  anthropic: { active: false, stagedPackage: '@ai-sdk/anthropic' },
  xai: { active: false, stagedPackage: '@ai-sdk/xai' },
  deepseek: { active: false, stagedPackage: '@ai-sdk/deepseek' }
};

/**
 * Resolves an AI SDK v7 LanguageModel instance while preserving requestedModel, resolvedModel, and provider identity.
 */
export function resolveSdkLanguageModel(requestedModel = 'mahi-engine') {
  if (isMahiEngine(requestedModel)) {
    const engineCfg = resolveMahiEngineConfig();
    if (!engineCfg.apiKey) {
      return {
        isConfigured: false,
        provider: 'mahi-engine',
        requestedModel,
        resolvedModel: engineCfg.model,
        fallbackModel: null,
        languageModel: null
      };
    }
    const provider = getMahiEngineProvider();
    return {
      isConfigured: true,
      provider: 'mahi-engine',
      requestedModel,
      resolvedModel: engineCfg.model,
      fallbackModel: null,
      supportsTools: false,
      languageModel: provider.chatModel(engineCfg.model)
    };
  }

  const resolvedId = resolveModel(requestedModel);
  const fallbackId = getFallbackModel(resolvedId);
  const meta = getModelMetadata(resolvedId);
  const supportsTools = Boolean(meta?.capabilities?.tools);
  if (!config.openrouter.apiKey) {
    return {
      isConfigured: false,
      provider: 'openrouter',
      requestedModel,
      resolvedModel: resolvedId,
      fallbackModel: fallbackId,
      supportsTools,
      languageModel: null
    };
  }

  const or = getOpenRouterProvider();
  return {
    isConfigured: true,
    provider: 'openrouter',
    requestedModel,
    resolvedModel: resolvedId,
    fallbackModel: fallbackId,
    supportsTools,
    languageModel: or.chat(resolvedId),
    getFallbackLanguageModel: () => (fallbackId && fallbackId !== resolvedId ? or.chat(fallbackId) : null)
  };
}

export default {
  PROVIDER_CAPABILITY_STATUS,
  resolveSdkLanguageModel
};
