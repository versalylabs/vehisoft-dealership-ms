"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DemoUser, INITIAL_USERS } from "@/lib/demo-store";
import {
  UserRole,
  RolePermissions,
  getRolePermissions,
  getDefaultUser,
} from "@/lib/auth";

interface AuthContextType {
  user: DemoUser;
  users: DemoUser[];
  permissions: RolePermissions;
  isAuthenticated: boolean;
  isHydrated: boolean;
  switchUserByRole: (role: UserRole) => void;
  loginWithEmail: (email: string, password?: string) => boolean;
  logout: () => void;
  addStaffUser: (newUser: Omit<DemoUser, "id">) => void;
  toggleUserStatus: (id: string) => void;
  updateUserRole: (id: string, role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USER_KEY = "vehisoft_active_user_v2";
const STORAGE_USERS_LIST_KEY = "vehisoft_users_list_v2";
const STORAGE_AUTH_STATE_KEY = "vehisoft_is_authenticated_v2";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<DemoUser[]>(INITIAL_USERS);
  const [user, setUser] = useState<DemoUser>(getDefaultUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem(STORAGE_USERS_LIST_KEY);
      if (savedUsers) {
        const parsed: DemoUser[] = JSON.parse(savedUsers);
        // Ensure versalylabs@gmail.com is always present
        const hasVersaly = parsed.some(
          (u) => u.email.toLowerCase() === "versalylabs@gmail.com"
        );
        setUsers(hasVersaly ? parsed : [INITIAL_USERS[0], ...parsed]);
      }
      const savedUser = localStorage.getItem(STORAGE_USER_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      const savedAuth = localStorage.getItem(STORAGE_AUTH_STATE_KEY);
      if (savedAuth !== null) {
        setIsAuthenticated(savedAuth === "true");
      }
    } catch {
      // Fallback to defaults if localStorage is unavailable
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const persistUsers = (updated: DemoUser[]) => {
    setUsers(updated);
    try {
      localStorage.setItem(STORAGE_USERS_LIST_KEY, JSON.stringify(updated));
    } catch {}
  };

  const switchUserByRole = (role: UserRole) => {
    const found = users.find((u) => u.role === role) || INITIAL_USERS[0];
    setUser(found);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(found));
      localStorage.setItem(STORAGE_AUTH_STATE_KEY, "true");
    } catch {}
  };

  const loginWithEmail = (email: string, password?: string): boolean => {
    const normalizedEmail = email.trim().toLowerCase();

    // Check password if provided
    if (password !== undefined) {
      if (
        normalizedEmail === "versalylabs@gmail.com" &&
        password !== "labversaly-16"
      ) {
        return false;
      }
      if (
        normalizedEmail !== "versalylabs@gmail.com" &&
        password !== "labversaly-16" &&
        password !== "Vehisoft@2026"
      ) {
        return false;
      }
    }

    // Match user (allow admin@vehisoft.co.ke as alias for versalylabs@gmail.com)
    let found = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.isActive
    );
    if (!found && normalizedEmail === "admin@vehisoft.co.ke") {
      found = INITIAL_USERS[0];
    }
    if (!found) return false;

    setUser(found);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(found));
      localStorage.setItem(STORAGE_AUTH_STATE_KEY, "true");
    } catch {}
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem(STORAGE_AUTH_STATE_KEY, "false");
    } catch {}
  };

  const addStaffUser = (newUser: Omit<DemoUser, "id">) => {
    const created: DemoUser = {
      ...newUser,
      id: `usr-${Date.now()}`,
    };
    persistUsers([...users, created]);
  };

  const toggleUserStatus = (id: string) => {
    const updated = users.map((u) =>
      u.id === id ? { ...u, isActive: !u.isActive } : u
    );
    persistUsers(updated);
  };

  const updateUserRole = (id: string, role: UserRole) => {
    const updated = users.map((u) => (u.id === id ? { ...u, role } : u));
    persistUsers(updated);
    if (user.id === id) {
      const updatedCurrent = { ...user, role };
      setUser(updatedCurrent);
      try {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedCurrent));
      } catch {}
    }
  };

  const permissions = getRolePermissions(user.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        permissions,
        isAuthenticated,
        isHydrated,
        switchUserByRole,
        loginWithEmail,
        logout,
        addStaffUser,
        toggleUserStatus,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
