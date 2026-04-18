"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import { WelcomeModal } from "@/components/welcome-modal";

interface AppShellProps {
  children: React.ReactNode;
}

function ShellInner({ children }: AppShellProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <WelcomeModal />
      <Sidebar />
      <Header />
      <main
        className={`pt-16 transition-[padding-left] duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <div className="w-full px-4 py-6 sm:px-6 lg:px-0 lg:py-5">
          {children}
        </div>
      </main>
      <div
        className={`transition-[padding-left] duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <Footer />
      </div>
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <ShellInner>{children}</ShellInner>
    </SidebarProvider>
  );
}
