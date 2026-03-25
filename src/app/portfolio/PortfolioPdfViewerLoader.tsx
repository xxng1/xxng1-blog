"use client";

import dynamic from "next/dynamic";

const PortfolioPdfViewer = dynamic(() => import("./PortfolioPdfViewer"), {
  ssr: false,
});

export default function PortfolioPdfViewerLoader() {
  return <PortfolioPdfViewer />;
}

