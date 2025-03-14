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
                className={`${className} line-numbers language-${language}`}
                {...rest}
              >
                {children}
              </code>
            );
          },

          pre({ children }) {
            return (
              <pre className="overflow-auto p-4 rounded bg-zinc-100 dark:bg-zinc-800 line-numbers">
                {children}
              </pre>
            );
          },
          h1({ children }) {
            return <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>;
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
            return <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 italic my-4">{children}</blockquote>;
          },
          img({ src, alt }) {
            return (
              <img
                src={src || ""}
                alt={alt || ""}
                className="w-[650px] h-[66%] object-cover rounded-lg block mx-auto"
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}