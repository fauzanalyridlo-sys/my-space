"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/notes", label: "Notes" },
  { href: "/check-in", label: "Check-in" },
  { href: "/reflection", label: "Reflection" },
  { href: "/history", label: "History" },
];

type NavLinksProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export default function NavLinks({
  mobile = false,
  onNavigate,
}: NavLinksProps) {
  const pathname = usePathname();

  return (
    <div
      className={
        mobile
          ? "flex flex-col gap-1"
          : "flex items-center gap-5 text-sm"
      }
    >
      {links.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={
              mobile
                ? `rounded-lg px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`
                : `transition ${
                    isActive
                      ? "font-medium text-white"
                      : "text-zinc-500 hover:text-white"
                  }`
            }
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
