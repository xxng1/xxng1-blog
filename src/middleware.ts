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

// matcher 없음 = 모든 요청에 미들웨어 실행 (봇이 /, favicon, _next 등 아무 경로로 와도 차단됨)
