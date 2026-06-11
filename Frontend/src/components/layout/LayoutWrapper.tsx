"use client";

import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-[#F5F7FB]">
      <Sidebar />
      <Navbar />
      <main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{ paddingLeft: 260 }}
      >
        <div className="p-8">{children}</div>
      </main>
    </div>
    </ProtectedRoute>
  );
}