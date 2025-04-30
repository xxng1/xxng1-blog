import Link from 'next/link';
import { getSortedPostsData, getAllTags } from '@/lib/posts';
import Image from 'next/image';
import ClientTagFilter from '@/components/client-tag-filter';
// import { Suspense } from 'react';


export default function Home() {
  const allPostsData = getSortedPostsData();
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










      {/* <section className="space-y-6"> */}
        
        {/* <h2 className="text-4xl font-semi-bold text-gray-300 tracking-tight sm:text-5xl">
          웅이
        </h2>
        
        <p className="text-xl text-zinc-600 dark:text-zinc-400">
          No Silver Bullet
        </p> */}


{/* <Link href="/about" className="text-xl font-bold italic text-gray-400 tracking-tight hover:text-zinc-600 dark:hover:text-zinc-400 transition">
  ✏️ About ME
</Link> */}

{/* <Link
  href="/about"
  className="text-xl font-bold italic text-gray-400 tracking-tight hover:text-zinc-600 dark:hover:text-zinc-400 transition border-2 border-gray-400 rounded-lg px-4 py-2 hover:border-zinc-600 dark:hover:border-zinc-400"
> About  Me →
</Link> */}

{/* <Link
  href="/about"
  className="text-xl font-bold text-gray-300 tracking-tight hover:text-zinc-600 dark:hover:text-zinc-400 transition border-1 border-gray-300 rounded-lg px-3 py-2 hover:border-zinc-600 dark:hover:border-zinc-400"
> About
</Link> */}


{/* <Image 
  src="/paka.jpeg" 
  alt="Tech Blog Cover" 
  width={800} 
  height={400} 
  className="w-full max-w-lg mx-auto rounded-2xl"
/>

<p style={{ textAlign: "center", color: "gray", fontStyle: "italic" }}>squirrel in Seattle</p> 




      </section> */}


      {/* <div style={{ width: "100%", height: "0.8px", backgroundColor: "gray", margin: "15px auto" }}></div> */}
      

      <section className="space-y-8">
        <div className="flex justify-between items-center">
          {/* <h2 className="text-2xl font-bold tracking-tight">전체 글</h2> */}
          <span className="text-zinc-500 dark:text-zinc-400 text-sm">
            총 {allPostsData.length}개의 글
          </span>
        </div>
        
        <ClientTagFilter tags={allTags} baseUrl="/" />
        
        <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-1">
          {allPostsData.map(({ id, date, title, excerpt, tags }) => (
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
