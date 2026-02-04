import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') ?? '';

  // bot, spider, crawl, slurp 등이 포함되면 차단 (더 강력하게 막고 싶으면 키워드 추가)
  if (/bot|spider|crawl|slurp/i.test(userAgent)) {
    return new NextResponse(null, { status: 403 });
  }

  return NextResponse.next();
}

// 정적 파일(_next 등)은 검사하지 않도록 설정 (서버 비용 절감)
export const config = {
  matcher: [
    /*
     * 아래 경로로 시작하는 것들은 제외하고 실행:
     * - api (API 라우트) -> API도 봇 차단하려면 이 줄 제거
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico (파비콘)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
