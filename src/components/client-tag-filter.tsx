'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface TagFilterProps {
  tags: { [tag: string]: number };
  baseUrl: string;
}

export default function ClientTagFilter({ tags, baseUrl }: TagFilterProps) {
  const searchParams = useSearchParams();
  const currentTags = searchParams.getAll('tag');
  
  // 태그 토글 함수 (URL 생성)
  const toggleTag = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // 이미 선택된 태그인 경우 제거, 아니면 추가
    if (currentTags.includes(tag)) {
      // 해당 태그 모두 제거
      const newParams = Array.from(params.entries())
        .filter(([key, value]) => !(key === 'tag' && value === tag))
        .reduce((acc, [key, value]) => {
          acc.append(key, value);
          return acc;
        }, new URLSearchParams());
      
      return `${baseUrl}?${newParams.toString()}`;
    } else {
      // 태그 추가
      params.append('tag', tag);
      return `${baseUrl}?${params.toString()}`;
    }
  };
  
  // 현재 페이지 번호 유지
  // const currentPage = searchParams.get('page') || '1';
  
  // 태그 정렬 (사용 빈도 순)
  const sortedTags = Object.entries(tags)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
  
  if (sortedTags.length === 0) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap gap-3 my-6">
      {sortedTags.map((tag) => (
        <Link
          key={tag}
          href={toggleTag(tag)}
          className={`px-4 py-2 text-sm rounded-full border transition-all duration-200 ${
            currentTags.includes(tag) 
              ? 'bg-accent text-white border-accent shadow-sm' 
              : 'bg-card-background text-muted border-card-border hover:border-accent/50 hover:text-accent hover:bg-accent/5'
          }`}
        >
          {tag} {tags[tag] > 0 && <span className="text-xs opacity-75">({tags[tag]})</span>}
        </Link>
      ))}
    </div>
  );
}