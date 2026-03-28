"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

const links = [
  { href: "/dashboard", label: "History" },
  { href: "/dashboard/stats", label: "Stats" },
  { href: "/dashboard/constraints", label: "Constraints" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const isAuthPage = pathname.startsWith("/auth");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-lg font-bold tracking-tight"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span className="mr-1">⚡</span>ClaudeBoost
        </Link>

        {!isAuthPage && (
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}

            {email && (
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-border">
                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                  {email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
