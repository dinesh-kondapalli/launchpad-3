"use client";

import Link from "next/link";
import { List, MagnifyingGlass } from "@phosphor-icons/react";
import { ConnectButton } from "@/components/wallet/connect-button";
import { useSidebar } from "@/components/layout/sidebar-context";

export function Header() {
  const { isCollapsed, toggleMobile } = useSidebar();

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-[#111111]/95 backdrop-blur-xl">
      <div
        className={`transition-[padding-left] duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[120rem] items-center justify-between gap-3 px-4 py-2 md:min-h-[75px] md:justify-end md:px-5 md:py-3 lg:px-8">
          <Link href="/" className="block md:hidden" aria-label="Go home">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" className="size-6" viewBox="0 0 48 48">
              <path fill="currentColor" fillRule="evenodd" d="M24.242 30.23a.95.95 0 0 0 .036-1.015L12.788 9.46A.9.9 0 0 0 11.993 9h-8.07c-.71 0-1.16.785-.793 1.414l15.1 26.317a.91.91 0 0 0 1.55.06zM10.29 36.32c.367.629-.083 1.426-.793 1.426H3.96a.934.934 0 0 1-.923-.942v-9.522c0-.967 1.243-1.305 1.716-.483z" clipRule="evenodd" />
              <path fill="currentColor" d="M45.874 36.586c.355.629-.083 1.414-.793 1.414h-8.023a.91.91 0 0 1-.793-.471L20.704 10.414c-.355-.629.083-1.414.793-1.414h8.058c.332 0 .628.181.793.471z" />
            </svg>
          </Link>

          <div className="mr-auto w-full max-w-[36px] md:max-w-[240px]">
            <button
              type="button"
              aria-label="Search tokens"
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-[#27272a] px-2 py-2 text-sm text-zinc-400 transition-all duration-150 ease-out hover:border-zinc-500 hover:text-zinc-200 active:scale-[0.97] lg:max-w-[240px] lg:justify-start lg:pl-3"
            >
              <MagnifyingGlass size={14} className="shrink-0" />
              <span className="hidden lg:block">Search</span>
              <kbd className="ml-auto hidden h-5 min-w-5 items-center justify-center rounded-sm border border-[#27272a] bg-[#18181b] px-1 text-[10px] text-zinc-500 lg:flex">
                Ctrl K
              </kbd>
            </button>
          </div>

          <nav className="flex items-center justify-end gap-2 md:gap-4">
            <Link
              href="/create"
              className="inline-flex h-7 items-center justify-center rounded-sm border border-[#2f2f32] bg-[#24262d] px-2 text-[10px] font-medium text-zinc-100 transition-colors hover:bg-[#2b2d35] md:h-auto md:px-3 md:py-2 md:text-sm"
            >
              Launch Token
            </Link>
            <ConnectButton
              label="Log In"
              variant="outline"
              showIcon={false}
              className="h-7 rounded-sm border-0 bg-zinc-100 px-3 text-xs text-zinc-900 hover:bg-zinc-200 md:h-9 md:px-4 md:text-sm"
            />
            <div className="flex items-center gap-2 md:gap-3">
              <button
                type="button"
                onClick={toggleMobile}
                className="md:hidden"
                aria-label="Open menu"
              >
                <List size={16} />
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
