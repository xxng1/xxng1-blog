import type { Metadata } from "next";
import PortfolioPdfViewerLoader from "./PortfolioPdfViewerLoader";
import { PORTFOLIO_PDF_BUTTON_CLASS } from "./portfolioPdfButtonClass";

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
            className={PORTFOLIO_PDF_BUTTON_CLASS}
          >
            포트폴리오 PDF 열기
          </a>
        </div>
        <PortfolioPdfViewerLoader />
      </section>
    </div>
  );
}

