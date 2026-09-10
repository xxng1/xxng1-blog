"use client";

import dynamic from "next/dynamic";
import type { PortfolioPdfViewerProps } from "./PortfolioPdfViewer";

const PortfolioPdfViewer = dynamic(() => import("./PortfolioPdfViewer"), {
  ssr: false,
});

export default function PortfolioPdfViewerLoader(props: PortfolioPdfViewerProps) {
  return <PortfolioPdfViewer {...props} />;
}
