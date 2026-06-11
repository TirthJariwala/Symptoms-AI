"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  LayoutDashboard,
  Upload,
  Microscope,
  History,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/lib/api/authApi";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Upload, label: "Upload Image", href: "/upload" },
  { icon: Microscope, label: "Prediction", href: "/prediction" },
  { icon: History, label: "Case History", href: "/history" },
  { icon: FileText, label: "Reports", href: "/report" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = user?.role === "admin";
  const bottomItems = [
    ...(isAdmin ? [{ icon: Shield, label: "Admin Panel", href: "/admin" }] : []),
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const isActive = (href: string) =>
    href !== "#" && (pathname === href || pathname.startsWith(href + "/"));

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const handleLogout = async () => {
    await authApi.logout();
    clearUser();
    router.push("/login");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="fixed left-0 top-0 bottom-0 bg-[#1A2744] flex flex-col z-40 overflow-hidden shadow-sidebar"
    >
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-[#3B6FD4] rounded-xl flex-shrink-0 flex items-center justify-center">
          <Activity className="w-4.5 h-4.5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <div className="text-white font-display font-semibold text-[15px] leading-tight">
                Symptoms AI
              </div>
              <div className="text-[#7EB0FF] text-[11px] font-medium">Clinical AI Platform</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="mb-4">
          {!collapsed && (
            <span className="text-[#475569] text-[11px] font-semibold uppercase tracking-widest px-3 mb-2 block">
              Clinical Tools
            </span>
          )}
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-0.5 group ${
                isActive(href)
                  ? "bg-[#3B6FD4]/20 text-[#7EB0FF]"
                  : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive(href) ? "text-[#7EB0FF]" : "text-[#64748B] group-hover:text-white"
                }`}
              />
              {!collapsed && (
                <span className="text-[14px] font-medium whitespace-nowrap">{label}</span>
              )}
            </Link>
          ))}
        </div>

        {bottomItems.length > 0 && (
          <>
            {!collapsed && <div className="border-t border-white/10 my-3" />}
            <div>
              {!collapsed && (
                <span className="text-[#475569] text-[11px] font-semibold uppercase tracking-widest px-3 mb-2 block">
                  System
                </span>
              )}
              {bottomItems.map(({ icon: Icon, label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-0.5 group ${
                    isActive(href)
                      ? "bg-[#3B6FD4]/20 text-[#7EB0FF]"
                      : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0 text-[#64748B] group-hover:text-white" />
                  {!collapsed && (
                    <span className="text-[14px] font-medium whitespace-nowrap">{label}</span>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>

      <div className="border-t border-white/10 px-3 py-4 space-y-2">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 bg-[#3B6FD4] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="overflow-hidden">
              <div className="text-white text-[13px] font-medium truncate">
                {user.full_name || user.email}
              </div>
              <div className="text-[#64748B] text-[11px] capitalize">{user.role}</div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#94A3B8] hover:bg-white/5 hover:text-white transition-all w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-[14px]">Sign out</span>}
        </button>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#64748B] hover:bg-white/5 hover:text-white transition-all w-full"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span className="text-[13px]">Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
