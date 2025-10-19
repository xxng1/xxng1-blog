import Link from 'next/link';
import { getSortedPostsData, getAllTags } from '@/lib/posts';
import Image from 'next/image';
import ClientTagFilter from '@/components/client-tag-filter';
import { Suspense } from 'react';

// import { FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";


export default function Home() {
  const allPostsData = getSortedPostsData();
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
        <div className="bg-gradient-to-r from-accent/10 to-accent-hover/10 rounded-2xl p-8 border border-accent/20">
          <h2 className="text-4xl font-bold text-foreground mb-4">hello woong! 👋</h2>
          <p className="text-muted text-lg leading-relaxed">
            Cloud Infrastructure & DevOps에 집중하는 개발자입니다
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {["AWS", "Kubernetes", "Docker", "CI/CD", "Terraform"].map((tech) => (
              <span
                key={tech}
                className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium border border-accent/20"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

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
          <h2 className="text-2xl font-bold text-foreground">전체 글</h2>
          <span className="text-muted-foreground text-sm bg-card-background px-3 py-1 rounded-full border border-card-border">
            총 {allPostsData.length}개의 글
          </span>
        </div>
        
        <Suspense fallback={<div className="text-muted">태그 로딩 중...</div>}>
          <ClientTagFilter tags={allTags} baseUrl="/" />
        </Suspense>
        
        <div className="grid gap-6">
          {allPostsData.map(({ id, date, title, excerpt, tags }) => (
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
      </section>
    </div>
  );
}
