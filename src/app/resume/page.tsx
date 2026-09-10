import type { Metadata } from "next";
import PortfolioPdfViewerLoader from "../portfolio/PortfolioPdfViewerLoader";
import { PORTFOLIO_PDF_BUTTON_CLASS } from "../portfolio/portfolioPdfButtonClass";

export const metadata: Metadata = {
  title: "Resume | xxng1",
  description: "Private resume page (link only).",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResumePage() {
  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Resume</h1>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={PORTFOLIO_PDF_BUTTON_CLASS}
          >
            이력서 PDF 열기
          </a>
        </div>
        <PortfolioPdfViewerLoader file="/resume.pdf" documentLabel="이력서" />
      </section>
    </div>
  );
}
