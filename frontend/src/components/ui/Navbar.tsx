"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

const palette = {
  midnight: "#0A0424",
  deep: "#18314F",
  steel: "#384E77",
  sea: "#A4CCC1",
  ice: "#C7E8F3",
} as const;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/0">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl" style={{ background: `conic-gradient(from 180deg at 50% 50%, ${palette.ice}, ${palette.sea}, ${palette.steel}, ${palette.ice})` }} />
          <span className="text-lg font-semibold tracking-tight" style={{ color: palette.ice }}>Environauts Presents...</span>
        </Link>
        <nav className="hidden gap-8 md:flex">
          <Link href="#about" className="text-sm text-white/80 transition hover:text-white">About Us</Link>
          <Link href="#features" className="text-sm text-white/80 transition hover:text-white">Features</Link>
          <Link href="#faq" className="text-sm text-white/80 transition hover:text-white">FAQ</Link>
          <Link href="#contact" className="text-sm text-white/80 transition hover:text-white">Contact Us</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" passHref>
            <Button className="hidden md:inline-flex" style={{ backgroundColor: palette.sea, color: palette.deep }}>Sign In</Button>
          </Link>
          <Link href="/login" passHref>
            <Button className="inline-flex" style={{ backgroundColor: palette.ice, color: palette.deep }}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
