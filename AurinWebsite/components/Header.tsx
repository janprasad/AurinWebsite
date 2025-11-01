"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-10 bg-[var(--color-ivory)]/90 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-ivory)]/80 border-b border-[color:var(--color-stone)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-[var(--color-ink)]">
            Recall PM
          </Link>
          <SignedIn>
            <nav className="hidden md:flex items-center gap-5 text-sm text-[var(--color-ink)]/80">
              <Link href="/integrations" className="hover:text-[var(--color-ink)]">Integrations</Link>
            </nav>
          </SignedIn>
        </div>
        <div className="flex items-center gap-3">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="inline-flex items-center rounded-full bg-[var(--color-primary)] text-white px-4 py-2 text-sm font-medium shadow-sm hover:brightness-95">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
