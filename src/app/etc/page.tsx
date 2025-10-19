import Link from 'next/link';
import { getPostsBySection, getAllTags, getPostsByTags } from '@/lib/posts';
import ClientTagFilter from '@/components/client-tag-filter';
import Image from 'next/image';
import { headers } from 'next/headers';

export default async function DesignPage() {
  const headersList = await headers();
  const search = headersList.get('x-invoke-query') || '';
  const searchParams = new URLSearchParams(search);
  const tagParams = searchParams.getAll('tag');

  const filteredPosts = tagParams.length > 0
    ? getPostsByTags(tagParams).filter(post => post.section === 'etc')
    : getPostsBySection('etc');

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


      <section className="space-y-6 text-left mb-12">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
          <h2 className="text-4xl font-bold text-foreground mb-4">기타 ✨</h2>
          <p className="text-muted text-lg leading-relaxed">
            다양한 주제의 글들을 모았습니다
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {["일상", "생각", "경험", "리뷰", "기타"].map((tech) => (
              <span
                key={tech}
                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium border border-purple-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
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
          <h2 className="text-2xl font-bold text-foreground">기타 글</h2>
          <span className="text-muted-foreground text-sm bg-card-background px-3 py-1 rounded-full border border-card-border">
            총 {filteredPosts.length}개의 글
          </span>
        </div>

        <ClientTagFilter tags={allTags} baseUrl="/etc" />

        <div className="grid gap-6">
          {filteredPosts.map(({ id, date, title, excerpt, tags }) => (
            <Link key={id} href={`/posts/${id}`} className="block group">
              <article className="relative bg-card-background border border-card-border rounded-xl p-6 hover:shadow-lg hover:border-purple-300 transition-all duration-300 cursor-pointer group-hover:-translate-y-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <time className="text-sm text-muted-foreground">
                      {new Date(date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                    <div className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-purple-600 transition-colors leading-tight">
                    {title}
                  </h3>
                  <p className="text-muted leading-relaxed">{excerpt}</p>
                  {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <span key={tag} className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full border border-purple-200">
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
      </section>
    </div>
  );
}
