"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import { PORTFOLIO_PDF_BUTTON_CLASS } from "./portfolioPdfButtonClass";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const PDF_URL = "/portfolio.pdf";

/** pdf.js 기본 캔버스 배경은 white — 사이트 `--background`(#fafafa)와 동일하게 맞춤 */
const PAGE_CANVAS_BG = "#fafafa";

/** 전체 너비 PDF 위에 겹쳐 두되 클릭은 버튼만 받음 */
const ARROW_EDGE =
  "pointer-events-none absolute top-1/2 z-10 -translate-y-1/2";

const PAGE_CLASS =
  "portfolio-pdf-page mx-auto shadow-none [&_.react-pdf__Page__canvas]:mx-auto [&_.react-pdf__Page__canvas]:block";

type PortfolioPdfBodyProps = {
  numPages: number;
  currentPage: number;
  setCurrentPage: (p: number | ((n: number) => number)) => void;
};

function PortfolioPdfBody({
  numPages,
  currentPage,
  setCurrentPage,
}: PortfolioPdfBodyProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [areaWidth, setAreaWidth] = useState<number | null>(null);

  useEffect(() => {
    if (numPages === 0) return;
    const el = areaRef.current;
    if (!el) return;

    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setAreaWidth(Math.floor(w));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [numPages]);

  const pageIndices =
    numPages > 0 ? Array.from({ length: numPages }, (_, i) => i + 1) : [];

  return (
    <div
      ref={areaRef}
      className="relative w-full min-w-0 bg-background"
    >
      {currentPage > 1 ? (
        <div className={`${ARROW_EDGE} left-0 sm:left-1`}>
          <button
            type="button"
            className={`${PORTFOLIO_PDF_BUTTON_CLASS} pointer-events-auto`}
            aria-label="이전 페이지"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ←
          </button>
        </div>
      ) : null}

      <div className="flex w-full min-w-0 justify-center">
        {areaWidth != null &&
          pageIndices.map((pageNum) => (
            <div
              key={pageNum}
              className={
                pageNum === currentPage
                  ? "relative flex w-full justify-center overflow-x-auto bg-transparent"
                  : "hidden"
              }
              aria-hidden={pageNum !== currentPage}
            >
              <Page
                pageNumber={pageNum}
                width={areaWidth}
                canvasBackground={PAGE_CANVAS_BG}
                renderTextLayer
                renderAnnotationLayer
                loading={null}
                className={PAGE_CLASS}
              />
            </div>
          ))}
      </div>

      {numPages > 0 && currentPage < numPages ? (
        <div className={`${ARROW_EDGE} right-0 sm:right-1`}>
          <button
            type="button"
            className={`${PORTFOLIO_PDF_BUTTON_CLASS} pointer-events-auto`}
            aria-label="다음 페이지"
            onClick={() =>
              setCurrentPage((p) => Math.min(numPages, p + 1))
            }
          >
            →
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function PortfolioPdfViewer() {
  const [currentPage, setCurrentPage] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);

  const onLoadSuccess = useCallback(() => {
    setLoadError(null);
    setCurrentPage(1);
  }, []);

  const onLoadError = useCallback((e: Error) => {
    setLoadError(e.message);
  }, []);

  return (
    <div className="portfolio-pdf-root w-full space-y-6 bg-background">
      {loadError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          PDF를 불러오지 못했습니다: {loadError}
        </p>
      )}

      <Document
        file={PDF_URL}
        onLoadSuccess={onLoadSuccess}
        onLoadError={onLoadError}
        loading={null}
        className="w-full bg-background"
      >
        {(docRenderProps) => (
          <PortfolioPdfBody
            numPages={docRenderProps.pdf.numPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}
      </Document>
    </div>
  );
}
