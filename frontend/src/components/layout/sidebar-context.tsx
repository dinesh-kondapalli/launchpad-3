"use client";

import { createContext, useContext, useState } from "react";

interface SidebarContextValue {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  isCollapsed: false,
  isMobileOpen: false,
  toggle: () => {},
  toggleMobile: () => {},
  closeMobile: () => {},
});

const SIDEBAR_STORAGE_KEY = "new-launchpad-sidebar-collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggle = () => {
    setIsCollapsed((previous) => {
      const next = !previous;
      if (typeof window !== "undefined") {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");
      }
      return next;
    });
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isMobileOpen,
        toggle,
        toggleMobile: () => setIsMobileOpen((previous) => !previous),
        closeMobile: () => setIsMobileOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
