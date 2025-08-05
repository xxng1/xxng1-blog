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



{/* <div className="space-y-12">
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
</div> */}


{/* <div className="space-y-12">
  <section className="space-y-6">
    <Image 
      src="/paka.jpeg" 
      alt="Tech Blog Cover" 
      width={1200} 
      height={200} 
      className="w-full max-w-5xl h-[200px] object-cover mx-auto rounded-2xl"
    />
    <p style={{ textAlign: "center", color: "gray", fontStyle: "italic" }}>
      squirrel in Seattle
    </p>
  </section>
</div> */}


      {/* 블로그 소개 섹션 */}
      {/* <section className="space-y-4 text-left">
        <h2 className="text-3xl italic font-bold text-white">Hello woong!</h2>
        <p className="text-zinc-400 text-base">
          Focused on Infrastructure, DevOps
        </p>
        <Link
          href="https://github.com/xxng1/xxng1-blog"
          className="text-blue-400 underline hover:opacity-80"
          target="_blank"
          rel="noopener noreferrer"
        >
          블로그 소스코드 Github →
        </Link>
      </section> */}


      <section className="space-y-4 text-left">
  <h2 className="text-3xl italic font-bold text-white">hello woong!👋</h2>
  <p className="text-zinc-400 text-base">
    Focused on Cloud Infrastructure & DevOps
  </p>

  {/* 기술 태그 */}
  {/* <div className="flex flex-wrap gap-2">
    {["#AWS", "#Kubernetes", "#CI/CD"].map((tag) => (
      <span
        key={tag}
        className="bg-zinc-800 text-zinc-300 text-sm px-3 py-1 rounded-full"
      >
        {tag}
      </span>
    ))}
  </div> */}

  {/* <Link
    href="https://github.com/xxng1/xxng1-blog"
    className="text-blue-400 underline hover:opacity-80"
    target="_blank"
    rel="noopener noreferrer"
  >
    블로그 소스코드 Github →
  </Link> */}
</section>



      {/* <section className="space-y-4 text-left">
  <h2 className="text-3xl italic font-bold text-white">
    Cloud & DevOps Engineering 실험실
  </h2>
  <p className="text-zinc-400 text-base">
    Focused on Cloud, DevOps, and SRE.
  </p>
  <Link
    href="https://github.com/xxng1/xxng1-blog"
    className="text-blue-400 underline hover:opacity-80"
    target="_blank"
    rel="noopener noreferrer"
  >
    블로그 소스코드 GitHub →
  </Link>
</section> */}




<div style={{
  width: "100%",
  height: "1px", // 실제 border와 유사하게 조정
  backgroundColor: "#3f3f46", // Tailwind의 zinc-700 → #3f3f46
  opacity: 0.5,
  marginBottom: "1rem" // mb-4 → 1rem
}}></div>











      {/* <section className="space-y-6"> */}
        
        {/* <h2 className="text-4xl font-semi-bold text-gray-300 tracking-tight sm:text-5xl">
          웅이
        </h2>
        
        <p className="text-xl text-zinc-600 dark:text-zinc-400">
          No Silver Bullet
        </p> */}


{/* <Link href="/about" className="text-xl font-bold italic text-gray-400 tracking-tight hover:text-zinc-400 transition">
  ✏️ About ME
</Link> */}

{/* <Link
  href="/about"
  className="text-xl font-bold italic text-gray-400 tracking-tight hover:text-zinc-400 transition border-2 border-gray-400 rounded-lg px-4 py-2 hover:border-zinc-400"
> About  Me →
</Link> */}

{/* <Link
  href="/about"
  className="text-xl font-bold text-gray-300 tracking-tight hover:text-zinc-400 transition border-1 border-gray-300 rounded-lg px-3 py-2 hover:border-zinc-400"
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
          <span className="text-zinc-400 text-sm">
            총 {filteredPosts.length}개의 글
          </span>
        </div>

        <ClientTagFilter tags={allTags} baseUrl="/dev" />

        <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-1">
          {filteredPosts.map(({ id, date, title, excerpt, tags }) => (
            <Link key={id} href={`/posts/${id}`} className="block group">
              <article className="relative flex flex-col space-y-2 border border-zinc-800 rounded-lg p-6 hover:bg-zinc-800/50 transition cursor-pointer">
                <div className="space-y-3">
                  <time className="text-sm text-zinc-400">
                    {new Date(date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <h3 className="text-xl font-bold group-hover:underline">
                    {title}
                  </h3>
                  <p className="text-zinc-400">{excerpt}</p>
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
                <div className="mt-4 text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition">
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
