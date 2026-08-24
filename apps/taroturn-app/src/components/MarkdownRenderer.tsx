// src/components/MarkdownRenderer.tsx - Elegant Zen Markdown Renderer
import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-1.5 my-2 pl-4">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const formatInline = (text: string): React.ReactNode => {
    // Split by bold (**text**)
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-amber-500 dark:text-amber-400">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Split by code (`code`)
      const codeParts = part.split(/(`.*?`)/g);
      return codeParts.map((cp, j) => {
        if (cp.startsWith('`') && cp.endsWith('`')) {
          return (
            <code
              key={j}
              className="px-1.5 py-0.5 mx-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 font-mono text-[11px] border border-purple-500/25"
            >
              {cp.slice(1, -1)}
            </code>
          );
        }
        return cp;
      });
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      elements.push(<div key={`space-${index}`} className="h-2" />);
      return;
    }

    // Heading 1 (# ...)
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1
          key={`h1-${index}`}
          className="text-lg font-editorial font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2 pb-1 border-b border-purple-500/30 flex items-center gap-2"
        >
          <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block" />
          {formatInline(trimmed.slice(2))}
        </h1>
      );
      return;
    }

    // Heading 2 (## ...)
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2
          key={`h2-${index}`}
          className="text-base font-editorial font-bold text-slate-900 dark:text-slate-100 mt-3.5 mb-1.5 flex items-center gap-2"
        >
          <span className="w-1 h-3.5 bg-purple-500 rounded-full inline-block" />
          {formatInline(trimmed.slice(3))}
        </h2>
      );
      return;
    }

    // Heading 3 (### ...)
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3
          key={`h3-${index}`}
          className="text-sm font-editorial font-bold text-amber-600 dark:text-amber-300 mt-3 mb-1"
        >
          {formatInline(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    // Blockquote (> ...)
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${index}`}
          className="p-3 my-2 rounded-xl bg-purple-500/10 border-l-4 border-amber-500 text-[12px] font-editorial italic text-slate-700 dark:text-slate-300 shadow-sm"
        >
          {formatInline(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Bullet List (- ... or * ...)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(
        <li
          key={`li-${index}`}
          className="text-[12px] font-editorial text-slate-800 dark:text-slate-200 flex items-start gap-2"
        >
          <span className="text-amber-500 text-[10px] mt-1">✦</span>
          <span className="flex-1">{formatInline(trimmed.slice(2))}</span>
        </li>
      );
      return;
    }

    // Numbered List (1. ... 2. ...)
    if (/^\d+\.\s/.test(trimmed)) {
      inList = true;
      const numMatch = trimmed.match(/^(\d+)\.\s(.*)$/);
      if (numMatch) {
        listItems.push(
          <li
            key={`li-${index}`}
            className="text-[12px] font-editorial text-slate-800 dark:text-slate-200 flex items-start gap-2"
          >
            <span className="font-mono text-[10px] font-bold text-purple-400 bg-purple-500/20 px-1.5 py-0.2 rounded">
              {numMatch[1]}
            </span>
            <span className="flex-1">{formatInline(numMatch[2])}</span>
          </li>
        );
        return;
      }
    }

    // Regular Paragraph
    flushList();
    elements.push(
      <p
        key={`p-${index}`}
        className="text-[12px] font-editorial text-slate-800 dark:text-slate-200 leading-relaxed my-1"
      >
        {formatInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};
