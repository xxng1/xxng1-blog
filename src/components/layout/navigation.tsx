"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationProps {
  showTitle?: boolean;
}

export default function Navigation({ }: NavigationProps) {
  const pathname = usePathname();
  
  // about 페이지에서는 네비게이션을 표시하지 않음
  if (pathname.includes('/about')) return null;
  
  // 현재 경로에 따라 활성화된 메뉴 항목 스타일 적용
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="flex items-center space-x-8 mt-[-1rem]">
      <Link 
        href="/" 
        className={`text-base font-medium ${isActive('/') ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'} transition`}
      >
        전체
      </Link>
      <Link 
        href="/dev" 
        className={`text-base font-medium ${isActive('/dev') ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'} transition`}
      >
        개발
      </Link>
      <Link 
        href="/infra" 
        className={`text-base font-medium ${isActive('/infra') ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'} transition`}
      >
        인프라
      </Link>
      <Link 
        href="/etc" 
        className={`text-base font-medium ${isActive('/etc') ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'} transition`}
      >
        etc
      </Link>
    </nav>
  );
}