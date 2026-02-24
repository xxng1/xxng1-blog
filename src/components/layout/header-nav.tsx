"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HeaderNav() {
  const pathname = usePathname();
  const isAbout = pathname === '/about' || pathname.startsWith('/about/');
  const isPost = pathname.includes('/posts/');
  const isBlogActive = (pathname === '/' || isPost) && !isAbout;

  return (
    <>
      <Link
        href="/"
        className={`text-[17px] transition-colors ${
          isBlogActive
            ? "text-foreground font-semibold"
            : "text-muted font-medium hover:text-foreground"
        }`}
      >
        Blog
      </Link>

      <Link
        href="/about"
        className={`text-[17px] transition-colors ${
          isAbout
            ? "text-foreground font-semibold"
            : "text-muted font-medium hover:text-foreground"
        }`}
      >
        About
      </Link>
    </>
  );
}

