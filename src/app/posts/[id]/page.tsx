import { getAllPostIds, getPostData } from "@/lib/posts";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

// 메타데이터 생성
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params; // 🔹 params를 await 처리
  try {
    const postData = await getPostData(id);
    return {
      title: postData.title,
      description: postData.excerpt,
    };
  } catch {
    return {
      title: "Post Not Found",
      description: "The requested post could not be found.",
    };
  }
}

// 정적 경로 생성
export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths;
}

// 게시글 페이지 컴포넌트
export default async function Post({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // 🔹 params를 await 처리
  try {
    const postData = await getPostData(id);

    return (
      <article className="prose prose-zinc dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <time className="text-sm text-zinc-500 dark:text-zinc-400">
            {new Date(postData.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {postData.title}
          </h1>
          <p className="mt-3 text-xl text-zinc-600 dark:text-zinc-400">
            {postData.excerpt}
          </p>
        </header>

        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            code({ children, className, ...rest }) {
              return (
                <code className={className} {...rest}>
                  {children}
                </code>
              );
            },
            pre({ children }) {
              return <pre className="overflow-auto p-4 rounded bg-zinc-100 dark:bg-zinc-800">{children}</pre>;
            },
            h1({ children }) {
              return <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>;
            },
            h2({ children }) {
              return <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>;
            },
            h3({ children }) {
              return <h3 className="text-xl font-bold mt-6 mb-4">{children}</h3>;
            },
            p({ children }) {
              return <p className="my-4">{children}</p>;
            },
            ul({ children }) {
              return <ul className="my-4 list-disc pl-6">{children}</ul>;
            },
            ol({ children }) {
              return <ol className="my-4 list-decimal pl-6">{children}</ol>;
            },
            li({ children }) {
              return <li className="my-1">{children}</li>;
            },
            blockquote({ children }) {
              return <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 italic my-4">{children}</blockquote>;
            },

            // ✅ 이미지 크기 조절 추가
            img({ src, alt }) {
              return (
                <img
                src={src || ""}
                alt={alt || ""}
                className="w-[650px] h-[66%] object-cover rounded-lg block mx-auto"
                />
              );
            },

          }}
        >
          {postData.content}
        </ReactMarkdown>
      </article>
    );
  } catch {
    notFound();
  }
}