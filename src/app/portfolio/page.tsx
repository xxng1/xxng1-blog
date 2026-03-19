import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Portfolio | xxng1",
  description: "Private portfolio page (link only).",
  robots: {
    index: false,
    follow: false,
  },
};

const PORTFOLIO_IMAGES = 9;
const imageSrc = (n: number) => `/portfolio/${n}.png`;

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
        <div className="w-full space-y-6">
          {Array.from({ length: PORTFOLIO_IMAGES }, (_, i) => (
            <div
              key={i + 1}
              className="relative w-full border border-card-border rounded-lg overflow-hidden bg-card-background"
            >
              <Image
                src={imageSrc(i + 1)}
                alt={`포트폴리오 ${i + 1}페이지`}
                width={1200}
                height={1697}
                className="w-full h-auto"
                unoptimized
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

