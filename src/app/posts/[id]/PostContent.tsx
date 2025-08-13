'use client';

import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

interface PostContentProps {
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

export default function PostContent({ title, date, excerpt, content }: PostContentProps) {
  useEffect(() => {
    hljs.configure({
      languages: ['javascript', 'typescript', 'python', 'java', 'bash', 'json', 'html', 'css', 'xml', 'yaml', 'markdown']
    });

    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [content]);

  useEffect(() => {
    const setupCodeBlocks = () => {
      const codeBlocks = document.querySelectorAll('pre');

      codeBlocks.forEach((codeBlock) => {
        const codeElement = codeBlock.querySelector('code');
        if (codeElement) {
          hljs.highlightElement(codeElement as HTMLElement);
        }

        if (codeBlock.querySelector('.copy-button')) return;

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';

        copyButton.addEventListener('click', async () => {
          const code = codeBlock.querySelector('code');
          const text = code?.textContent || '';

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

            copyButton.textContent = 'Copied!';
            setTimeout(() => {
              copyButton.textContent = 'Copy';
            }, 2000);
          } catch (err) {
            console.error('Failed to copy:', err);
            copyButton.textContent = 'Failed!';
            setTimeout(() => {
              copyButton.textContent = 'Copy';
            }, 2000);
          }
        });

        codeBlock.style.position = 'relative';
        codeBlock.appendChild(copyButton);
      });
    };

    setTimeout(() => {
      setupCodeBlocks();
    }, 100);

    const observer = new MutationObserver((mutations) => {
      let hasCodeChanges = false;

      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'PRE' || (node.nodeType === 1 && (node as Element).querySelector('pre'))) {
              hasCodeChanges = true;
            }
          });
        }
      });

      if (hasCodeChanges) {
        setupCodeBlocks();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [content]);

  useEffect(() => {
    const existingStyle = document.getElementById('code-block-styles');
    if (existingStyle) return;

    const styleElement = document.createElement('style');
    styleElement.id = 'code-block-styles';
    styleElement.textContent = `
      pre {
        position: relative;
        border-radius: 0.5rem;
        overflow: hidden;
        margin: 1.5rem 0;
      }

      .copy-button {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        line-height: 1;
        background-color: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.8);
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .copy-button:hover {
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
      }

      pre code {
        display: block;
        padding: 1rem;
        overflow-x: auto;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 0.875rem;
        line-height: 1.5;
      }
    `;

    document.head.appendChild(styleElement);

    return () => {
      const styleToRemove = document.getElementById('code-block-styles');
      if (styleToRemove) {
        document.head.removeChild(styleToRemove);
      }
    };
  }, []);

  return (
    <article className="prose prose-invert mx-auto [&>*]:my-6">
      <header className="mb-8 not-prose">
        <time className="text-sm text-zinc-400">
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-xl text-zinc-400">
          {excerpt}
        </p>
      </header>

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }]
        ]}
        components={{
          code({ node, className, children, ...props }: any) {
            const isInline = !className || !className.includes('language-');

            if (isInline) {
              return (
                <code
                  className="bg-zinc-700 text-zinc-200 font-mono text-sm px-1.5 py-1 rounded"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },

          pre({ children, ...props }: any) {
            return (
              <pre className="overflow-auto my-8 p-4 rounded-lg bg-zinc-900 border border-zinc-700 relative" {...props}>
                {children}
              </pre>
            );
          },

          h1({ children, ...props }: any) {
            return (
              <div>
                <h1 className="text-3xl font-bold mt-8 mb-2">{children}</h1>
                <hr className="border-t border-zinc-700 mb-4 opacity-50" />
              </div>
            );
          },
          h2({ children, ...props }: any) {
            return <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>;
          },
          h3({ children, ...props }: any) {
            return <h3 className="text-xl font-bold mt-6 mb-4">{children}</h3>;
          },
          p({ children, ...props }: any) {
            return <p className="my-5 leading-relaxed">{children}</p>;
          },
          ul({ children, ...props }: any) {
            return <ul className="my-6 list-disc pl-6">{children}</ul>;
          },
          ol({ children, ...props }: any) {
            return <ol className="my-6 list-decimal pl-6">{children}</ol>;
          },
          li({ children, ...props }: any) {
            return <li className="my-6">{children}</li>;
          },
          blockquote({ children, ...props }: any) {
            return (
              <blockquote className="border-l-6 border-zinc-700 pl-4 italic my-6 bg-zinc-800 p-2 rounded-lg flex items-center">
                {children}
              </blockquote>
            );
          },
          img({ src, alt, ...props }: any) {
            return (
              <img
                src={src || ""}
                alt={alt || ""}
                // className="w-[100%] h-[100%] object-cover rounded-lg block mx-auto my-8"
                className="w-full h-auto object-contain rounded-lg block mx-auto my-6"
              />
            );
          },

          em({ children, ...props }: any) {
            return (
              <em className="italic text-zinc-300" {...props}>
                {children}
              </em>
            );
          },
          strong({ children, ...props }: any) {
            return (
              <strong className="font-bold text-zinc-100" {...props}>
                {children}
              </strong>
            );
          },
          hr(props: any) {
            return <hr className="border-t border-zinc-700 my-8 opacity-50" />;
          },
          table({ children, ...props }: any) {
            return (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full border border-zinc-700 rounded-lg" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          thead({ children, ...props }: any) {
            return <thead className="bg-zinc-800" {...props}>{children}</thead>;
          },
          tbody({ children, ...props }: any) {
            return <tbody className="divide-y divide-zinc-700" {...props}>{children}</tbody>;
          },
          tr({ children, ...props }: any) {
            return <tr className="border-b border-zinc-700" {...props}>{children}</tr>;
          },
          th({ children, ...props }: any) {
            return <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300 uppercase tracking-wider" {...props}>{children}</th>;
          },
          td({ children, ...props }: any) {
            return <td className="px-4 py-3 text-sm" {...props}>{children}</td>;
          },

          a({ children, href, ...props }: any) {
            // 헤딩 안의 자동 생성된 앵커 링크는 기본 스타일 유지
            if (href && href.startsWith('#')) {
              return <a href={href} {...props}>{children}</a>;
            }
            // 외부 링크에만 파란색 스타일 적용
            if (href && !href.startsWith('#')) {
              return (
                <a 
                  href={href} 
                  className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200" 
                  {...props}
                >
                  {children}
                </a>
              );
            }
            // href가 없으면 기본 a 태그
            return <a {...props}>{children}</a>;
          },


        }}
      >
        {content}
      </ReactMarkdown>

      <style jsx global>{`
        pre {
          position: relative;
        }

        .copy-button {
          position: absolute;
          top: 0;
          right: 0;
          padding: 0.5rem 1rem;
          background-color: rgb(63, 63, 70);
          color: rgb(212, 212, 216);
          border: none;
          border-radius: 0 0 0 0.375rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .copy-button:hover {
          background-color: rgb(82, 82, 91);
        }

        .highlighted-line {
          background-color: rgba(200, 200, 255, 0.1);
          border-left: 2px solid #60a5fa;
          padding-left: 0.75rem;
          margin-left: -0.75rem;
        }

        .highlighted-word {
          background-color: rgba(200, 200, 255, 0.1);
          padding: 0.1rem 0.2rem;
          border-radius: 0.25rem;
        }
      `}</style>
    </article>
  );
}
