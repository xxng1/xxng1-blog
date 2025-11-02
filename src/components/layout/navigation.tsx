"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationProps {
  showTitle?: boolean;
}

export default function Navigation({ }: NavigationProps) {
  const pathname = usePathname();
  
  // about 페이지, 개별 글 페이지에서는 네비게이션을 표시하지 않음
  if (pathname === '/about' || pathname.includes('/posts/')) return null;
  
  // 홈 페이지, posts 페이지, dev, infra, etc 페이지에서 표시
  const shouldShowSticky = pathname === '/' ||
                          pathname.startsWith('/posts') || 
                          pathname.startsWith('/dev') || 
                          pathname.startsWith('/infra') || 
                          pathname.startsWith('/etc');
  
  if (!shouldShowSticky) return null;
  
  // 현재 경로에 따라 활성화된 메뉴 항목 스타일 적용
  const isActive = (path: string) => {
    if (path === '/posts' && pathname === '/posts') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-[88px] bg-background/80 backdrop-blur-sm z-10 border-b border-card-border -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-4 mb-8 flex items-center space-x-1">
      <Link 
        href="/" 
        className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${
          pathname === '/' || isActive('/posts')
            ? 'bg-accent text-white shadow-sm' 
            : 'text-muted hover:text-foreground hover:bg-card-background'
        }`}
      >
        전체
      </Link>
      <Link 
        href="/dev" 
        className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${
          isActive('/dev') 
            ? 'bg-accent text-white shadow-sm' 
            : 'text-muted hover:text-foreground hover:bg-card-background'
        }`}
      >
        개발
      </Link>
      <Link 
        href="/infra" 
        className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${
          isActive('/infra') 
            ? 'bg-accent text-white shadow-sm' 
            : 'text-muted hover:text-foreground hover:bg-card-background'
        }`}
      >
        인프라
      </Link>
      <Link 
        href="/etc" 
        className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${
          isActive('/etc') 
            ? 'bg-accent text-white shadow-sm' 
            : 'text-muted hover:text-foreground hover:bg-card-background'
        }`}
      >
        etc
      </Link>
    </nav>
  );
}