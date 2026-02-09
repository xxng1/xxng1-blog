"use client";

import Script from "next/script";

/**
 * GoatCounter - 가벼운 방문 분석
 * https://www.goatcounter.com/
 * - 무료 (비상업적/저트래픽)
 * - 쿠키 없음, GDPR 친화적
 * - 페이지뷰, 방문자 수, 유입 경로 등 제공
 *
 * 설정: .env.local에 NEXT_PUBLIC_GOATCOUNTER_SITE=your-site-name 추가
 * (goatcounter.com에서 사이트 생성 후 site code 입력)
 */
export function Analytics() {
  const site = process.env.NEXT_PUBLIC_GOATCOUNTER_SITE;
  if (!site) return null;

  return (
    <Script
      data-goatcounter={`https://${site}.goatcounter.com/count`}
      src="https://gc.zgo.at/count.js"
      strategy="afterInteractive"
      async
    />
  );
}
