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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <a
            href="/portfolio.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-accent-bg text-gray-600 border border-accent/20"
          >
            포트폴리오 PDF 열기 / 다운로드
          </a>
        </div>
        <div className="w-full border border-card-border rounded-lg overflow-hidden bg-card-background">
          <iframe
            src="/portfolio.pdf#zoom=55"
            className="w-full h-[min(90vh,960px)]"
            title="Portfolio PDF"
          />
        </div>
      </section>
    </div>
  );
}

