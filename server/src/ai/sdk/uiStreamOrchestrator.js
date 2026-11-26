import {
  convertToModelMessages,
  createUIMessageStream,
  pipeUIMessageStreamToResponse,
  stepCountIs,
  streamText
} from 'ai';
import { resolveSdkLanguageModel } from './providerRegistry.js';
import { resolveActiveTools } from '../tools/toolRegistry.js';
import { buildSystemPrompt } from '../../prompts/masterSystemPrompt.js';
import { fetchWebContext } from '../../services/searchService.js';
import { executeDeepResearch } from '../../orchestrator/researchOrchestrator.js';
import { recordRequestMetrics } from '../../services/usageService.js';
import { formatErrorForClient } from '../../utils/errors.js';
import logger from '../../utils/logger.js';

let activeStreams = 0;
export function getActiveStreamCount() {
  return activeStreams;
}

function normalizeToUIMessages(messages = []) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && typeof m === 'object')
    .map((m, idx) => {
      if (Array.isArray(m.parts) && m.parts.length > 0) {
        return {
          id: m.id || `msg-${idx}`,
          role: m.role === 'assistant' || m.role === 'system' ? m.role : 'user',
          parts: m.parts
        };
      }
      const text = typeof m.content === 'string'
        ? m.content
        : Array.isArray(m.content)
          ? m.content.filter((p) => p?.type === 'text').map((p) => p.text || '').join('\n')
          : '';
      return {
        id: m.id || `msg-${idx}`,
        role: m.role === 'assistant' || m.role === 'system' ? m.role : 'user',
        parts: text ? [{ type: 'text', text }] : []
      };
    })
    .filter((m) => m.parts.length > 0);
}

function extractLastUserQuery(uiMessages = []) {
  const lastUser = [...uiMessages].reverse().find((m) => m.role === 'user');
  if (!lastUser) return 'Overview';
  const textParts = (lastUser.parts || [])
    .filter((p) => p?.type === 'text' && typeof p.text === 'string')
    .map((p) => p.text);
  return textParts.join('\n').trim() || 'Overview';
}

/**
 * Vercel AI SDK v7 UI Message Stream Orchestrator
 * Standardizes LLM execution and streaming via `streamText` + `createUIMessageStream` + `pipeUIMessageStreamToResponse`
 * while preserving Mestrio's model routing, web search, deep research, and usage accounting.
 */
export async function orchestrateUiStream({
  req,
  res,
  messages = [],
  model = 'mahi-engine',
  searchMode = 'none',
  enabledTools = null,
  projectId = null,
  projectInstructions = null,
  systemPrompt: customSystemPrompt = null,
  userName = null,
  userId = null,
  language = null,
  requestId = '-'
}) {
  const startTime = Date.now();
  const abortController = new AbortController();
  const maxDurationMs = Math.max(5000, Number(process.env.STREAM_MAX_DURATION_MS || 120000));
  activeStreams += 1;

  const streamTimeout = setTimeout(() => {
    if (!abortController.signal.aborted) {
      abortController.abort();
      logger.warn('AI SDK UI stream timed out', { requestId, maxDurationMs, activeStreams });
    }
  }, maxDurationMs);
  if (typeof streamTimeout.unref === 'function') streamTimeout.unref();

  const handleDisconnect = () => {
    if (!abortController.signal.aborted) {
      abortController.abort();
      logger.debug('AI SDK UI stream client disconnected', { requestId });
    }
  };
  const handleClose = () => {
    if (!res.writableEnded) handleDisconnect();
  };
  req.on('aborted', handleDisconnect);
  res.on('close', handleClose);

  try {

  const uiMessages = normalizeToUIMessages(messages);
  const lastUserQuery = extractLastUserQuery(uiMessages);
  const modelMessages = await convertToModelMessages(uiMessages);

  const sdkTarget = resolveSdkLanguageModel(model);
  if (!sdkTarget.isConfigured || !sdkTarget.languageModel) {
    const notice = `${sdkTarget.provider} API key is not configured.`;
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({
          type: 'data-status',
          data: {
            requestedModel: model,
            resolvedModel: sdkTarget.resolvedModel,
            provider: sdkTarget.provider,
            isFallback: false,
            message: notice
          }
        });
        const textId = `txt-${requestId}`;
        writer.write({ type: 'text-start', id: textId });
        writer.write({ type: 'text-delta', id: textId, delta: notice });
        writer.write({ type: 'text-end', id: textId });
      }
    });
    return pipeUIMessageStreamToResponse({ response: res, stream });
  }

  let systemInstruction = buildSystemPrompt({
    userName,
    language,
    searchMode,
    hasAttachments: false,
    selectedModelLabel: model,
    allowImageTool: false
  });
  if (customSystemPrompt) {
    systemInstruction = `${systemInstruction}\n\n${customSystemPrompt}`;
  }
  if (projectInstructions) {
    systemInstruction = `${systemInstruction}\n\nPROJECT WORKSPACE INSTRUCTIONS (${projectId || 'default'}):\n${projectInstructions}`;
  }

  let sourcesCount = 0;

  const uiStream = createUIMessageStream({
    execute: async ({ writer }) => {
      let currentModel = sdkTarget.languageModel;
      let resolvedModelId = sdkTarget.resolvedModel;
      let isFallback = false;

      // 1. Web Search / Deep Research Grounding
      if (searchMode === 'deep-research') {
        const research = await executeDeepResearch({
          query: lastUserQuery,
          onStatusUpdate: async (statusMsg) => {
            writer.write({
              type: 'data-status',
              data: {
                requestedModel: model,
                resolvedModel: resolvedModelId,
                provider: sdkTarget.provider,
                isFallback: false,
                message: statusMsg
              }
            });
          },
          abortSignal: abortController.signal,
          requestId
        });
        if (!research.isCasual && research.sources?.length > 0) {
          sourcesCount = research.sources.length;
          writer.write({ type: 'data-sources', data: { sources: research.sources } });
          systemInstruction = `${systemInstruction}\n\nRESEARCH CONTEXT & VERIFIED SOURCES:\n${research.contextText}`;
        }
      } else if (searchMode === 'web-search') {
        const searchRes = await fetchWebContext({
          query: lastUserQuery,
          abortSignal: abortController.signal,
          requestId
        });
        if (searchRes.sources?.length > 0) {
          sourcesCount = searchRes.sources.length;
          writer.write({ type: 'data-sources', data: { sources: searchRes.sources } });
          systemInstruction = `${systemInstruction}\n\nREFERENCE CONTEXT:\n${searchRes.contextText}`;
        }
      }

      if (abortController.signal.aborted) return;

      const { sdkTools, activeToolNames, rejectedTools } = resolveActiveTools({
        requestedTools: enabledTools,
        supportsTools: sdkTarget.supportsTools,
        context: {
          requestId,
          abortSignal: abortController.signal,
          onStatus: async (statusMsg) => {
            writer.write({
              type: 'data-status',
              data: {
                requestedModel: model,
                resolvedModel: resolvedModelId,
                provider: sdkTarget.provider,
                isFallback: false,
                message: statusMsg
              }
            });
          },
          onSources: async (sources) => {
            sourcesCount += sources.length;
            writer.write({ type: 'data-sources', data: { sources } });
          }
        }
      });

      const unsupportedToolsNotice =
        Array.isArray(enabledTools) && enabledTools.length > 0 && !sdkTarget.supportsTools
          ? `Model "${resolvedModelId}" does not support tool calling; responding in standard text mode.`
          : rejectedTools.length > 0 && activeToolNames.length === 0 && Array.isArray(enabledTools) && enabledTools.length > 0
            ? `Requested tool(s) (${rejectedTools.join(', ')}) are not currently active.`
            : '';

      writer.write({
        type: 'data-status',
        data: {
          requestedModel: model,
          resolvedModel: resolvedModelId,
          provider: sdkTarget.provider,
          isFallback: false,
          message: unsupportedToolsNotice
        }
      });

      const result = streamText({
        model: currentModel,
        system: systemInstruction,
        messages: modelMessages,
        ...(sdkTools ? { tools: sdkTools, stopWhen: stepCountIs(5) } : {}),
        abortSignal: abortController.signal,
        onFinish: ({ text, usage }) => {
          const inputTokens = typeof usage?.inputTokens === 'number' ? usage.inputTokens : null;
          const outputTokens = typeof usage?.outputTokens === 'number' ? usage.outputTokens : null;
          const totalTokens = typeof usage?.totalTokens === 'number'
            ? usage.totalTokens
            : (inputTokens !== null && outputTokens !== null ? inputTokens + outputTokens : null);

          if (totalTokens !== null) {
            writer.write({
              type: 'data-usage',
              data: {
                provider: sdkTarget.provider,
                requestedModel: model,
                resolvedModel: resolvedModelId,
                inputTokens,
                outputTokens,
                totalTokens
              }
            });
          }

          recordRequestMetrics({
            requestId,
            userId,
            provider: sdkTarget.provider,
            requestedModel: model,
            model: resolvedModelId,
            mode: searchMode,
            promptLength: JSON.stringify(uiMessages).length,
            completionLength: (text || '').length,
            inputTokens,
            outputTokens,
            totalTokens,
            durationMs: Date.now() - startTime,
            cacheHit: false,
            sourcesCount
          });
        }
      });

      writer.merge(result.toUIMessageStream({ sendStart: false }));
    },
    onError: (err) => {
      const safe = formatErrorForClient(err, requestId);
      logger.error('AI SDK UI stream error', { requestId, error: safe.body.error.message });
      return safe.body.error.message;
    }
  });

  await pipeUIMessageStreamToResponse({ response: res, stream: uiStream });
  } finally {
    activeStreams = Math.max(0, activeStreams - 1);
    clearTimeout(streamTimeout);
    req.off('aborted', handleDisconnect);
    res.off('close', handleClose);
  }
}

export default {
  orchestrateUiStream,
  getActiveStreamCount
};
