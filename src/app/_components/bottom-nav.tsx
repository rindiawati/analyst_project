"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Home" },
  { href: "/activities/new", label: "Add", primary: true },
  { href: "/profile", label: "Profile" },
];

/**
 * Mobile-only bottom tab bar (hidden on md+). Renders on every authenticated
 * page so navigation feels app-like. The "Add" tab is the primary (accent)
 * action.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-white/10 bg-base/95 pb-[env(safe-area-inset-bottom)] md:hidden">
      {TABS.map((tab) => {
        const active =
          pathname === tab.href ||
          (tab.href !== "/activities/new" && pathname.startsWith(tab.href));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center py-3 text-xs font-semibold transition ${
              active ? "text-accent" : "text-white/50"
            } ${tab.primary ? "text-accent" : ""}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
