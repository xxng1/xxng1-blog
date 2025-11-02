import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import HeaderNav from "@/components/layout/header-nav";

import { FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "xxng1 (Sangwoong)",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          

{/* <header className="flex flex-col py-6 border-b border-transparent sticky top-0 bg-background z-10">
  <div className="flex justify-between items-center">
    <div className="flex items-center space-x-4 ml-2">
      <Link href="/" className="text-xl font-bold italic tracking-tight hover:text-zinc-400 transition">
        xxng1
      </Link>
    </div>
    <nav className="flex items-center space-x-4 mr-2">
      <Link href="/about" className="text-base font-bold tracking-tight hover:text-zinc-400 transition">
        About
      </Link>
    </nav>
  </div>
</header> */}

<header className="flex flex-col py-8 border-b border-card-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
  <div className="flex items-center justify-between">
    <Link
      href="/"
      className="text-2xl font-bold italic tracking-tight text-accent hover:text-accent-hover transition-colors"
    >
      xxng1
    </Link>
    <nav className="flex items-center space-x-6">
      <HeaderNav />
    </nav>
  </div>
</header>




          <main className="py-12">
            {children}
          </main>
          <footer className="py-8 border-t border-card-border text-sm text-muted-foreground">
            <div className="flex justify-between items-center">
              <p>© {new Date().getFullYear()}. xxng1 All rights reserved.</p>
              <div className="flex space-x-6">
                <a href="mailto:woongaaaaa1@gmail.com" className="text-muted-foreground hover:text-accent transition-colors">
                  <FaEnvelope size={20} /> 
                </a>
                <a href="https://www.linkedin.com/in/sangwoong-park/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
                  <FaLinkedin size={20} />
                </a>
                <a href="https://github.com/xxng1" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
                  <FaGithub size={20} />
                </a>
              </div>
            </div>
          </footer>
        </div>
        <Analytics /> {/* Analytics 컴포넌트를 여기 추가 */}
      </body>
    </html>
  );
}
