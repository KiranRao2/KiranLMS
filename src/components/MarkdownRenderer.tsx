import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Split into code blocks and normal text blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-sm sm:text-base leading-relaxed text-slate-800">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
          const language = match ? match[1] || 'code' : 'code';
          const code = match ? match[2] : part.slice(3, -3);

          return <CodeBlock key={index} code={code.trim()} language={language} />;
        }

        // Render normal text with simple markdown parsing (headings, bullets, bold, inline code)
        return <TextSection key={index} text={part} />;
      })}
    </div>
  );
};

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950 text-slate-100 shadow-md">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-1.5 text-xs text-slate-400 font-mono">
        <span className="uppercase tracking-wider font-semibold text-violet-400">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs hover:bg-slate-800 hover:text-slate-200 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 font-mono text-xs sm:text-sm text-emerald-300 leading-normal">
        <pre>{code}</pre>
      </div>
    </div>
  );
};

const TextSection: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Heading 3
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="font-bold text-slate-900 text-base sm:text-lg mt-3 mb-1 text-indigo-950 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600 inline-block" />
              {parseInlineMarkdown(trimmed.replace('### ', ''))}
            </h3>
          );
        }

        // Heading 2
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="font-bold text-slate-900 text-lg sm:text-xl mt-4 mb-1 text-slate-900 border-b border-slate-200 pb-1">
              {parseInlineMarkdown(trimmed.replace('## ', ''))}
            </h2>
          );
        }

        // Heading 1
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="font-extrabold text-slate-900 text-xl sm:text-2xl mt-4 mb-2">
              {parseInlineMarkdown(trimmed.replace('# ', ''))}
            </h1>
          );
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 text-slate-700 pl-2">
              <span className="text-violet-600 font-bold mt-1 text-sm">•</span>
              <p className="flex-1">{parseInlineMarkdown(trimmed.slice(2))}</p>
            </div>
          );
        }

        // Numbered list
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 text-slate-700 pl-2">
              <span className="font-semibold text-violet-700 text-xs mt-1 bg-violet-100 rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                {numberedMatch[1]}
              </span>
              <p className="flex-1">{parseInlineMarkdown(numberedMatch[2])}</p>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-slate-700">
            {parseInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
};

function parseInlineMarkdown(text: string): React.ReactNode {
  // Handle inline code `code`
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="rounded bg-violet-50 px-1.5 py-0.5 font-mono text-xs font-semibold text-violet-800 border border-violet-200"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
