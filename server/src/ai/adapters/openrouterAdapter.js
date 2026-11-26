import config from '../../config/env.js';
import { BaseProviderAdapter, formatProviderMessages } from './baseAdapter.js';
import { createStreamWithResilience } from '../../providers/openrouterProvider.js';
import { resolveModel } from '../../services/modelRouter.js';
import { IMAGE_GENERATION_TOOL, executeImageGeneration } from '../../services/imageService.js';
import logger from '../../utils/logger.js';

/**
 * Detects whether accumulated text contains a pseudo-tool JSON image block.
 */
export function isImageJsonBlock(text) {
  if (!text || typeof text !== 'string') return false;
  const hasImageOrJsonFence = /(?:```image|```json|\{\s*"prompt")/i.test(text);
  const hasPromptKey = /["']prompt["']\s*:/i.test(text);
  return hasImageOrJsonFence && hasPromptKey;
}

/**
 * Parses the prompt string from an image markdown / JSON code block.
 */
export function parseImagePromptFromJsonBlock(text) {
  if (!text || typeof text !== 'string') return null;

  const blockMatch = text.match(/```(?:image|json)?\s*([\s\S]*?)(?:```|$)/i);
  const blockContent = blockMatch ? blockMatch[1].trim() : text.trim();

  try {
    const jsonMatch = blockContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed && typeof parsed.prompt === 'string' && parsed.prompt.trim()) {
        return parsed.prompt.trim();
      }
    }
  } catch (_) {}

  const promptMatch = text.match(/"prompt"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i);
  if (promptMatch && promptMatch[1]) {
    try {
      return JSON.parse(`"${promptMatch[1]}"`).trim();
    } catch (_) {
      return promptMatch[1].replace(/\\"/g, '"').replace(/\\n/g, ' ').trim();
    }
  }

  const singleMatch = text.match(/'prompt'\s*:\s*'([^'\\]*(?:\\.[^'\\]*)*)'/i);
  if (singleMatch && singleMatch[1]) {
    return singleMatch[1].replace(/\\'/g, "'").trim();
  }

  return null;
}

/**
 * Intercepts native tool calls and pseudo-tool JSON image blocks during streaming.
 */
async function* processStreamWithTools(rawStream, { writeChunk, abortSignal, requestId }) {
  let isToolCall = false;
  let toolCallArguments = '';
  let statusSent = false;
  let accumulatedText = '';
  let isImageGenerated = false;

  let chunkBuffer = [];
  let isCheckingForImageJson = true;
  const MAX_BUFFER_CHARS = 350;

  for await (const chunk of rawStream) {
    if (abortSignal?.aborted) break;

    const delta = chunk.choices?.[0]?.delta;
    const toolCalls = delta?.tool_calls;

    if (toolCalls && Array.isArray(toolCalls) && toolCalls.length > 0) {
      isToolCall = true;
      for (const tc of toolCalls) {
        if (tc.function?.arguments) {
          toolCallArguments += tc.function.arguments;
        }
      }

      if (!statusSent) {
        statusSent = true;
        if (typeof writeChunk === 'function') {
          writeChunk({ type: 'status', message: 'Generating image...' });
        }
      }
      continue;
    }

    const content = delta?.content || '';
    if (content && !isToolCall) {
      accumulatedText += content;

      if (isCheckingForImageJson) {
        chunkBuffer.push(chunk);
        const trimmedStart = accumulatedText.trimStart();
        const mightBeJsonBlock =
          trimmedStart.startsWith('`') ||
          trimmedStart.startsWith('{') ||
          trimmedStart.toLowerCase().startsWith('image');

        if (!mightBeJsonBlock || accumulatedText.length >= MAX_BUFFER_CHARS) {
          if (isImageJsonBlock(accumulatedText)) {
            isCheckingForImageJson = false;
            isToolCall = true;
            if (!statusSent) {
              statusSent = true;
              if (typeof writeChunk === 'function') {
                writeChunk({ type: 'status', message: 'Generating image...' });
              }
            }
            continue;
          } else {
            isCheckingForImageJson = false;
            for (const bufferedChunk of chunkBuffer) {
              yield bufferedChunk;
            }
            chunkBuffer = [];
          }
        }
      } else {
        yield chunk;
      }
    } else if (!isToolCall) {
      yield chunk;
    }
  }

  if (isCheckingForImageJson && chunkBuffer.length > 0 && !isToolCall) {
    if (isImageJsonBlock(accumulatedText)) {
      isToolCall = true;
      if (!statusSent && typeof writeChunk === 'function') {
        statusSent = true;
        writeChunk({ type: 'status', message: 'Generating image...' });
      }
    } else {
      for (const bufferedChunk of chunkBuffer) {
        yield bufferedChunk;
      }
    }
  }

  if (isToolCall && !abortSignal?.aborted && !isImageGenerated) {
    let prompt = null;
    if (toolCallArguments.trim()) {
      try {
        const parsed = JSON.parse(toolCallArguments);
        prompt = parsed.prompt;
      } catch (e) {
        const match = toolCallArguments.match(/"prompt"\s*:\s*"([^"]+)"/);
        if (match) prompt = match[1];
      }
    } else if (accumulatedText) {
      prompt = parseImagePromptFromJsonBlock(accumulatedText);
    }

    if (prompt) {
      isImageGenerated = true;
      try {
        if (!statusSent && typeof writeChunk === 'function') {
          writeChunk({ type: 'status', message: 'Generating image...' });
        }

        const result = await executeImageGeneration({
          prompt,
          abortSignal,
          requestId
        });

        if (!result.imageUrl || typeof result.imageUrl !== 'string' || !result.imageUrl.trim()) {
          throw new Error('Image generation returned an empty or invalid image URL');
        }

        if (typeof writeChunk === 'function') {
          writeChunk({
            type: 'image',
            imageUrl: result.imageUrl,
            prompt: result.prompt || prompt
          });
          writeChunk('[DONE]');
        }
      } catch (err) {
        logger.error('Tool call image generation failed', { requestId, error: err.message });
        if (typeof writeChunk === 'function') {
          writeChunk({
            type: 'image_error',
            message: 'Unable to generate image, please try again',
            error: err.message || 'Image synthesis failed'
          });
          writeChunk('[DONE]');
        }
      }
    }
  }
}

/**
 * OpenRouter Provider Adapter (System A)
 */
export class OpenRouterAdapter extends BaseProviderAdapter {
  constructor() {
    super('openrouter');
  }

  isConfigured() {
    return Boolean(config.openrouter.apiKey);
  }

  getUnconfiguredNotice() {
    return 'OPENROUTER_API_KEY is not set in server/.env. Please configure your OpenRouter API key to enable live model streaming.';
  }

  getCapabilities() {
    return {
      streaming: true,
      tools: true,
      vision: true,
      systemPrompt: true
    };
  }

  async createChatStream({
    model,
    messages = [],
    systemInstruction = null,
    projectId = null,
    projectInstructions = null,
    abortSignal = null,
    requestId = '-',
    writeChunk = null,
    enableTools = true
  }) {
    const resolvedModel = resolveModel(model);
    const formattedMessages = formatProviderMessages({
      messages,
      systemInstruction,
      projectId,
      projectInstructions,
      maxTokensApprox: 40000
    });

    const result = await createStreamWithResilience({
      model: resolvedModel,
      messages: formattedMessages,
      abortSignal,
      requestId,
      tools: enableTools ? [IMAGE_GENERATION_TOOL] : undefined,
      tool_choice: enableTools ? 'auto' : undefined
    });

    const stream = enableTools
      ? processStreamWithTools(result.stream, { writeChunk, abortSignal, requestId })
      : result.stream;

    return {
      stream,
      requestedModel: model,
      resolvedModel: result.resolvedModel,
      displayModel: result.resolvedModel,
      usedFallback: Boolean(result.usedFallback),
      provider: this.name
    };
  }
}

export const openrouterAdapter = new OpenRouterAdapter();
export default openrouterAdapter;
