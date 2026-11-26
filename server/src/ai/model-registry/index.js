import {
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
} from '../../services/modelRouter.js';
import { resolveProvider, resolveMahiEngineConfig } from '../../services/mahiEngineResolver.js';

/**
 * Centralized Model Registry & Capability Definitions
 */
export function getModelCapabilities(modelOrEngine) {
  if (isMahiEngine(modelOrEngine)) {
    const mahiCfg = resolveMahiEngineConfig();
    return {
      id: 'mahi-engine',
      provider: 'mahi-engine',
      resolvedModel: mahiCfg.model,
      tier: 'free',
      contextWindow: 1048576,
      capabilities: {
        streaming: true,
        vision: true,
        tools: false,
        reasoning: false,
        coding: true
      }
    };
  }

  const meta = getModelMetadata(modelOrEngine);
  return {
    id: meta.id,
    provider: 'openrouter',
    vendor: meta.provider,
    resolvedModel: meta.id,
    tier: meta.tier || 'free',
    contextWindow: meta.contextWindow || 128000,
    capabilities: {
      streaming: Boolean(meta.capabilities?.streaming ?? true),
      vision: Boolean(meta.capabilities?.image ?? false),
      tools: true,
      reasoning: Boolean(meta.capabilities?.reasoning ?? false),
      coding: Boolean(meta.capabilities?.coding ?? true)
    }
  };
}

export {
  DEFAULT_MODEL_ID,
  DEFAULT_FALLBACK_MODEL,
  MAHI_ENGINE_SYSTEM_PROMPT,
  MODEL_REGISTRY,
  MODEL_ALIASES,
  isMahiEngine,
  isKnownModel,
  resolveModel,
  resolveProvider,
  resolveMahiEngineConfig,
  getModelMetadata,
  getFallbackModel,
  getSamplingConfig,
  getAvailableModelsCatalog,
  validateModelForPlan
};

export default {
  DEFAULT_MODEL_ID,
  DEFAULT_FALLBACK_MODEL,
  MAHI_ENGINE_SYSTEM_PROMPT,
  MODEL_REGISTRY,
  MODEL_ALIASES,
  isMahiEngine,
  isKnownModel,
  resolveModel,
  resolveProvider,
  resolveMahiEngineConfig,
  getModelMetadata,
  getFallbackModel,
  getSamplingConfig,
  getAvailableModelsCatalog,
  validateModelForPlan,
  getModelCapabilities
};
