/**
 * Base AI Provider Adapter Interface & Shared Message Utilities
 * Defines the standardized contract for all LLM provider adapters (OpenRouter, Mahi Engine, etc.).
 */

export function getMessageLength(msg) {
  if (!msg || !msg.content) return 0;
  if (typeof msg.content === 'string') return msg.content.length;
  if (Array.isArray(msg.content)) {
    return msg.content.reduce((acc, part) => {
      if (part?.type === 'text') return acc + (part.text || '').length;
      if (part?.type === 'image_url') return acc + 1000;
      return acc + 100;
    }, 0);
  }
  return 100;
}

/**
 * Trims conversation history if it exceeds context limits while preserving leading system messages.
 */
export function trimHistoryForCostControl(messages, maxTokensApprox = 40000) {
  if (!Array.isArray(messages) || messages.length <= 1) return messages;

  let totalChars = 0;
  const maxChars = maxTokensApprox * 4;
  const trimmed = [];

  const systemMessages = [];
  let nonSystemStart = 0;
  while (nonSystemStart < messages.length && messages[nonSystemStart]?.role === 'system') {
    systemMessages.push(messages[nonSystemStart]);
    totalChars += getMessageLength(messages[nonSystemStart]);
    nonSystemStart++;
  }

  const pool = messages.slice(nonSystemStart);
  for (let i = pool.length - 1; i >= 0; i--) {
    const msg = pool[i];
    const len = getMessageLength(msg);
    if (totalChars + len > maxChars && trimmed.length >= 2) {
      break;
    }
    totalChars += len;
    trimmed.unshift(msg);
  }

  return [...systemMessages, ...trimmed];
}

/**
 * Formats system instruction, project workspace context, and chat messages into a standard payload.
 */
export function formatProviderMessages({
  messages = [],
  systemInstruction = null,
  projectId = null,
  projectInstructions = null,
  maxTokensApprox = 40000
}) {
  const formatted = [];

  if (systemInstruction) {
    formatted.push({ role: 'system', content: systemInstruction });
  }

  if (projectInstructions) {
    formatted.push({
      role: 'system',
      content: `PROJECT WORKSPACE INSTRUCTIONS:\nYou are operating within an isolated workspace (Project ID: ${projectId || 'default'}). Adhere strictly to the following instructions:\n${projectInstructions}`
    });
  } else if (projectId) {
    formatted.push({
      role: 'system',
      content: `PROJECT WORKSPACE CONTEXT:\nYou are operating within an isolated workspace for Project ID: ${projectId}. Keep all analysis and code aligned with this project.`
    });
  }

  if (Array.isArray(messages) && messages.length > 0) {
    for (const m of messages) {
      if (!m) continue;
      let contentPayload = m.content;
      if (m.role === 'assistant' && (!contentPayload || (typeof contentPayload === 'string' && !contentPayload.trim()))) {
        contentPayload = m.imageUrl
          ? (m.imagePrompt ? `[Generated Image: ${m.imagePrompt}]` : '[Generated Image]')
          : '[Assistant Response]';
      }
      if (!contentPayload || (typeof contentPayload === 'string' && !contentPayload.trim())) {
        continue;
      }
      if (typeof contentPayload !== 'string' && !Array.isArray(contentPayload)) {
        contentPayload = JSON.stringify(contentPayload);
      }
      formatted.push({
        role: m.role === 'assistant' ? 'assistant' : (m.role === 'system' ? 'system' : 'user'),
        content: contentPayload
      });
    }
  }

  return trimHistoryForCostControl(formatted, maxTokensApprox);
}

/**
 * Base class for AI provider adapters.
 */
export class BaseProviderAdapter {
  constructor(name) {
    this.name = name;
  }

  isConfigured() {
    return false;
  }

  getUnconfiguredNotice() {
    return `${this.name} is not configured.`;
  }

  getCapabilities() {
    return {
      streaming: true,
      tools: false,
      vision: false,
      systemPrompt: true
    };
  }

  normalizeStreamChunk(rawChunk) {
    const content = rawChunk?.choices?.[0]?.delta?.content || '';
    const usage = rawChunk?.usage || null;
    return { text: content, usage };
  }

  async createChatStream(_options) {
    throw new Error(`createChatStream() not implemented on ${this.name}`);
  }
}

export default {
  BaseProviderAdapter,
  formatProviderMessages,
  trimHistoryForCostControl,
  getMessageLength
};
