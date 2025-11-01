import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-slate-900">
            Recall PM
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600">
            <Link href="/projects" className="hover:text-slate-900">Projects</Link>
            <Link href="/bots" className="hover:text-slate-900">Bots</Link>
            <Link href="/meetings" className="hover:text-slate-900">Meetings</Link>
            <Link href="/integrations" className="hover:text-slate-900">Integrations</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="inline-flex items-center rounded-md bg-slate-900 text-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-slate-800">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
