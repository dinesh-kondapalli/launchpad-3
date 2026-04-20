import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-5 md:px-5">
      <div className="mx-auto flex w-full max-w-[120rem] flex-wrap items-center justify-center gap-6 md:justify-between md:gap-8">
        <p className="text-xs text-muted-foreground">© 2026 Metaplex Global Ltd.</p>
        <nav className="flex items-center gap-6 md:gap-8" aria-label="Legal">
          <Link href="/terms-of-use" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground md:text-sm">
            Terms of Use
          </Link>
          <Link href="/privacy" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground md:text-sm">
            Privacy Policy
          </Link>
          <Link href="/content-policy" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground md:text-sm">
            Content Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
