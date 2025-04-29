"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  // 현재 경로에 따라 활성화된 메뉴 항목 스타일 적용
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="flex items-center space-x-8 py-4">
      <Link 
        href="/" 
        className={`text-base font-medium ${isActive('/') ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'} transition`}
      >
        전체
      </Link>
      <Link 
        href="/tech" 
        className={`text-base font-medium ${isActive('/tech') ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'} transition`}
      >
        개발
      </Link>
      <Link 
        href="/data" 
        className={`text-base font-medium ${isActive('/data') ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'} transition`}
      >
        데이터
      </Link>
      <Link 
        href="/design" 
        className={`text-base font-medium ${isActive('/design') ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'} transition`}
      >
        디자인
      </Link>
    </nav>
  );
}