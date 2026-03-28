import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            &#9889; ClaudeBoost
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            &copy; {new Date().getFullYear()}
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/pricing" className="hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link href="https://github.com" className="hover:text-foreground transition-colors">
            GitHub
          </Link>
          <Link href="#" className="hover:text-foreground transition-colors">
            Docs
          </Link>
        </div>
      </div>
    </footer>
  );
}
