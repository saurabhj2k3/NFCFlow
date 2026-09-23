"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Business, Card, UserRole } from "@/types";

export interface DashboardContextType {
  businesses: Business[];
  cards: Card[];
  selectedBusinessId: string;
  setSelectedBusinessId: (id: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  refreshData: () => void;
  isLoading: boolean;
}

const DashboardContext = createContext<DashboardContextType>({
  businesses: [],
  cards: [],
  selectedBusinessId: "all",
  setSelectedBusinessId: () => {},
  userRole: "super_admin",
  setUserRole: () => {},
  refreshData: () => {},
  isLoading: false,
});

export const useDashboard = () => useContext(DashboardContext);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("all");
  const [userRole, setUserRole] = useState<UserRole>("super_admin");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bizRes, cardRes] = await Promise.all([
        fetch("/api/businesses"),
        fetch("/api/cards"),
      ]);

      const [bizJson, cardJson] = await Promise.all([
        bizRes.json(),
        cardRes.json(),
      ]);

      if (bizJson.success) {
        setBusinesses(bizJson.data);
      }
      if (cardJson.success) {
        setCards(cardJson.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        businesses,
        cards,
        selectedBusinessId,
        setSelectedBusinessId,
        userRole,
        setUserRole,
        refreshData: loadData,
        isLoading,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
