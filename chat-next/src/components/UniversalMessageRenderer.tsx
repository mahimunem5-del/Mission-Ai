import React, { Suspense, lazy, useState } from 'react';
import { Streamdown } from 'streamdown';
import { code } from '@streamdown/code';
import { math } from '@streamdown/math';
import { mermaid } from '@streamdown/mermaid';
import 'katex/dist/katex.min.css';
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Info,
  Wrench
} from 'lucide-react';
import type {
  SourceItem,
  UniversalAttachment,
  UniversalMessage,
  UniversalMessagePart
} from '../types/universal';
import type { ChartSpec } from './ChartRenderer';

const LazyChartRenderer = lazy(() => import('./ChartRenderer'));

const streamdownPlugins = { code, math, mermaid };

function tryParseChartSpec(raw: string): ChartSpec | null {
  try {
    const parsed = JSON.parse(raw.trim());
    if (!parsed || typeof parsed !== 'object') return null;
    if (Array.isArray(parsed.data)) {
      return parsed as ChartSpec;
    }
    // Support Chart.js-style { labels: [...], datasets: [{ label, data: [...] }] }
    if (
      parsed.data &&
      typeof parsed.data === 'object' &&
      Array.isArray(parsed.data.labels) &&
      Array.isArray(parsed.data.datasets)
    ) {
      const labels: string[] = parsed.data.labels.map(String);
      const datasets: Array<{ label?: string; data?: number[] }> = parsed.data.datasets;
      const yKeys = datasets.map((d, i) => d.label || `series${i + 1}`);
      const rows = labels.map((label, idx) => {
        const row: Record<string, unknown> = { name: label };
        datasets.forEach((d, sIdx) => {
          row[yKeys[sIdx]] = Array.isArray(d.data) ? (d.data[idx] ?? 0) : 0;
        });
        return row;
      });
      return {
        type: parsed.type === 'line' || parsed.type === 'pie' ? parsed.type : 'bar',
        title: typeof parsed.title === 'string' ? parsed.title : undefined,
        xKey: 'name',
        yKeys,
        data: rows
      };
    }
  } catch {
    return null;
  }
  return null;
}

function extractPlainText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractPlainText).join('');
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return extractPlainText(props.children);
  }
  return '';
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

const PreBlockWrapper: React.FC<{ children?: React.ReactNode } & React.HTMLAttributes<HTMLPreElement>> = ({
  children,
  className,
  ...props
}) => {
  const [copied, setCopied] = useState(false);

  // Detect chart/recharts blocks already replaced by LazyChartRenderer
  if (React.isValidElement(children) && (children.type === Suspense || (children.props as any)?.spec)) {
    return <>{children}</>;
  }

  let lang = '';
  if (React.isValidElement(children)) {
    const childClass = (children.props as { className?: string })?.className || '';
    const match = /language-([^\s]+)/.exec(childClass);
    if (match) lang = match[1];
  }

  // If inner code is chart/recharts, let LazyChartRenderer render directly without a code frame
  if (lang === 'chart' || lang === 'recharts') {
    return <>{children}</>;
  }

  const handleCopyCode = async () => {
    const text = extractPlainText(children).trimEnd();
    if (!text) return;
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok && typeof document !== 'undefined') {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3.5 py-2 text-[11px] text-zinc-400">
        <span className="font-mono font-medium uppercase tracking-wider text-zinc-300">
          {lang || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          aria-label="Copy code block"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className={`overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-100 ${className || ''}`} {...props}>
        {children}
      </pre>
    </div>
  );
};

const markdownComponents: Record<string, React.ComponentType<any>> = {
  h1: ({ children, ...props }) => (
    <h1 className="mb-3 mt-5 text-lg font-semibold tracking-tight text-foreground first:mt-0" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="mb-2.5 mt-5 border-b border-border/60 pb-1 text-base font-semibold tracking-tight text-foreground first:mt-0" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="mb-2 mt-4 text-sm font-semibold text-foreground first:mt-0" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="mb-1.5 mt-3.5 text-sm font-medium text-foreground first:mt-0" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground first:mt-0" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 className="mb-1 mt-3 text-xs font-medium text-muted-foreground first:mt-0" {...props}>
      {children}
    </h6>
  ),
  p: ({ children, ...props }) => (
    <p className="my-2.5 leading-relaxed text-foreground first:mt-0 last:mb-0" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="my-2.5 list-disc space-y-1 pl-5 text-foreground" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-2.5 list-decimal space-y-1 pl-5 text-foreground" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed [&>ol]:my-1 [&>ul]:my-1" {...props}>
      {children}
    </li>
  ),
  hr: (props) => <hr className="my-5 border-border" {...props} />,
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-3.5 rounded-r-lg border-l-2 border-foreground/35 bg-muted/30 px-4 py-2 text-sm text-muted-foreground"
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
      {...props}
    >
      {children}
    </a>
  ),
  pre: PreBlockWrapper,
  table: ({ children, ...props }) => (
    <div className="my-4 w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full border-collapse text-left text-sm tabular-nums" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="border-b border-border bg-muted/60 text-xs font-semibold uppercase tracking-wide text-muted-foreground" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th className="px-3.5 py-2.5 font-medium" {...props}>{children}</th>
  ),
  td: ({ children, ...props }) => (
    <td className="border-t border-border px-3.5 py-2.5 align-top" {...props}>{children}</td>
  ),
  code: ({ className, children, ...props }) => {
    const lang = typeof className === 'string' ? className.replace('language-', '').trim() : '';
    if (lang === 'chart' || lang === 'recharts') {
      const raw = Array.isArray(children) ? children.join('') : String(children ?? '');
      const spec = tryParseChartSpec(raw);
      if (spec) {
        return (
          <Suspense
            fallback={
              <div className="my-3 rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                Loading chart...
              </div>
            }
          >
            <LazyChartRenderer spec={spec} />
          </Suspense>
        );
      }
      return (
        <div className="my-3 rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
          Unable to render chart: invalid or empty chart data.
        </div>
      );
    }
    const isBlock = Boolean(lang);
    return (
      <code
        className={
          isBlock
            ? className
            : `rounded bg-muted px-1.5 py-0.5 font-mono text-[12px] text-foreground ${className || ''}`
        }
        {...props}
      >
        {children}
      </code>
    );
  }
};

export const MarkdownBlock: React.FC<{ text: string; isStreaming?: boolean }> = React.memo(
  ({ text, isStreaming = false }) => {
    if (!text) return null;
    return (
      <div className="mestrio-prose prose prose-zinc max-w-none text-sm leading-relaxed text-foreground dark:prose-invert">
        <Streamdown
          plugins={streamdownPlugins}
          components={markdownComponents}
          isAnimating={isStreaming}
        >
          {text}
        </Streamdown>
      </div>
    );
  }
);

const SourcesSection: React.FC<{ sources: SourceItem[] }> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-4 rounded-xl border border-border bg-muted/20 p-3">
      <div className="mb-2.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" />
          <span>Sources ({sources.length})</span>
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {sources.map((src, idx) => {
          const domain = src.domain || extractDomain(src.url);
          return (
            <a
              key={`${src.url}-${idx}`}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs transition-colors hover:bg-muted/50"
            >
              <span className="mt-0.5 shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                [{idx + 1}]
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-foreground group-hover:underline">
                  {src.title || domain}
                </div>
                <div className="truncate text-[11px] text-muted-foreground">{domain}</div>
              </div>
              <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
            </a>
          );
        })}
      </div>
    </div>
  );
};

const AttachmentCard: React.FC<{ attachment: UniversalAttachment }> = ({ attachment }) => (
  <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs">
    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
    <span className="max-w-[180px] truncate font-medium text-foreground">{attachment.fileName}</span>
    <span className="text-muted-foreground">
      ({Math.max(1, Math.round((attachment.sizeBytes || 0) / 1024))} KB)
    </span>
    {attachment.publicUrl && (
      <a
        href={attachment.publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground"
        aria-label={`Open ${attachment.fileName}`}
      >
        <Download className="h-3.5 w-3.5" />
      </a>
    )}
  </div>
);

const PartRenderer: React.FC<{ part: UniversalMessagePart; isStreaming: boolean }> = ({
  part,
  isStreaming
}) => {
  switch (part.partType) {
    case 'text': {
      const text = typeof part.payload?.text === 'string' ? part.payload.text : '';
      return <MarkdownBlock text={text} isStreaming={isStreaming} />;
    }
    case 'image': {
      const imageUrl = typeof part.payload?.imageUrl === 'string' ? part.payload.imageUrl : '';
      const prompt = typeof part.payload?.prompt === 'string' ? part.payload.prompt : '';
      if (!imageUrl) return null;
      return (
        <div className="my-3 overflow-hidden rounded-xl border border-border bg-muted/20">
          <img
            src={imageUrl}
            alt={prompt || 'Generated image'}
            className="max-h-[480px] w-auto object-contain"
            loading="lazy"
          />
          <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
            <span className="truncate">{prompt || 'Generated image'}</span>
            <a
              href={imageUrl}
              download="mestrio-image.png"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 rounded px-2 py-1 hover:bg-muted hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Open</span>
            </a>
          </div>
        </div>
      );
    }
    case 'sources': {
      const sources = Array.isArray(part.payload?.sources)
        ? (part.payload.sources as SourceItem[])
        : [];
      return <SourcesSection sources={sources} />;
    }
    case 'tool_call': {
      const toolName = String(part.payload?.toolName || 'tool');
      const state = String(part.payload?.state || 'running');
      const stateLabel = state === 'error' ? 'Failed' : state === 'completed' ? 'Completed' : 'Running';
      return (
        <div className="my-2 flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
          <div className="flex items-center gap-2 text-foreground">
            <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{toolName}</span>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              state === 'error'
                ? 'bg-red-100 text-red-700'
                : state === 'completed'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-zinc-200 text-zinc-800'
            }`}
          >
            {state === 'running' && (
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            )}
            <span>{stateLabel}</span>
          </span>
        </div>
      );
    }
    case 'tool_result': {
      const toolName = String(part.payload?.toolName || 'tool');
      const rawRes = part.payload?.result as Record<string, any> | undefined;
      const isErr = Boolean(part.payload?.isError || rawRes?.ok === false);

      if (isErr) {
        const errMsg = rawRes?.error?.message || `Tool ${toolName} failed.`;
        return (
          <div className="my-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{String(errMsg)}</span>
          </div>
        );
      }

      const data = rawRes && typeof rawRes === 'object' && 'data' in rawRes ? rawRes.data : rawRes;

      if (toolName === 'render_chart' && data?.chartSpec) {
        return (
          <Suspense
            fallback={
              <div className="my-3 rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                Loading chart...
              </div>
            }
          >
            <LazyChartRenderer spec={data.chartSpec as ChartSpec} />
          </Suspense>
        );
      }

      if (toolName === 'calculate_math' && data && typeof data.result === 'number') {
        return (
          <div className="my-2 flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3.5 py-2 text-xs">
            <span className="font-mono text-muted-foreground">{String(data.expression || 'Result')}</span>
            <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
              = {data.result}
            </span>
          </div>
        );
      }

      return (
        <div className="my-2 rounded-lg border border-border bg-muted/30 p-3 text-xs">
          <div className="mb-1 font-medium text-foreground">Tool Result: {toolName}</div>
          <pre className="overflow-x-auto text-muted-foreground">
            {JSON.stringify(data ?? {}, null, 2)}
          </pre>
        </div>
      );
    }
    case 'file': {
      return (
        <AttachmentCard
          attachment={{
            id: String(part.payload?.attachmentId || part.partIndex),
            fileName: String(part.payload?.fileName || 'file'),
            mimeType: String(part.payload?.mimeType || 'application/octet-stream'),
            sizeBytes: Number(part.payload?.sizeBytes || 0)
          }}
        />
      );
    }
    default:
      return (
        <div className="my-2 flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          <span>Unsupported content part: {part.partType}</span>
        </div>
      );
  }
};

export const UniversalMessageRenderer: React.FC<{ message: UniversalMessage }> = React.memo(
  ({ message }) => {
    const isStreaming = message.status === 'streaming';
    const { metadata, attachments, parts } = message;

    return (
      <div className="space-y-2">
        {metadata.isFallback && metadata.fallbackNotice && (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>{metadata.fallbackNotice}</span>
          </div>
        )}

        {isStreaming && metadata.statusMessage && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-foreground/60" />
            <span>{metadata.statusMessage}</span>
          </div>
        )}

        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((att) => (
              <AttachmentCard key={att.id} attachment={att} />
            ))}
          </div>
        )}

        {parts.map((part, idx) => (
          <PartRenderer key={`${part.partType}-${part.partIndex}-${idx}`} part={part} isStreaming={isStreaming} />
        ))}

        {message.status === 'interrupted' && (
          <div className="text-xs italic text-muted-foreground">Generation stopped by user.</div>
        )}

        {metadata.error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{metadata.error.message}</span>
          </div>
        )}
      </div>
    );
  }
);

export default UniversalMessageRenderer;
