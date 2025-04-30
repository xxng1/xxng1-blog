import Link from 'next/link';
import { getPostsBySection, getAllTags, getPostsByTags } from '@/lib/posts';
import ClientTagFilter from '@/components/client-tag-filter';
import Image from 'next/image';
import { headers } from 'next/headers';

export default async function TechPage() {
  const headersList = await headers();
  const search = headersList.get('x-invoke-query') || '';
  const searchParams = new URLSearchParams(search);
  const tagParams = searchParams.getAll('tag');

  const filteredPosts = tagParams.length > 0
    ? getPostsByTags(tagParams).filter(post => post.section === 'dev')
    : getPostsBySection('dev');

  const allTags = getAllTags();

  return (



    
    <div className="space-y-8">


<div className="space-y-12">
  <section className="space-y-6">
    <Image 
      src="/paka.jpeg" 
      alt="Tech Blog Cover" 
      width={800} 
      height={400} 
      className="w-full max-w-lg mx-auto rounded-2xl"
    />
    <p style={{ textAlign: "center", color: "gray", fontStyle: "italic" }}>
      squirrel in Seattle
    </p>
  </section>
</div>


<div style={{ width: "100%", height: "0.8px", backgroundColor: "gray", margin: "15px auto" }}></div>



{/* <Image 
  src="/paka.jpeg" 
  alt="Tech Blog Cover" 
  width={800} 
  height={400} 
  className="w-full max-w-lg mx-auto rounded-2xl"
/>

<p style={{ textAlign: "center", color: "gray", fontStyle: "italic" }}>squirrel in Seattle</p> 

<div style={{ width: "100%", height: "0.8px", backgroundColor: "gray", margin: "15px auto" }}></div> */}


<section className="space-y-8">



      <div className="flex justify-between items-center">
        {/* <h1 className="text-3xl font-bold tracking-tight">개발</h1> */}
        <span className="text-zinc-500 dark:text-zinc-400 text-sm">
          총 {filteredPosts.length}개의 글
        </span>
      </div>
      
      <ClientTagFilter tags={allTags} baseUrl="/dev" />
      
      <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-1">
        {filteredPosts.map(({ id, date, title, excerpt, tags }) => (
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
                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
                Read More →
              </div>
            </article>
          </Link>
        ))}
      </div>
      </section>

    </div>
  );
}