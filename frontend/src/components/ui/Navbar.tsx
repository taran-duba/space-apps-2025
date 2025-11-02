"use client";

import { ArrowRight, LogOut } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Circles } from "react-loader-spinner";

const palette = {
  midnight: "#0A0424",
  deep: "#18314F",
  steel: "#384E77",
  sea: "#A4CCC1",
  ice: "#C7E8F3",
} as const;

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const displayName = (typeof meta.display_name === 'string' && meta.display_name) || user?.email || '';
  const avatarUrl = (typeof meta.avatar_url === 'string' && meta.avatar_url) || 'https://picsum.photos/64';
  const avatarVersion = (typeof meta.avatar_version === 'string' && meta.avatar_version) || user?.updated_at || '';
  const displayAvatarUrl = avatarUrl ? `${avatarUrl}?v=${encodeURIComponent(avatarVersion)}` : avatarUrl;

  if (loading) {
    return <Circles
      height="80"
      width="80"
      color="#4fa94d"
      ariaLabel="circles-loading"
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
    />; // Or a loading spinner
  }

  const isHomePage = pathname === "/";

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/0">
      <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-6 py-4">
        <div className="flex justify-start">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src={"/favicon.png"} width={32} height={32} alt="Clairify Logo" className="h-9 w-9 rounded-2xl" />
            <span className="text-lg font-semibold tracking-tight" style={{ color: palette.ice }}>Clairify</span>
          </Link>
        </div>

        <nav className="flex justify-center">
          <div className="flex items-center gap-8">
            {isHomePage && (
              <>
                <Link href="#about" className="text-sm text-white/80 transition hover:text-white">About Us</Link>
                <Link href="#features" className="text-sm text-white/80 transition hover:text-white">Features</Link>
                <Link href="#faq" className="text-sm text-white/80 transition hover:text-white">FAQ</Link>
                <Link href="#contact" className="text-sm text-white/80 transition hover:text-white">Contact Us</Link>
              </>
            )}
            {user && (
              <>
                <Link href="/dashboard" className="text-sm text-white/80 transition hover:text-white">Dashboard</Link>
                <Link href="/profile" className="text-sm text-white/80 transition hover:text-white">My Profile</Link>
              </>
            )}
          </div>
        </nav>
        <div className="flex justify-end">
          <div className="flex items-center gap-3">
            {user ? (
            <div className="flex items-center gap-3">
              <Image
                src={displayAvatarUrl}
                alt="User avatar"
                width={28}
                height={28}
                className="hidden md:inline-block h-7 w-7 rounded-full object-cover"
              />
              <span className="hidden text-sm text-white/80 md:inline-block">
                {displayName}
              </span>
              <Button
                onClick={signOut}
                className="inline-flex items-center gap-2"
                style={{ backgroundColor: palette.steel, color: palette.ice }}
              >
                Sign Out
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login" passHref>
                <Button className="hidden md:inline-flex" style={{ backgroundColor: palette.sea, color: palette.deep }}>Sign In</Button>
              </Link>
              <Link href="/signup" passHref>
                <Button className="inline-flex" style={{ backgroundColor: palette.ice, color: palette.deep }}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
          </div>
        </div>
      </div>
    </header>
  );
}
