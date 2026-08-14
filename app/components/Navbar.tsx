import Link from "next/link";
import { auth } from "@/auth";
import LogoutButton from "./LogoutButton";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";

export default async function Navbar() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (
    <header className="relative border-b border-zinc-800">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight"
        >
          My Space
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 sm:flex">
          <NavLinks />

          <div className="flex items-center gap-3 border-l border-zinc-800 pl-6">
            <span className="max-w-40 truncate text-sm text-zinc-500">
              {session.user.email}
            </span>

            <LogoutButton />
          </div>
        </div>

        {/* Mobile */}
        <MobileMenu email={session.user.email} />
      </nav>
    </header>
  );
}