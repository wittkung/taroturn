// src/components/MarkdownRenderer.tsx - Production-grade Markdown Renderer powered by react-markdown & remark-gfm
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  return (
    <div className={`markdown-body select-text leading-relaxed text-slate-800 dark:text-slate-200 text-xs font-editorial space-y-3 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-editorial font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2 pb-1.5 border-b border-amber-500/30 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block flex-shrink-0" />
              <span>{children}</span>
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[14px] font-editorial font-bold text-slate-900 dark:text-slate-100 mt-3.5 mb-1.5 flex items-center gap-2">
              <span className="w-1 h-3.5 bg-purple-500 rounded-full inline-block flex-shrink-0" />
              <span>{children}</span>
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[13px] font-editorial font-bold text-amber-600 dark:text-amber-300 mt-3 mb-1">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-[12px] font-editorial font-bold text-purple-400 mt-2 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-[12px] font-editorial text-slate-800 dark:text-slate-200 leading-relaxed my-1.5">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-amber-600 dark:text-amber-400">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-purple-600 dark:text-purple-300 font-editorial">
              {children}
            </em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="p-3 my-2.5 rounded-2xl bg-purple-500/10 border-l-4 border-amber-500 text-[12px] font-editorial italic text-slate-700 dark:text-slate-300 shadow-sm">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1.5 my-2 pl-2 list-none">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1.5 my-2 pl-4 list-decimal marker:text-amber-500 font-mono text-[11px]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-[12px] font-editorial text-slate-800 dark:text-slate-200 flex items-start gap-2">
              <span className="text-amber-500 text-[10px] mt-0.5 flex-shrink-0">✦</span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-purple-500/20 bg-black/20">
              <table className="w-full text-left text-[11px] font-editorial border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-purple-500/15 text-amber-300 border-b border-purple-500/30">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-white/5">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-white/[0.02] transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="p-2.5 font-bold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="p-2.5 text-slate-300">{children}</td>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 font-mono text-[11px] border border-purple-500/25">
              {children}
            </code>
          ),
          hr: () => (
            <hr className="my-3 border-t border-purple-500/20" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
