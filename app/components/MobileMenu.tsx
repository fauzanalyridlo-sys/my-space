"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import NavLinks from "./NavLinks";

export default function MobileMenu({
  email,
}: {
  email: string | null | undefined;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    await signOut({
      callbackUrl: "/login",
    });
  }

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div className="sm:hidden">
      {/* Hamburger */}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 text-xl text-zinc-300 transition hover:border-zinc-500 hover:text-white"
      >
        {isOpen ? "×" : "☰"}
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-zinc-800 bg-zinc-950 shadow-xl">
          <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
            {/* Navigation */}
            <NavLinks
              mobile
              onNavigate={closeMenu}
            />

            {/* User */}
            <div className="mt-4 border-t border-zinc-800 pt-4">
              {email && (
                <p className="mb-3 truncate px-4 text-sm text-zinc-500">
                  {email}
                </p>
              )}

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full rounded-lg border border-zinc-700 px-4 py-3 text-left text-sm text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoggingOut ? "Signing out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}