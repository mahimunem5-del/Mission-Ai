import config from '../../config/env.js';
import { BaseProviderAdapter, formatProviderMessages } from './baseAdapter.js';
import { createMahiStreamWithResilience } from '../../providers/mahiEngineProvider.js';
import { MAHI_ENGINE_SYSTEM_PROMPT } from '../../services/mahiEngineResolver.js';

/**
 * Mahi Engine Provider Adapter (System B)
 * Wraps the dedicated Mahi Engine / Gemini API behind the standardized BaseProviderAdapter interface.
 */
export class MahiEngineAdapter extends BaseProviderAdapter {
  constructor() {
    super('mahi-engine');
  }

  isConfigured() {
    return Boolean(config.mahiEngine.apiKey);
  }

  getUnconfiguredNotice() {
    return 'MAHI_ENGINE_API_KEY is not set in server/.env. Please configure your dedicated Mahi Engine API key (and optional MAHI_ENGINE_API_BASE_URL / MAHI_ENGINE_MODEL) to enable live Mahi Engine responses.';
  }

  getCapabilities() {
    return {
      streaming: true,
      tools: false,
      vision: true,
      systemPrompt: true
    };
  }

  async createChatStream({
    model = 'mahi-engine',
    messages = [],
    systemInstruction = null,
    projectId = null,
    projectInstructions = null,
    abortSignal = null,
    requestId = '-'
  }) {
    const formattedMessages = formatProviderMessages({
      messages,
      systemInstruction: systemInstruction || MAHI_ENGINE_SYSTEM_PROMPT,
      projectId,
      projectInstructions,
      maxTokensApprox: 25000
    });

    const result = await createMahiStreamWithResilience({
      messages: formattedMessages,
      systemInstruction: systemInstruction || MAHI_ENGINE_SYSTEM_PROMPT,
      projectId,
      projectInstructions,
      abortSignal,
      requestId
    });

    return {
      stream: result.stream,
      requestedModel: model,
      resolvedModel: result.resolvedModel,
      displayModel: 'Mahi Engine',
      usedFallback: false,
      provider: this.name
    };
  }
}

export const mahiEngineAdapter = new MahiEngineAdapter();
export default mahiEngineAdapter;
