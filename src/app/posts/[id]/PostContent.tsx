'use client';

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import { useEffect } from 'react';

interface PostContentProps {
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

export default function PostContent({ title, date, excerpt, content }: PostContentProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Prism.highlightAll();
    }
  }, []);

  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      <header className="mb-8 not-prose">
        <time className="text-sm text-zinc-500 dark:text-zinc-400">
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-xl text-zinc-600 dark:text-zinc-400">
          {excerpt}
        </p>
      </header>

      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code({ children, className, ...rest }) {
            const match = /language-(.+)/.exec(className || '');
            const language = match ? match[1] : '';
            const code = String(children).trim();

            return (
              <code
                className={language ? `language-${language}` : ''}
                {...rest}
                data-prismjs-copy="Copy"
              >
                {code}
              </code>
            );
          },

          pre({ children }) {
            const handleCopy = async (event: React.MouseEvent) => {
              const button = event.currentTarget as HTMLButtonElement;
              const preElement = button.closest('pre');
              const codeElement = preElement?.querySelector('code');

              if (codeElement) {
                const text = codeElement.textContent || '';
                try {
                  if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                  } else {
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    textArea.remove();
                  }
                  button.textContent = 'Copied!';
                  setTimeout(() => {
                    button.textContent = 'Copy';
                  }, 2000);
                } catch (err) {
                  console.error('Failed to copy:', err);
                  button.textContent = 'Failed!';
                  setTimeout(() => {
                    button.textContent = 'Copy';
                  }, 2000);
                }
              }
            };

            return (
              <pre className="overflow-auto p-4 rounded bg-zinc-100 dark:bg-zinc-800 line-numbers relative">
                <button
                  onClick={handleCopy}
                  className="copy-button absolute top-0 right-0 px-4 py-2 rounded-bl bg-zinc-200 dark:bg-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                >
                  Copy
                </button>
                {children}
              </pre>
            );
          },
          h1({ children }) {
            return (
              <div>
                <h1 className="text-3xl font-bold mt-8 mb-2">{children}</h1>
                <hr className="border-t border-zinc-200 dark:border-zinc-700 mb-4 opacity-50" />              </div>
            );
          },
          h2({ children }) {
            return <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-xl font-bold mt-6 mb-4">{children}</h3>;
          },
          p({ children }) {
            return <p className="my-4">{children}</p>;
          },
          ul({ children }) {
            return <ul className="my-4 list-disc pl-6">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="my-4 list-decimal pl-6">{children}</ol>;
          },
          li({ children }) {
            return <li className="my-1">{children}</li>;
          },
          blockquote({ children }) {
            //bg-zinc-200 dark:bg-zinc-800 p-4 italic my-4 rounded-lg flex items-center justify-center
            return <blockquote className="
            border-l-6 border-zinc-300 dark:border-zinc-700 pl-4 italic my-4 dark:bg-zinc-800 p-2 rounded-lg flex items-center"
            >{children}</blockquote>;
          },
          img({ src, alt }) {
            return (
              <img
                src={src || ""}
                alt={alt || ""}
                className="w-[650px] h-[66%] object-cover rounded-lg block mx-auto mt-4 mb-4"
              />
            );
          },


          em ({ children }) {
            return (
              <strong className="font-semibold">
                <span className="bg-gray-200 dark:bg-gray-600 p-1 rounded">{children}</span>
              </strong>
            );
          },



          



        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}