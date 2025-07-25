'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
// 코드 하이라이팅을 위한 highlight.js 사용
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

interface PostContentProps {
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

export default function PostContent({ title, date, excerpt, content }: PostContentProps) {
  // highlight.js를 사용하여 코드 하이라이팅 적용
  useEffect(() => {
    // highlight.js 초기화 및 코드 블록 하이라이팅 적용
    hljs.configure({
      languages: ['javascript', 'typescript', 'python', 'java', 'bash', 'json', 'html', 'css', 'xml', 'yaml', 'markdown']
    });
    
    // 페이지 로드 후 코드 블록 하이라이팅 적용
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [content]);
  
  // 코드 블록 하이라이팅 및 복사 기능을 위한 이벤트 리스너
  useEffect(() => {
    const setupCodeBlocks = () => {
      const codeBlocks = document.querySelectorAll('pre');
      
      codeBlocks.forEach((codeBlock) => {
        // 코드 블록 하이라이팅 적용
        const codeElement = codeBlock.querySelector('code');
        if (codeElement) {
          hljs.highlightElement(codeElement as HTMLElement);
        }
        
        // 이미 버튼이 있는지 확인
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
    
    // 마크다운 렌더링 후 코드 블록에 하이라이팅 및 복사 버튼 추가
    // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 실행
    setTimeout(() => {
      setupCodeBlocks();
    }, 100);
    
    // MutationObserver를 사용하여 동적으로 추가되는 코드 블록에도 하이라이팅 및 복사 버튼 추가
    const observer = new MutationObserver((mutations) => {
      let hasCodeChanges = false;
      
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'PRE' || 
                (node.nodeType === 1 && (node as Element).querySelector('pre'))) {
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
  
  // 코드 블록 스타일링을 위한 CSS
  useEffect(() => {
    // 기존 스타일 요소가 있는지 확인
    const existingStyle = document.getElementById('code-block-styles');
    if (existingStyle) return;
    
    // 스타일 요소 생성
    const styleElement = document.createElement('style');
    styleElement.id = 'code-block-styles';
    styleElement.textContent = `
      /* 코드 블록 스타일링 */
      pre {
        position: relative;
        border-radius: 0.5rem;
        overflow: hidden;
        margin: 1.5rem 0;
      }
      
      /* 복사 버튼 스타일링 */
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
      
      /* 코드 블록 내부 스타일링 */
      pre code {
        display: block;
        padding: 1rem;
        overflow-x: auto;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 0.875rem;
        line-height: 1.5;
      }
    `;
    
    // 스타일 요소를 head에 추가
    document.head.appendChild(styleElement);
    
    // 컴포넌트 언마운트 시 스타일 요소 제거
    return () => {
      const styleToRemove = document.getElementById('code-block-styles');
      if (styleToRemove) {
        document.head.removeChild(styleToRemove);
      }
    };
  }, []);
  
  return (
    <article className="prose prose-invert mx-auto">
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
          // 인라인 코드 스타일링
          code({ node, className, children, ...props }: any) {
            // className에서 인라인 코드인지 확인
             const isInline = !className || !className.includes('language-');
             
             if (isInline) {
               return (
                 <code
                   className="bg-zinc-700 text-amber-400 font-mono text-sm px-1.5 py-1 rounded"
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
          // 코드 블록 컨테이너 스타일링
          pre({ children, ...props }: any) {
            return (
              <pre 
                className="overflow-auto my-6 p-4 rounded-lg bg-zinc-900 border border-zinc-700 relative"
                {...props}
              >
                {children}
              </pre>
            );
          },
          // 헤더 스타일링
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
          // 단락 스타일링
          p({ children, ...props }: any) {
            return <p className="my-4 mt-6 mb-4">{children}</p>;
          },
          // 리스트 스타일링
          ul({ children, ...props }: any) {
            return <ul className="my-4 mt-6 mb-4 list-disc pl-6">{children}</ul>;
          },
          ol({ children, ...props }: any) {
            return <ol className="my-4 mt-6 mb-4 list-decimal pl-6">{children}</ol>;
          },
          li({ children, ...props }: any) {
            return <li className="my-1">{children}</li>;
          },
          // 인용구 스타일링
          blockquote({ children, ...props }: any) {
            return (
              <blockquote 
                className="border-l-6 border-zinc-700 pl-4 italic my-4 bg-zinc-800 p-2 rounded-lg flex items-center"
              >
                {children}
              </blockquote>
            );
          },
          // 이미지 스타일링
          img({ src, alt, ...props }: any) {
            return (
              <img
                src={src || ""}
                alt={alt || ""}
                className="w-[650px] h-[66%] object-cover rounded-lg block mx-auto mt-4 mb-4"
              />
            );
          },
          // 강조 텍스트 스타일링
          em({ children, ...props }: any) {
            return (
              <strong className="font-semibold">
                <span className="bg-gray-600 p-1 rounded">{children}</span>
              </strong>
            );
          },
          // 구분선 스타일링
          hr(props: any) {
            return <hr className="border-t border-zinc-400 my-8 opacity-50" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {/* 코드 블록 복사 버튼 스타일 */}
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