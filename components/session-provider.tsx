"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "owner" | "admin";
  avatar?: string;
  kycStatus: "verified" | "pending" | "unverified";
  kycDocType?: string;
  drivingLicense?: string;
  businessName?: string;
  campusAffiliation?: string;
  bankUpi?: string;
  rating?: number;
}

interface SessionContextType {
  currentUser: UserSession | null;
  allUsers: UserSession[];
  isLoading: boolean;
  switchUser: (userId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  currentUser: null,
  allUsers: [],
  isLoading: true,
  switchUser: async () => {},
  refreshSession: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [allUsers, setAllUsers] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async (targetId?: string) => {
    try {
      const storedId =
        targetId ||
        (typeof window !== "undefined"
          ? localStorage.getItem("mobility_active_user_id") || "usr-cust-1"
          : "usr-cust-1");

      const res = await fetch(`/api/auth/session?userId=${storedId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setAllUsers(data.availableUsers || []);
      }
    } catch (err) {
      console.error("Failed to fetch session:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const switchUser = async (userId: string) => {
    setIsLoading(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("mobility_active_user_id", userId);
    }
    await fetchSession(userId);
  };

  const refreshSession = async () => {
    await fetchSession(currentUser?.id);
  };

  return (
    <SessionContext.Provider
      value={{
        currentUser,
        allUsers,
        isLoading,
        switchUser,
        refreshSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
