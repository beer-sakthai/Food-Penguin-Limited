import { useEffect, useState } from "react";
import { auth, onAuthStateChanged, signOut } from "../firebase";

export type DashboardRole = "Admin" | "Manager" | "Staff" | "User";

const DASHBOARD_ROLES: DashboardRole[] = ["Admin", "Manager", "Staff", "User"];

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

export function useDashboardAuth() {
  const [userRole, setUserRole] = useState<DashboardRole>("User");
  const [currentUser, setCurrentUser] = useState<DashboardUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const claimsRole = (user as any).reloadUserInfo?.customAttributes
          ? JSON.parse((user as any).reloadUserInfo.customAttributes).role
          : undefined;
        const assignedRole = sanitizeRole(claimsRole);

        setCurrentUser({
          username: user.displayName || user.email || "Local User",
          role: assignedRole,
          email: user.email || undefined,
          photoURL: user.photoURL || undefined,
        });
        setUserRole(assignedRole);
      } else {
        setCurrentUser(null);
        setUserRole("User");
      }
    });
    return () => unsubscribe();
  }, []);

  const loginLocalUser = (username: string, role: DashboardRole) => {
    const safeRole = sanitizeRole(role);
    const userObj = {
      username,
      role: safeRole,
      email: "demo@foodpenguin.com",
    };
    localStorage.setItem("demoCurrentUser", JSON.stringify(userObj));
    setCurrentUser(userObj);
    setUserRole(safeRole);
  };

  const logout = async () => {
    localStorage.removeItem("demoCurrentUser");
    setCurrentUser(null);
    setUserRole("User");
    await signOut(auth).catch(() => { });
  };

  return { currentUser, setCurrentUser, userRole, setUserRole, loginLocalUser, logout };
}
