'use client';

import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import TableOfContents from '@/components/table-of-contents';
import { BsGithub } from "react-icons/bs";

interface PostContentProps {
  title: string;
  date: string;
  excerpt: string;
  content: string;
  tags?: string[];
  githubUrl?: string;
}

export default function PostContent({ title, date, excerpt, content, tags, githubUrl }: PostContentProps) {
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
        border-radius: 0.75rem;
        overflow: hidden;
        margin: 2rem 0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }

      .copy-button {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
        line-height: 1;
        background-color: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 500;
        z-index: 1;
      }

      .copy-button:hover {
        background-color: rgba(59, 130, 246, 0.2);
        color: #2563eb;
        border-color: rgba(59, 130, 246, 0.3);
      }

      pre code {
        display: block;
        padding: 1.5rem;
        overflow-x: auto;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 0.875rem;
        line-height: 1.6;
        color: #374151;
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
    <>
      <TableOfContents content={content} />
      <article className="prose prose-slate mx-auto max-w-3xl [&>*]:my-6">
        <header className="mb-12 not-prose">
          <div className="bg-card-background border border-card-border rounded-2xl p-8 shadow-sm mb-8">
            <time className="text-sm text-muted-foreground">
              {new Date(date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {tags && tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 border border-card-border rounded-full text-muted-foreground bg-transparent"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
              {title}
            </h1>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              {excerpt}
            </p>
            {githubUrl && (
              <div className="mt-4 flex justify-end">
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center group relative !text-foreground hover:!text-foreground"
                  aria-label="GitHub Source Code"
                  title="실습에 사용한 개인 Github Repository"
                >
                  <BsGithub size={24} className="text-foreground" />
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 text-xs text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    실습에 사용한 개인 Github Repository
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                  </span>
                </a>
              </div>
            )}
          </div>
        </header>

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSlug
        ]}
        components={{
          code({ node, className, children, ...props }: any) {
            const isInline = !className || !className.includes('language-');

            if (isInline) {
              return (
                <code
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-sm px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <code className={`${className} text-sm md:text-base leading-relaxed`} {...props}>
                {children}
              </code>
            );
          },

          pre({ children, ...props }: any) {
            return (
              <pre className="overflow-auto my-12 p-5 md:p-6 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 relative shadow-lg" {...props}>
                {children}
              </pre>
            );
          },

          h1({ children, ...props }: any) {
            return (
              <div>
                <h1 {...props} className="text-3xl font-bold mt-16 mb-6 text-foreground leading-tight">{children}</h1>
                <hr className="border-t border-card-border mb-8 mt-6" />
              </div>
            );
          },
          h2({ children, ...props }: any) {
            return <h2 {...props} className="text-2xl font-bold mt-12 mb-5 text-foreground leading-tight pt-2">{children}</h2>;
          },
          h3({ children, ...props }: any) {
            return <h3 {...props} className="text-xl font-bold mt-10 mb-4 text-foreground leading-tight pt-1">{children}</h3>;
          },
          h4({ children, ...props }: any) {
            return <h4 {...props} className="text-lg font-bold mt-8 mb-3 text-foreground leading-tight">{children}</h4>;
          },
          h5({ children, ...props }: any) {
            return <h5 {...props} className="text-base font-bold mt-6 mb-2 text-foreground leading-tight">{children}</h5>;
          },
          h6({ children, ...props }: any) {
            return <h6 {...props} className="text-sm font-bold mt-4 mb-2 text-foreground leading-tight">{children}</h6>;
          },
          p({ children, ...props }: any) {
            return <p className="my-7 leading-8 text-foreground text-base md:text-lg">{children}</p>;
          },
          ul({ children, ...props }: any) {
            return <ul className="my-7 list-disc pl-7 space-y-3">{children}</ul>;
          },
          ol({ children, ...props }: any) {
            return <ol className="my-7 list-decimal pl-7 space-y-3">{children}</ol>;
          },
          li({ children, ...props }: any) {
            return <li className="text-foreground leading-7 text-base md:text-lg">{children}</li>;
          },
          blockquote({ children, ...props }: any) {
            return (
              <blockquote className="border-l border-card-border/60 pl-3 py-1.5 my-6 bg-card-background rounded text-foreground leading-relaxed text-base md:text-lg">
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
                className="w-full h-auto object-contain rounded-lg block mx-auto my-12"
              />
            );
          },

          em({ children, ...props }: any) {
            return (
              <em className="italic text-muted" {...props}>
                {children}
              </em>
            );
          },
          strong({ children, ...props }: any) {
            return (
              <strong className="font-bold text-foreground" {...props}>
                {children}
              </strong>
            );
          },
          hr(props: any) {
            return <hr className="border-t border-card-border my-10" />;
          },
          table({ children, ...props }: any) {
            return (
              <div className="overflow-x-auto my-12">
                <table className="min-w-full border border-card-border rounded-lg shadow-sm" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          thead({ children, ...props }: any) {
            return <thead className="bg-accent/5" {...props}>{children}</thead>;
          },
          tbody({ children, ...props }: any) {
            return <tbody className="divide-y divide-card-border" {...props}>{children}</tbody>;
          },
          tr({ children, ...props }: any) {
            return <tr className="border-b border-card-border hover:bg-accent/5" {...props}>{children}</tr>;
          },
          th({ children, ...props }: any) {
            return <th className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wider" {...props}>{children}</th>;
          },
          td({ children, ...props }: any) {
            return <td className="px-6 py-4 text-sm text-muted" {...props}>{children}</td>;
          },

          a({ children, href, ...props }: any) {
            // 헤딩 안의 자동 생성된 앵커 링크는 기본 스타일 유지
            if (href && href.startsWith('#')) {
              return <a href={href} {...props}>{children}</a>;
            }
            // 외부 링크에만 초록색 스타일 적용
            if (href && !href.startsWith('#')) {
              return (
                <a 
                  href={href} 
                  className="text-emerald-600 hover:text-emerald-700 underline transition-colors duration-200" 
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
      </article>

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
          z-index: 1;
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
    </>
  );
}
