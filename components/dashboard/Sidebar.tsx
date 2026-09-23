"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  BarChart3,
  Cpu,
  Settings,
  Plus,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Cards",
      href: "/dashboard/cards",
      icon: CreditCard,
    },
    {
      label: "Businesses",
      href: "/dashboard/businesses",
      icon: Building2,
    },
    {
      label: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      label: "Hardware Guide",
      href: "/dashboard/hardware",
      icon: Cpu,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-60 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Logo */}
        <Link href="/dashboard" className="h-16 flex items-center gap-3 px-4 border-b border-slate-200 hover:opacity-90 transition-opacity">
          <img
            src="/logo.png"
            alt="NFCFlow Logo"
            className="h-10 w-auto object-contain shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-slate-900 leading-none">NFCFlow</span>
            <span className="text-[10px] font-semibold text-blue-600 tracking-wider uppercase mt-0.5">Admin Console</span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-900" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick Action Box */}
      <div className="p-3 m-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
        <p className="text-[11px] text-slate-600 leading-snug">
          Permanent URLs allow changing card targets anytime.
        </p>
        <Link
          href="/dashboard/cards/new"
          className="w-full inline-flex items-center justify-center py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-md text-xs transition-colors shadow-xs gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Card
        </Link>
      </div>
    </aside>
  );
}
