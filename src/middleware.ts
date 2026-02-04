// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   const userAgent = request.headers.get('user-agent') ?? '';

//   // 봇 차단 로직 (bot, spider, crawl, slurp 등)
//   if (/bot|spider|crawl|slurp/i.test(userAgent)) {
//     return new NextResponse(null, { status: 403 });
//   }

//   return NextResponse.next();
// }

// // ⚡️ 중요: 정적 파일(이미지, CSS, JS 등)은 미들웨어 실행 제외
// export const config = {
//   matcher: [
//     /*
//      * 아래 경로로 시작하는 것들은 '제외'하고 실행합니다:
//      * - api (API 라우트) -> API도 봇 차단하려면 이 줄은 지우세요
//      * - _next/static (정적 파일)
//      * - _next/image (이미지 최적화 파일)
//      * - favicon.ico (파비콘)
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// };