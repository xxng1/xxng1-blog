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

/** <1800px: PDF 위에 겹침(버튼만 클릭). ≥1800px: 동일 클래스에 static 오버라이드로 flex 열에 아이템으로 배치 */
const ARROW_OVERLAY =
  "pointer-events-none z-10 max-[1799px]:absolute max-[1799px]:top-1/2 max-[1799px]:-translate-y-1/2 min-[1800px]:pointer-events-auto min-[1800px]:static min-[1800px]:shrink-0 min-[1800px]:flex min-[1800px]:w-12 min-[1800px]:translate-y-0 min-[1800px]:items-center min-[1800px]:justify-center min-[1800px]:self-center";

const PAGE_CLASS =
  "portfolio-pdf-page mx-auto shadow-none [&_.react-pdf__Page__canvas]:mx-auto [&_.react-pdf__Page__canvas]:block";

type PortfolioPdfBodyProps = {
  numPages: number;
  currentPage: number;
  setCurrentPage: (p: number | ((n: number) => number)) => void;
};

/** 세로 스크롤 위방향(손가락 위) = 이전, 아래방향 = 다음. 누적 델타로 트랙패드 연타 방지 */
const WHEEL_PAGE_THRESHOLD = 52;

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

  useEffect(() => {
    if (numPages === 0) return;
    const el = areaRef.current;
    if (!el) return;

    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      acc += e.deltaY;
      if (acc >= WHEEL_PAGE_THRESHOLD) {
        acc = 0;
        setCurrentPage((p) => Math.min(numPages, p + 1));
      } else if (acc <= -WHEEL_PAGE_THRESHOLD) {
        acc = 0;
        setCurrentPage((p) => Math.max(1, p - 1));
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [numPages, setCurrentPage]);

  useEffect(() => {
    if (numPages === 0) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const t = e.target;
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLSelectElement ||
        (t instanceof HTMLElement &&
          t.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      if (e.key === "ArrowLeft") {
        setCurrentPage((p) => Math.max(1, p - 1));
      } else {
        setCurrentPage((p) => Math.min(numPages, p + 1));
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [numPages, setCurrentPage]);

  const pageIndices =
    numPages > 0 ? Array.from({ length: numPages }, (_, i) => i + 1) : [];

  return (
    <div
      className="relative flex w-full min-w-0 min-[1800px]:flex-row min-[1800px]:items-center min-[1800px]:gap-3 bg-background"
    >
      {currentPage > 1 ? (
        <div className={`${ARROW_OVERLAY} max-[1799px]:left-0 max-[1799px]:sm:left-1`}>
          <button
            type="button"
            className={`${PORTFOLIO_PDF_BUTTON_CLASS} pointer-events-auto`}
            aria-label="이전 페이지"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ←
          </button>
        </div>
      ) : (
        <div
          className="hidden min-[1800px]:block min-[1800px]:w-12 min-[1800px]:shrink-0"
          aria-hidden
        />
      )}

      <div className="flex w-full min-w-0 flex-1 min-[1800px]:justify-center">
        <div
          ref={areaRef}
          className="w-full min-w-0 min-[1800px]:max-w-5xl outline-none"
          role="region"
          aria-label="포트폴리오 PDF — 휠 또는 좌우 화살표로 페이지 이동"
          tabIndex={0}
        >
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
        </div>
      </div>

      {numPages > 0 && currentPage < numPages ? (
        <div className={`${ARROW_OVERLAY} max-[1799px]:right-0 max-[1799px]:sm:right-1`}>
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
      ) : (
        <div
          className="hidden min-[1800px]:block min-[1800px]:w-12 min-[1800px]:shrink-0"
          aria-hidden
        />
      )}
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
