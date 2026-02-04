import Link from 'next/link';
import { getSortedPostsData, getAllTags, getPostData } from '@/lib/posts';
import HomePostsSection from '@/components/home-posts-section';
import { Suspense } from 'react';

export default async function Home() {
  const allPostsData = getSortedPostsData();
  const allTags = getAllTags();

  const allPosts = allPostsData.map(({ id, date, title, excerpt, tags, githubUrl }) => ({
    id,
    date,
    title,
    excerpt,
    tags,
    githubUrl,
  }));

  const featuredPostIds = [
    '14-terraform-backend-migration',
    '11-nlb-on-website',
    '13-gitlab-nginx-bluegreen',
  ];
  const featuredPosts = await Promise.all(
    featuredPostIds.map((id) => getPostData(id))
  );

  return (
    <div className="space-y-8">
      <section className="space-y-6 mb-12">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              hello woong! 👋
            </h2>
            <p className="text-muted text-lg leading-relaxed">
              Focused on Cloud Native & DevOps
            </p>
          </div>

          <div className="w-full">
            <h2 className="text-2xl font-bold text-foreground mb-4">TOP 3</h2>
            <div className="flex flex-col gap-2">
              {featuredPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block group"
                >
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

      <hr className="border-0 h-px bg-[#dfe1e6] rounded-full" />

      <Suspense fallback={<div className="text-muted">로딩 중...</div>}>
        <HomePostsSection allPosts={allPosts} allTags={allTags} />
      </Suspense>
    </div>
  );
}
