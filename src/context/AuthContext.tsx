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
  switchUserByRole: (role: UserRole) => void;
  loginWithEmail: (email: string) => boolean;
  logout: () => void;
  addStaffUser: (newUser: Omit<DemoUser, "id">) => void;
  toggleUserStatus: (id: string) => void;
  updateUserRole: (id: string, role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USER_KEY = "vehisoft_active_user_v1";
const STORAGE_USERS_LIST_KEY = "vehisoft_users_list_v1";
const STORAGE_AUTH_STATE_KEY = "vehisoft_is_authenticated_v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<DemoUser[]>(INITIAL_USERS);
  const [user, setUser] = useState<DemoUser>(getDefaultUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem(STORAGE_USERS_LIST_KEY);
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
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

  const loginWithEmail = (email: string): boolean => {
    const found = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.isActive
    );
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
