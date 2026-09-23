"use client";

import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { DashboardProvider, useDashboard } from "@/components/dashboard/DashboardContext";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { businesses, selectedBusinessId, setSelectedBusinessId, userRole, setUserRole } = useDashboard();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          businesses={businesses}
          selectedBusinessId={selectedBusinessId}
          onSelectBusiness={setSelectedBusinessId}
          userRole={userRole}
          onRoleChange={setUserRole}
        />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}
