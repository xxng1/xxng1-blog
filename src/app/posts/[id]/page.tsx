import { getAllPostIds, getPostData } from "@/lib/posts";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import PostContent from "./PostContent";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

// 게시글 페이지 컴포넌트
export default async function Post({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const postData = await getPostData(id);
    return <PostContent title={postData.title} date={postData.date} excerpt={postData.excerpt} content={postData.content} tags={postData.tags} githubUrl={postData.githubUrl} />;
  } catch {
    notFound();
  }
}

// 메타데이터 생성
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
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

// 정적 경로 생성 (App Router 형식: { id: string }[])
export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths.map((p) => p.params);
}