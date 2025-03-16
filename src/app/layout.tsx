import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react"; // Analytics 임포트


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "xxng1's log",
  description: "with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="flex justify-between items-center py-6 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/" className="text-xl font-bold italic tracking-tight hover:text-zinc-600 dark:hover:text-zinc-400 transition">
              xxng1
            </Link>
            <nav className="flex space-x-6">
              <Link href="https://www.linkedin.com/in/sangwoong-park/" className="text-sm font-medium hover:text-zinc-600 dark:hover:text-zinc-300 transition">
                LinkedIn
              </Link>
              <a href="https://github.com/xxng1" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-zinc-600 dark:hover:text-zinc-300 transition">
                GitHub
              </a>
            </nav>
          </header>
          <main className="py-10">{children}</main>
          <footer className="py-6 border-t border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex justify-between items-center">
              <p>© {new Date().getFullYear()}. xxng1 All rights reserved.</p>
              

              <div className="flex space-x-4">
                {/* <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition">
                  Twitter
                </a> */}

                <a href="mailto:woongaaaaa1@gmail.com" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition">
                  Contact
                </a>

                {/* <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition">
                  LinkedIn
                </a> */}
              </div>
            </div>
          </footer>
        </div>
        <Analytics /> {/* Analytics 컴포넌트를 여기 추가 */}
      </body>
    </html>
  );
}
