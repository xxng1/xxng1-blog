"use client";

import dynamic from "next/dynamic";

const PortfolioPdfViewer = dynamic(() => import("./PortfolioPdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[40vh] items-center justify-center rounded-lg border border-card-border bg-card-background text-sm text-gray-500">
      PDF 뷰어 로딩 중..
    </div>
  ),
});

export default function PortfolioPdfViewerLoader() {
  return <PortfolioPdfViewer />;
}

