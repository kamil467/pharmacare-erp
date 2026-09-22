"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { NAV_ITEMS, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Pill,
  Menu,
  X,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  Receipt,
  Search,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  FileText,
  BarChart3,
  Download,
  Users,
  Settings,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  LayoutDashboard,
  Receipt,
  Search,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  FileText,
  BarChart3,
  Download,
  Users,
  Settings,
  ClipboardList,
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = session?.user?.role || "staff";

  const filteredNavItems = NAV_ITEMS.filter((item) =>
    (item.roles as readonly string[]).includes(userRole)
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden bg-white rounded-xl p-2.5 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-[18px] h-[18px] text-gray-700" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-[260px]",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header — Brand */}
        <div className="h-[60px] flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Pill className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
            </div>
            {!collapsed && (
              <span className="text-[15px] font-semibold text-gray-900 tracking-tight truncate">
                {APP_NAME}
              </span>
            )}
          </Link>

          {/* Close button (mobile) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-[18px] h-[18px] text-gray-500" />
          </button>

          {/* Collapse button (desktop) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight
              className={cn(
                "w-4 h-4 text-gray-400 transition-transform duration-300",
                collapsed ? "rotate-0" : "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {filteredNavItems.map((item) => {
            const Icon = iconMap[item.icon];
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group relative",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                )}
                title={collapsed ? item.title : undefined}
              >
                {/* Active indicator bar */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-brand-600 rounded-r-full" />
                )}
                {Icon && (
                  <Icon
                    className={cn(
                      "w-[18px] h-[18px] flex-shrink-0 transition-colors",
                      active
                        ? "text-brand-600"
                        : "text-gray-400 group-hover:text-gray-600"
                    )}
                    strokeWidth={1.8}
                  />
                )}
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-100 p-3 flex-shrink-0">
          <div
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg",
              collapsed ? "justify-center" : ""
            )}
          >
            <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-brand-100">
              <span className="text-brand-700 text-xs font-semibold">
                {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-gray-900 truncate">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-[11px] text-gray-400 capitalize">
                  {session?.user?.role || "staff"}
                </p>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex-shrink-0 h-8 w-8"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-gray-400" />
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
