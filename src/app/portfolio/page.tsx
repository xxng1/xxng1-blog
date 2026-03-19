import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio | xxng1",
  description: "Private portfolio page (link only).",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
        <div className="w-full border border-card-border rounded-lg overflow-hidden bg-card-background">
          <iframe
            src="/portfolio.pdf#zoom=55"
            className="w-full h-[min(90vh,960px)]"
            title="Portfolio PDF"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          PDF가 브라우저에서 바로 보이지 않는 경우, 아래 링크를 사용해서 파일을 직접 다운로드해서 열어주세요.
        </p>
        <a
          href="/portfolio.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 rounded-md bg-accent text-sm font-medium text-white hover:opacity-90 transition-colors"
        >
          포트폴리오 PDF 열기 / 다운로드
        </a>
      </section>
    </div>
  );
}

