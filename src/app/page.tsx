import Link from 'next/link';
import { getSortedPostsData, getAllTags, getPostsByTags, getPostData } from '@/lib/posts';
import ClientTagFilter from '@/components/client-tag-filter';
import { Suspense } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface HomeProps {
  searchParams: Promise<{ tag?: string | string[]; page?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const allPostsData = getSortedPostsData();
  const allTags = getAllTags();
  
  // 태그 필터링
  const tagParams = params.tag 
    ? (Array.isArray(params.tag) ? params.tag : [params.tag])
    : [];
  
  const filteredPosts = tagParams.length > 0
    ? getPostsByTags(tagParams)
    : allPostsData;
  
  // 페이지네이션
  const postsPerPage = 5;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
  
  // TOP 3 추천 글 (14번, 11번, 13번 순서)
  const featuredPostIds = ['14-terraform-backend-migration', '11-nlb-on-website', '13-gitlab-nginx-bluegreen'];
  const featuredPosts = await Promise.all(
    featuredPostIds.map(id => getPostData(id))
  );
  
  return (
    <div className="space-y-8">
      {/* Hero Section with TOP 3 */}
      <section className="space-y-6 mb-12">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-foreground mb-2">hello woong! 👋</h2>
            <p className="text-muted text-lg leading-relaxed">
              Focused on Cloud Native & DevOps
            </p>
          </div>
          
          {/* TOP 3 추천 글 섹션 - 세로 배치 */}
          <div className="w-full">
            <h2 className="text-2xl font-bold text-foreground mb-4">TOP 3</h2>
            <div className="flex flex-col gap-2">
              {featuredPosts.map((post, index) => (
                <Link key={post.id} href={`/posts/${post.id}`} className="block group">
                  <div className="bg-card-background border border-card-border rounded-lg p-3 hover:border-accent/30 transition-colors">
                    <div className="flex items-center gap-3 text-sm text-foreground hover:text-accent transition-colors overflow-hidden">
                      <span className="text-base font-bold">{index + 1}</span>
                      <span className="flex-1 truncate">{post.title}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Separator - Confluence style */}
      <hr className="border-0 h-px bg-[#dfe1e6] rounded-full" />

      {/* Blog Posts Section */}
      <section className="space-y-8">
        {/* <hr className="border-t border-card-border" /> */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">
            {tagParams.length > 0 ? `태그가 포함된 글 (${filteredPosts.length}개)` : '전체 글'}
          </h2>
          <span className="text-muted-foreground text-sm bg-card-background px-3 py-1 rounded-full border border-card-border">
            총 {allPostsData.length}개의 글
          </span>
        </div>
        
        <Suspense fallback={<div className="text-muted">태그 로딩 중...</div>}>
          <ClientTagFilter tags={allTags} baseUrl="/" />
        </Suspense>
        
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <p>선택한 태그에 해당하는 글이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {paginatedPosts.map(({ id, date, title, excerpt, tags }) => (
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
                        <div className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors leading-tight">
                        {title}
                      </h3>
                      <p className="text-muted leading-relaxed">{excerpt}</p>
                      {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map(tag => (
                            <span key={tag} className="text-xs px-3 py-1 bg-accent/10 text-accent rounded-full border border-accent/20">
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
            
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {currentPage > 1 ? (
                  <Link
                    href={`/?${tagParams.length > 0 ? `tag=${Array.isArray(tagParams) ? tagParams.join('&tag=') : tagParams}&` : ''}page=${currentPage - 1}`}
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
                    // 현재 페이지 주변 2페이지씩만 표시
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      const tagQuery = tagParams.length > 0 
                        ? `tag=${Array.isArray(tagParams) ? tagParams.join('&tag=') : tagParams}&` 
                        : '';
                      return (
                        <Link
                          key={page}
                          href={`/?${tagQuery}page=${page}`}
                          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors ${
                            page === currentPage
                              ? 'bg-gray-200 text-gray-800 font-medium'
                              : 'text-foreground hover:text-accent'
                          }`}
                        >
                          {page}
                        </Link>
                      );
                    } else if (
                      page === currentPage - 3 ||
                      page === currentPage + 3
                    ) {
                      return (
                        <span key={page} className="px-2 text-muted">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                
                {currentPage < totalPages ? (
                  <Link
                    href={`/?${tagParams.length > 0 ? `tag=${Array.isArray(tagParams) ? tagParams.join('&tag=') : tagParams}&` : ''}page=${currentPage + 1}`}
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
    </div>
  );
}
