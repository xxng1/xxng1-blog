"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HeaderNav() {
  const pathname = usePathname();
  const isAbout = pathname === '/about';
  const isPost = pathname.includes('/posts/');

  return (
    <>
      <Link
        href="/"
        className={`text-lg font-medium transition-colors ${
          (pathname === "/" || isPost) && !isAbout
            ? "text-foreground font-semibold"
            : "text-muted hover:text-foreground"
        }`}
      >
        Blog
      </Link>

      <Link
        href="/about"
        className={`text-lg font-medium transition-colors ${
          isAbout
            ? "text-foreground font-semibold"
            : "text-muted hover:text-foreground"
        }`}
      >
        About
      </Link>
    </>
  );
}

