import { tool } from 'ai';
import { z } from 'zod';
import { fetchWebContext } from '../../services/searchService.js';
import { executeDeepResearch } from '../../orchestrator/researchOrchestrator.js';
import { executeUnifiedTool } from './toolExecutor.js';

/**
 * Safe deterministic math expression evaluator (no arbitrary JS eval).
 */
export function evaluateSafeMathExpression(expression) {
  const raw = String(expression || '').trim();
  if (!raw || raw.length > 200) {
    throw new Error('Expression must be between 1 and 200 characters.');
  }

  // Allow only numbers, operators, parentheses, whitespace, commas, and whitelisted Math identifiers
  const sanitized = raw
    .replace(/\^/g, '**')
    .replace(/\b(sqrt|abs|round|floor|ceil|pow|log|log10|sin|cos|tan|min|max)\b/g, 'Math.$1')
    .replace(/\b(PI|E)\b/g, 'Math.$1');

  const stripped = sanitized.replace(/Math\.(sqrt|abs|round|floor|ceil|pow|log|log10|sin|cos|tan|min|max|PI|E)/g, '');
  if (!/^[0-9+\-*/().,%\s]+$/.test(stripped)) {
    throw new Error('Unsupported tokens in mathematical expression.');
  }

  // eslint-disable-next-line no-new-func
  const fn = new Function(`"use strict"; return (${sanitized});`);
  const result = fn();
  if (typeof result !== 'number' || !Number.isFinite(result)) {
    throw new Error('Expression did not evaluate to a finite number.');
  }
  return result;
}

const REGISTRY = [
  {
    name: 'web_search',
    displayName: 'Web Search',
    category: 'web-search',
    description: 'Search the live web for up-to-date facts, documentation, news, and verifiable URLs.',
    implemented: true,
    status: 'active',
    enabledByDefault: true,
    requiresModelToolCalling: true,
    timeoutMs: 12000,
    retries: 1,
    inputSchema: z.object({
      query: z.string().min(2).max(300).describe('Focused search query')
    }),
    handler: async ({ query }, ctx) => {
      const searchRes = await fetchWebContext({
        query,
        abortSignal: ctx.abortSignal,
        requestId: ctx.requestId || '-'
      });
      const sources = Array.isArray(searchRes?.sources) ? searchRes.sources : [];
      if (sources.length > 0 && typeof ctx.onSources === 'function') {
        await ctx.onSources(sources);
      }
      return {
        query,
        sourcesCount: sources.length,
        sources,
        contextText: searchRes?.contextText || ''
      };
    }
  },
  {
    name: 'deep_research',
    displayName: 'Deep Research',
    category: 'deep-research',
    description: 'Run multi-query research across web sources for comprehensive technical or factual synthesis.',
    implemented: true,
    status: 'active',
    enabledByDefault: true,
    requiresModelToolCalling: true,
    timeoutMs: 25000,
    retries: 0,
    inputSchema: z.object({
      query: z.string().min(3).max(400).describe('Research topic or question')
    }),
    handler: async ({ query }, ctx) => {
      const research = await executeDeepResearch({
        query,
        onStatusUpdate: async (msg) => {
          if (typeof ctx.onStatus === 'function') await ctx.onStatus(msg);
        },
        abortSignal: ctx.abortSignal,
        requestId: ctx.requestId || '-'
      });
      const sources = Array.isArray(research?.sources) ? research.sources : [];
      if (sources.length > 0 && typeof ctx.onSources === 'function') {
        await ctx.onSources(sources);
      }
      return {
        query,
        sourcesCount: sources.length,
        sources,
        contextText: research?.contextText || ''
      };
    }
  },
  {
    name: 'render_chart',
    displayName: 'Charts & Graphs',
    category: 'charts-and-graphs',
    description: 'Validate and render an interactive bar, line, or pie chart from structured numeric data.',
    implemented: true,
    status: 'active',
    enabledByDefault: true,
    requiresModelToolCalling: true,
    timeoutMs: 5000,
    retries: 0,
    inputSchema: z.object({
      type: z.enum(['bar', 'line', 'pie']).default('bar').describe('Chart visualization type'),
      title: z.string().min(1).max(120).describe('Chart title'),
      xKey: z.string().optional().describe('Category / X-axis key (defaults to name)'),
      yKeys: z.array(z.string()).optional().describe('Numeric series keys'),
      data: z
        .array(z.record(z.union([z.string(), z.number()])))
        .min(1)
        .max(50)
        .describe('Array of data objects with category and numeric values')
    }),
    handler: async (input) => {
      return {
        chartSpec: {
          type: input.type,
          title: input.title,
          xKey: input.xKey,
          yKeys: input.yKeys,
          data: input.data
        }
      };
    }
  },
  {
    name: 'calculate_math',
    displayName: 'Math Calculator',
    category: 'math-reasoning',
    description: 'Evaluate exact arithmetic or scientific mathematical expressions deterministically.',
    implemented: true,
    status: 'active',
    enabledByDefault: true,
    requiresModelToolCalling: true,
    timeoutMs: 3000,
    retries: 0,
    inputSchema: z.object({
      expression: z.string().min(1).max(200).describe('Mathematical expression, e.g. "(125 * 1.15) + sqrt(144)"')
    }),
    handler: async ({ expression }) => {
      const value = evaluateSafeMathExpression(expression);
      return { expression, result: value };
    }
  },
  // Designed / Planned / Disabled Categories (not executable in StreamText until dedicated integration)
  {
    name: 'image_generation',
    displayName: 'Image Generation',
    category: 'image-generation',
    description: 'Generate or edit images from prompts (disabled in /chat-next per Phase 7G; Frozen Image Workspace remains separate).',
    implemented: false,
    status: 'disabled',
    enabledByDefault: false,
    requiresModelToolCalling: true
  },
  {
    name: 'image_understanding',
    displayName: 'Image Understanding',
    category: 'image-understanding',
    description: 'Analyze and describe uploaded images.',
    implemented: false,
    status: 'planned',
    enabledByDefault: false,
    requiresModelToolCalling: false
  },
  {
    name: 'file_understanding',
    displayName: 'File Understanding',
    category: 'file-understanding',
    description: 'Inspect and summarize uploaded documents and text files.',
    implemented: false,
    status: 'planned',
    enabledByDefault: false,
    requiresModelToolCalling: true
  },
  {
    name: 'pdf_analysis',
    displayName: 'PDF Reading & Analysis',
    category: 'pdf-analysis',
    description: 'Structured extraction and citation over uploaded PDF documents.',
    implemented: false,
    status: 'planned',
    enabledByDefault: false,
    requiresModelToolCalling: true
  },
  {
    name: 'document_generation',
    displayName: 'Document Generation (PDF/DOCX)',
    category: 'document-generation',
    description: 'Generate downloadable PDF and DOCX deliverables.',
    implemented: false,
    status: 'planned',
    enabledByDefault: false,
    requiresModelToolCalling: true
  },
  {
    name: 'presentation_generation',
    displayName: 'Presentation Generation (PPTX)',
    category: 'presentation-generation',
    description: 'Generate downloadable slide decks.',
    implemented: false,
    status: 'planned',
    enabledByDefault: false,
    requiresModelToolCalling: true
  },
  {
    name: 'spreadsheet_analysis',
    displayName: 'Spreadsheet Generation & Analysis',
    category: 'spreadsheet-analysis',
    description: 'Parse, analyze, and generate XLSX/CSV spreadsheets.',
    implemented: false,
    status: 'planned',
    enabledByDefault: false,
    requiresModelToolCalling: true
  },
  {
    name: 'data_analysis',
    displayName: 'Data Analysis',
    category: 'data-analysis',
    description: 'Statistical summaries and structured dataset transformations.',
    implemented: false,
    status: 'planned',
    enabledByDefault: false,
    requiresModelToolCalling: true
  },
  {
    name: 'code_execution',
    displayName: 'Code Execution Sandbox',
    category: 'code-execution',
    description: 'Sandboxed code execution and verification.',
    implemented: false,
    status: 'planned',
    enabledByDefault: false,
    requiresModelToolCalling: true
  },
  {
    name: 'external_connectors',
    displayName: 'External API Connectors',
    category: 'external-connectors',
    description: 'Authenticated third-party API and workspace connectors.',
    implemented: false,
    status: 'planned',
    enabledByDefault: false,
    requiresModelToolCalling: true
  }
];

export function listToolDefinitions() {
  return REGISTRY.map(({ handler: _h, inputSchema: _s, ...meta }) => meta);
}

export function getToolDefinition(name) {
  return REGISTRY.find((t) => t.name === name) || null;
}

/**
 * Resolves AI SDK v7 `tool(...)` objects for streamText based on requested tools and model capabilities.
 */
export function resolveActiveTools({
  requestedTools = null,
  supportsTools = false,
  context = {}
} = {}) {
  if (!supportsTools) {
    return { sdkTools: undefined, activeToolNames: [], rejectedTools: Array.isArray(requestedTools) ? requestedTools : [] };
  }

  const wanted = Array.isArray(requestedTools)
    ? new Set(requestedTools.map(String))
    : null;

  // If caller explicitly passed an empty array [], disable tools for this turn
  if (wanted && wanted.size === 0) {
    return { sdkTools: undefined, activeToolNames: [], rejectedTools: [] };
  }

  const sdkTools = {};
  const activeToolNames = [];
  const rejectedTools = [];

  if (wanted) {
    for (const name of wanted) {
      const def = getToolDefinition(name);
      if (!def || !def.implemented || def.status !== 'active') {
        rejectedTools.push(name);
      }
    }
  }

  for (const def of REGISTRY) {
    if (!def.implemented || def.status !== 'active') continue;
    if (wanted ? !wanted.has(def.name) : !def.enabledByDefault) continue;

    sdkTools[def.name] = tool({
      description: def.description,
      inputSchema: def.inputSchema,
      execute: async (input) => executeUnifiedTool(def, input, context)
    });
    activeToolNames.push(def.name);
  }

  return {
    sdkTools: activeToolNames.length > 0 ? sdkTools : undefined,
    activeToolNames,
    rejectedTools
  };
}

export default {
  listToolDefinitions,
  getToolDefinition,
  resolveActiveTools,
  evaluateSafeMathExpression
};
