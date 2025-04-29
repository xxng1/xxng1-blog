import { getPostsByCategory, getSortedPostsData, PostData } from '@/lib/posts';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params;
  const decodedCategory = decodeURIComponent(category);
  
  // 해당 카테고리에 속하는 게시물 가져오기
  const filteredPosts = getPostsByCategory(decodedCategory);
  
  // 카테고리가 존재하지 않으면 404 페이지로 리다이렉트
  if (filteredPosts.length === 0) {
    notFound();
  }
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">{decodedCategory} 카테고리</h1>
      <p className="text-zinc-500 dark:text-zinc-400">총 {filteredPosts.length}개의 게시물</p>
      
      <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-1">
        {filteredPosts.map(({ id, date, title, excerpt }) => (
          <Link key={id} href={`/posts/${id}`} className="block group">
            <article className="relative flex flex-col space-y-2 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition cursor-pointer">
              <div className="space-y-3">
                <time className="text-sm text-zinc-500 dark:text-zinc-400">
                  {new Date(date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <h3 className="text-xl font-bold group-hover:underline">
                  {title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">{excerpt}</p>
              </div>
              <div className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
                더 읽기 →
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}

// 정적 경로 생성을 위한 함수
export function generateStaticParams() {
  const allPosts = getSortedPostsData();
  const categories = new Set<string>();
  
  allPosts.forEach((post: PostData) => {
    if (post.categories) {
      post.categories.forEach((category: string) => {
        const parts = category.split('/');
        categories.add(parts[0].trim());
      });
    }
  });
  
  return Array.from(categories).map(category => ({
    category: encodeURIComponent(category),
  }));
}