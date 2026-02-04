'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import ClientTagFilter from '@/components/client-tag-filter';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { BsGithub } from 'react-icons/bs';

export interface PostListItem {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  tags?: string[];
  githubUrl?: string;
}

interface HomePostsSectionProps {
  allPosts: PostListItem[];
  allTags: { [tag: string]: number };
}

const POSTS_PER_PAGE = 5;

export default function HomePostsSection({ allPosts, allTags }: HomePostsSectionProps) {
  const searchParams = useSearchParams();
  const tagParams = searchParams.getAll('tag');
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const filteredPosts = useMemo(() => {
    if (tagParams.length === 0) return allPosts;
    return allPosts.filter(
      (post) => post.tags && post.tags.some((tag) => tagParams.includes(tag))
    );
  }, [allPosts, tagParams]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    const q = params.toString();
    return q ? `/?${q}` : '/';
  };

  return (
    <section className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">
          {tagParams.length > 0
            ? `태그가 포함된 글 (${filteredPosts.length}개)`
            : '전체 글'}
        </h2>
        <span className="text-muted-foreground text-sm bg-card-background px-3 py-1 rounded-full border border-card-border">
          총 {allPosts.length}개의 글
        </span>
      </div>

      <ClientTagFilter tags={allTags} baseUrl="/" />

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p>선택한 태그에 해당하는 글이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {paginatedPosts.map(({ id, date, title, excerpt, tags, githubUrl }) => (
              <Link key={id} href={`/posts/${id}`} className="block group">
                <article className="relative bg-card-background border border-card-border rounded-xl p-6 hover:shadow-lg hover:border-accent/30 transition-all duration-300 cursor-pointer group-hover:-translate-y-1">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <time className="text-sm text-muted-foreground">
                        {new Date(date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                      <div className="flex items-center gap-2">
                        {githubUrl && (
                          <span
                            title="실습 레포지토리 있음"
                            className="flex-shrink-0"
                          >
                            <BsGithub
                              size={18}
                              className="text-muted-foreground"
                              aria-hidden
                            />
                          </span>
                        )}
                        <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors leading-tight">
                      {title}
                    </h3>
                    <p className="text-muted leading-relaxed">{excerpt}</p>
                    {tags && tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-3 py-1 bg-accent/10 text-accent rounded-full border border-accent/20"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {safePage > 1 ? (
                <Link
                  href={buildPageUrl(safePage - 1)}
                  className="flex items-center justify-center w-8 h-8 text-foreground hover:text-accent transition-colors"
                >
                  <FaChevronLeft size={14} />
                </Link>
              ) : (
                <span className="flex items-center justify-center w-8 h-8 text-muted-foreground opacity-50">
                  <FaChevronLeft size={14} />
                </span>
              )}

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= safePage - 2 && page <= safePage + 2)
                  ) {
                    return (
                      <Link
                        key={page}
                        href={buildPageUrl(page)}
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors ${
                          page === safePage
                            ? 'bg-gray-200 text-gray-800 font-medium'
                            : 'text-foreground hover:text-accent'
                        }`}
                      >
                        {page}
                      </Link>
                    );
                  }
                  if (page === safePage - 3 || page === safePage + 3) {
                    return (
                      <span key={page} className="px-2 text-muted">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              {safePage < totalPages ? (
                <Link
                  href={buildPageUrl(safePage + 1)}
                  className="flex items-center justify-center w-8 h-8 text-foreground hover:text-accent transition-colors"
                >
                  <FaChevronRight size={14} />
                </Link>
              ) : (
                <span className="flex items-center justify-center w-8 h-8 text-muted-foreground opacity-50">
                  <FaChevronRight size={14} />
                </span>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
