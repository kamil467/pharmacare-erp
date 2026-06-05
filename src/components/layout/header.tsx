"use client";

import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="h-[56px] bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Left spacer for mobile hamburger */}
      <div className="w-10 lg:w-0" />

      {/* Center - Page context (will be used by pages) */}
      <div className="flex-1" />

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          title="Notifications"
        >
          <Bell className="w-[18px] h-[18px] text-gray-500" strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full border-2 border-white" />
        </Button>

        <div className="hidden sm:flex items-center gap-2.5 pl-3 ml-1 border-l border-gray-200">
          <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center border border-brand-100">
            <span className="text-brand-700 text-xs font-semibold">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[13px] font-medium text-gray-900">
              {session?.user?.name || "User"}
            </p>
            <p className="text-[11px] text-gray-400 capitalize">
              {session?.user?.role || "staff"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
