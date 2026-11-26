import config from '../config/env.js';
import { buildSystemPrompt } from '../prompts/masterSystemPrompt.js';

export const MAHI_ENGINE_SYSTEM_PROMPT = buildSystemPrompt();

/**
 * Checks if a model or engine identifier corresponds to the Mahi Engine.
 * Frontend passes 'mahi-engine' or 'Mahi Engine (Standard)'.
 */
export function isMahiEngine(identifier) {
  if (!identifier) return true;
  const lower = String(identifier).toLowerCase().trim();
  return (
    lower === 'mahi-engine' ||
    lower === 'mahi-engine-standard' ||
    lower.includes('mahi') ||
    lower === 'auto' ||
    lower === 'default'
  );
}

/**
 * Resolves the provider system for an incoming request.
 * Returns 'mahi-engine' for Mahi Engine requests, 'openrouter' for all normal models.
 */
export function resolveProvider(modelOrEngine) {
  return isMahiEngine(modelOrEngine) ? 'mahi-engine' : 'openrouter';
}

/**
 * Resolves the dedicated Mahi Engine configuration from backend environment.
 * The model ID is strictly resolved from MAHI_ENGINE_MODEL, NOT from the frontend
 * or the OpenRouter model registry.
 */
export function resolveMahiEngineConfig() {
  return {
    provider: 'mahi-engine',
    engine: 'mahi-engine-standard',
    model: config.mahiEngine.model || 'gemini-3.5-flash',
    baseURL: config.mahiEngine.baseURL || 'https://generativelanguage.googleapis.com/v1beta/openai/',
    apiKey: config.mahiEngine.apiKey || '',
    timeoutMs: config.mahiEngine.timeoutMs || 60000,
    maxOutputTokens: config.mahiEngine.maxOutputTokens || 4096,
    temperature: process.env.MAHI_ENGINE_TEMPERATURE ? config.mahiEngine.temperature : 0.7,
    topP: process.env.MAHI_ENGINE_TOP_P ? config.mahiEngine.topP : 0.95,
    systemPrompt: MAHI_ENGINE_SYSTEM_PROMPT
  };
}

export default {
  MAHI_ENGINE_SYSTEM_PROMPT,
  isMahiEngine,
  resolveProvider,
  resolveMahiEngineConfig
};
