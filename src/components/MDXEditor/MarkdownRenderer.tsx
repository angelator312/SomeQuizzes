'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/atom-one-dark.css';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeHighlight, [rehypeKatex, { output: 'html' }]]}
      components={{
        code: ({ node, className: codeClassName, children, ...props }) => {
          const match = /language-(\w+)/.exec(codeClassName || '');
          const language = match ? match[1] : '';
          return (
            <code
              className={`${codeClassName || ''} text-sm px-2 py-1 rounded bg-gray-900 text-gray-100`}
              {...props}
            >
              {children}
            </code>
          );
        },
        pre: ({ children, ...props }) => (
          <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto" {...props}>
            {children}
          </pre>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
