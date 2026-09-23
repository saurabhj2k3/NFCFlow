"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Business, UserRole } from "@/types";
import {
  Building2,
  ChevronDown,
  Plus,
  ExternalLink,
} from "lucide-react";

interface HeaderProps {
  businesses: Business[];
  selectedBusinessId: string;
  onSelectBusiness: (id: string) => void;
  userRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export function Header({
  businesses,
  selectedBusinessId,
  onSelectBusiness,
  userRole = "super_admin",
  onRoleChange,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const selectedBiz = businesses.find((b) => b.id === selectedBusinessId);

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Business Selector */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 transition-colors font-medium"
          >
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: selectedBiz?.brand_color || "#0f172a" }}
            />
            <span className="max-w-[180px] sm:max-w-[240px] truncate">
              {selectedBusinessId === "all" ? "All Locations" : selectedBiz?.name || "Select Business"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Business Switcher Dropdown */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50">
                <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">
                  Locations
                </div>
                <button
                  onClick={() => {
                    onSelectBusiness("all");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                    selectedBusinessId === "all" ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>All Locations (Overview)</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {businesses.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onSelectBusiness(b.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        selectedBusinessId === b.id ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: b.brand_color || "#0f172a" }}
                        />
                        <span className="truncate">{b.name}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="my-1 border-t border-slate-100" />

                <Link
                  href="/dashboard/businesses"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Business Location</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Quick Role Switcher, Public Landing Link, User Info */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs">
        {onRoleChange && (
          <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 gap-1.5">
            <span className="text-slate-400 text-[11px]">Role:</span>
            <select
              value={userRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-slate-800 font-medium text-xs focus:outline-none cursor-pointer"
            >
              <option value="super_admin">Super Admin</option>
              <option value="business_owner">Business Owner</option>
              <option value="manager">Store Manager</option>
            </select>
          </div>
        )}

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <span>Landing Page</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center font-bold text-xs text-white">
            {userRole === "super_admin" ? "SA" : userRole === "business_owner" ? "BO" : "M"}
          </div>
        </div>
      </div>
    </header>
  );
}
