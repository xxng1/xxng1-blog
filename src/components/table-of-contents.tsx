'use client';

import { useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // 마크다운이 렌더링된 후 헤딩을 찾도록 약간의 지연을 둠
    const updateTOC = () => {
      // article 요소 내부의 헤딩만 찾음 (prose 클래스 안의 헤딩)
      const article = document.querySelector('article.prose');
      if (!article) {
        // article이 아직 없으면 다시 시도
        setTimeout(updateTOC, 100);
        return;
      }

      const headings = article.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const tocItems: TOCItem[] = [];

      headings.forEach((heading) => {
        let id = heading.id;
        
        // ID가 없으면 rehypeSlug가 생성한 ID를 기다리거나 수동으로 생성
        if (!id) {
          const text = heading.textContent || '';
          // 간단한 slug 생성 (한글도 처리)
          id = text
            .toLowerCase()
            .replace(/[^\w\s-가-힣]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
          
          // ID가 여전히 없으면 스킵
          if (!id) return;
          
          // ID를 요소에 할당
          heading.id = id;
        }
        
        const text = heading.textContent || '';
        const level = parseInt(heading.tagName.charAt(1));

        if (id && text) {
          tocItems.push({ id, text, level });
        }
      });

      setToc(tocItems);
    };

    // 초기 실행 - 여러 번 시도
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryUpdate = () => {
      updateTOC();
      attempts++;
      
      if (attempts < maxAttempts) {
        setTimeout(tryUpdate, 200);
      }
    };

    const timer = setTimeout(tryUpdate, 100);

    // MutationObserver로 DOM 변경 감지
    const observer = new MutationObserver(() => {
      updateTOC();
    });

    // article이 있을 때만 observe
    const checkAndObserve = () => {
      const article = document.querySelector('article.prose');
      if (article) {
        observer.observe(article, {
          childList: true,
          subtree: true,
        });
      } else {
        setTimeout(checkAndObserve, 100);
      }
    };
    
    checkAndObserve();

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('article.prose');
      if (!article) return;

      const headings = article.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let current = '';

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          current = heading.id;
        }
      });

      setActiveId(current);
    };

    window.addEventListener('scroll', handleScroll);
    
    // 초기 실행도 약간의 지연을 두어 DOM이 렌더링된 후 실행
    const timer = setTimeout(handleScroll, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [content]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 100; // 헤더 높이만큼 오프셋
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  if (toc.length === 0) return null;

  return (
    <div className="fixed right-8 top-1/2 transform -translate-y-1/2 w-64 max-h-96 overflow-y-auto bg-card-background border border-card-border rounded-lg shadow-lg p-4 z-20 hidden xl:block">
      <h3 className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-card-border">
        목차
      </h3>
      <nav className="space-y-1">
        {toc.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToHeading(item.id)}
            className={`block w-full text-left text-sm py-1 px-2 rounded transition-colors ${
              activeId === item.id
                ? 'text-foreground bg-gray-100 border-l-2 border-gray-400'
                : 'text-muted hover:text-foreground hover:bg-gray-50'
            }`}
            style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
          >
            {item.text}
          </button>
        ))}
      </nav>
    </div>
  );
}
