import { useState } from "react";

export type DashboardRole = "Admin" | "Manager" | "Staff" | "User";

const DASHBOARD_ROLES: DashboardRole[] = ["Admin", "Manager", "Staff", "User"];

const STORAGE_KEY = "demoCurrentUser";

export function sanitizeRole(role: unknown): DashboardRole {
  return DASHBOARD_ROLES.includes(role as DashboardRole)
    ? (role as DashboardRole)
    : "User";
}

export interface DashboardUser {
  username: string;
  role: string;
  email?: string;
  photoURL?: string;
}

function readStoredUser(): DashboardUser | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.username !== "string") return null;
    return {
      username: parsed.username,
      role: sanitizeRole(parsed.role),
      email: typeof parsed.email === "string" ? parsed.email : undefined,
      photoURL: typeof parsed.photoURL === "string" ? parsed.photoURL : undefined,
    };
  } catch {
    return null;
  }
}

export function useDashboardAuth() {
  const [currentUser, setCurrentUser] = useState<DashboardUser | null>(readStoredUser);
  const [userRole, setUserRole] = useState<DashboardRole>(
    () => sanitizeRole(readStoredUser()?.role),
  );

  const loginLocalUser = (username: string, role: DashboardRole) => {
    const safeRole = sanitizeRole(role);
    const userObj = {
      username,
      role: safeRole,
      email: "demo@foodpenguin.com",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
    setCurrentUser(userObj);
    setUserRole(safeRole);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
    setUserRole("User");
  };

  return { currentUser, setCurrentUser, userRole, setUserRole, loginLocalUser, logout };
}
