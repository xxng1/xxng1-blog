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
    // HTML에서 헤딩 요소들을 추출
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const tocItems: TOCItem[] = [];

    headings.forEach((heading) => {
      const id = heading.id;
      const text = heading.textContent || '';
      const level = parseInt(heading.tagName.charAt(1));

      if (id && text) {
        tocItems.push({ id, text, level });
      }
    });

    setToc(tocItems);
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
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
    handleScroll(); // 초기 실행

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
                ? 'text-emerald-600 bg-emerald-50 border-l-2 border-emerald-600'
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
