"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Business, UserRole } from "@/types";

export interface DashboardContextType {
  businesses: Business[];
  selectedBusinessId: string;
  setSelectedBusinessId: (id: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  refreshData: () => void;
}

const DashboardContext = createContext<DashboardContextType>({
  businesses: [],
  selectedBusinessId: "all",
  setSelectedBusinessId: () => {},
  userRole: "super_admin",
  setUserRole: () => {},
  refreshData: () => {},
});

export const useDashboard = () => useContext(DashboardContext);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("all");
  const [userRole, setUserRole] = useState<UserRole>("super_admin");

  const loadBusinesses = async () => {
    try {
      const res = await fetch("/api/businesses");
      const json = await res.json();
      if (json.success) {
        setBusinesses(json.data);
      }
    } catch (err) {
      console.error("Failed to load businesses:", err);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        businesses,
        selectedBusinessId,
        setSelectedBusinessId,
        userRole,
        setUserRole,
        refreshData: loadBusinesses,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
