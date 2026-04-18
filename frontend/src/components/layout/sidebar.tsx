"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CaretLeft,
  CaretRight,
  DiscordLogo,
  House,
  PlusCircle,
  XLogo,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/layout/sidebar-context";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: House },
  { label: "Launch Token", href: "/create", icon: PlusCircle },
];

function SidebarContent({
  isCollapsed,
  onNavigate,
}: {
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const renderItems = (items: NavItem[]) =>
    items.map((item) => {
      const Icon = item.icon;
      const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

      return (
        <Link
          key={item.label}
          href={item.disabled ? "#" : item.href}
          onClick={onNavigate}
          aria-disabled={item.disabled}
          title={isCollapsed ? item.label : undefined}
          className={cn(
            "group relative flex items-center gap-3 overflow-hidden rounded-md transition-colors",
            item.disabled
              ? "pointer-events-none text-zinc-600"
              : "text-zinc-300 hover:bg-zinc-900/60 hover:text-zinc-100",
            isActive && (isCollapsed ? "bg-transparent text-zinc-100" : "bg-[#18181b] text-zinc-100"),
            isCollapsed ? "h-11 justify-start pl-4 pr-0" : "h-11 px-3",
          )}
        >
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
              isActive ? "bg-[#18181b] text-zinc-100" : "text-zinc-400",
            )}
          >
            <Icon size={16} weight={isActive ? "bold" : "regular"} />
          </span>

          <span
            className={cn(
              "whitespace-nowrap text-sm font-medium",
              isCollapsed ? "hidden" : "inline",
            )}
          >
            {item.label}
          </span>

          {item.badge && !isCollapsed ? (
            <span className="ml-auto rounded-md border border-amber-300/30 bg-amber-300/10 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-amber-200">
              {item.badge}
            </span>
          ) : null}
        </Link>
      );
    });

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "px-4 pt-5",
          isCollapsed ? "pb-2" : "border-b border-[#27272a] pb-4",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className={cn(
                "grid h-9 w-9 place-items-center rounded-md text-zinc-100",
                isCollapsed ? "bg-transparent" : "bg-zinc-900",
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" className="size-5" viewBox="0 0 48 48">
                <path fill="currentColor" fillRule="evenodd" d="M24.242 30.23a.95.95 0 0 0 .036-1.015L12.788 9.46A.9.9 0 0 0 11.993 9h-8.07c-.71 0-1.16.785-.793 1.414l15.1 26.317a.91.91 0 0 0 1.55.06zM10.29 36.32c.367.629-.083 1.426-.793 1.426H3.96a.934.934 0 0 1-.923-.942v-9.522c0-.967 1.243-1.305 1.716-.483z" clipRule="evenodd" />
                <path fill="currentColor" d="M45.874 36.586c.355.629-.083 1.414-.793 1.414h-8.023a.91.91 0 0 1-.793-.471L20.704 10.414c-.355-.629.083-1.414.793-1.414h8.058c.332 0 .628.181.793.471z" />
              </svg>
            </div>
            <div className={cn("leading-tight", isCollapsed && "hidden")}>
              <p className="text-lg font-semibold tracking-[0.12em] text-zinc-100">METAPLEX</p>
            </div>
          </div>
        </div>
      </div>

      <div className={cn("flex-1 overflow-y-auto", isCollapsed ? "px-0 py-2" : "px-3 py-4")}>
        <div className="space-y-1.5">{renderItems(navItems)}</div>
      </div>

      <div className="border-t border-[#27272a] px-3 py-4">
        <div className={cn("space-y-2", isCollapsed && "space-y-3") }>
          <Link
            href="https://x.com"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "inline-flex items-center gap-2 rounded-md text-zinc-400 transition-colors hover:text-zinc-100",
              isCollapsed ? "h-9 w-full justify-center hover:bg-zinc-900" : "h-9 px-2",
            )}
          >
            <XLogo size={16} weight="bold" />
            {!isCollapsed ? <span className="text-sm">Twitter</span> : null}
          </Link>
          <Link
            href="https://discord.com"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "inline-flex items-center gap-2 rounded-md text-zinc-400 transition-colors hover:text-zinc-100",
              isCollapsed ? "h-9 w-full justify-center hover:bg-zinc-900" : "h-9 px-2",
            )}
          >
            <DiscordLogo size={16} weight="fill" />
            {!isCollapsed ? <span className="text-sm">Discord</span> : null}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { isCollapsed, isMobileOpen, toggle, toggleMobile, closeMobile } = useSidebar();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity lg:hidden",
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeMobile}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden border-r border-[#27272a] bg-[#111111]/95 backdrop-blur-xl lg:flex",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        <SidebarContent isCollapsed={isCollapsed} />
        <button
          type="button"
          onClick={toggle}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "absolute top-6 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#27272a] bg-zinc-900 text-zinc-400 transition-colors hover:text-zinc-100",
            isCollapsed ? "-right-3" : "-right-3",
          )}
        >
          {isCollapsed ? (
            <CaretRight size={12} weight="bold" />
          ) : (
            <CaretLeft size={12} weight="bold" />
          )}
        </button>
      </aside>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-[#27272a] bg-[#111111]/95 backdrop-blur-xl transition-transform duration-300 lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent
          isCollapsed={false}
          onNavigate={closeMobile}
        />
        <button
          type="button"
          onClick={toggleMobile}
          aria-label="Close sidebar"
          className="absolute right-3 top-6 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#27272a] bg-zinc-900 text-zinc-400 transition-colors hover:text-zinc-100"
        >
          <CaretLeft size={14} weight="bold" />
        </button>
      </aside>
    </>
  );
}
