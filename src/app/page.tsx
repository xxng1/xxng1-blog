import Link from 'next/link';
import { getSortedPostsData, getAllTags, getPostsByTags } from '@/lib/posts';
import ClientTagFilter from '@/components/client-tag-filter';
import { Suspense } from 'react';

interface HomeProps {
  searchParams: Promise<{ tag?: string | string[] }>;
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
  
  return (
    <div className="space-y-8">
      {/* Hero Section with About Me Button */}
      <section className="space-y-6 text-left mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-2">hello woong! 👋</h2>
            <p className="text-muted text-lg leading-relaxed">
              Cloud Infrastructure & DevOps에 집중하는 개발자입니다
            </p>
          </div>
          {/* <Link
            href="/about"
            className="px-6 py-3 bg-accent/10 text-accent rounded-lg font-medium border border-accent/20 hover:bg-accent/20 transition-colors"
          >
            About Me
          </Link> */}
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="space-y-8">
        {/* <hr className="border-t border-card-border" /> */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">
            {tagParams.length > 0 ? `필터된 글 (${filteredPosts.length}개)` : '전체 글'}
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
          <div className="grid gap-6">
            {filteredPosts.map(({ id, date, title, excerpt, tags }) => (
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
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
