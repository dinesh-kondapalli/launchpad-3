"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WelcomeModal } from "@/components/welcome-modal";

interface AppShellProps {
  children: React.ReactNode;
}

function ShellInner({ children }: AppShellProps) {
  return (
    <div className="min-h-screen text-foreground">
      <WelcomeModal />
      <Header />
      <main>
        <div className="w-full">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <ShellInner>{children}</ShellInner>
  );
}
