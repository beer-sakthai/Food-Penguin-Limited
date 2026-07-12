import { useEffect, useState } from "react";
import { auth, onAuthStateChanged, signOut } from "../firebase";

export type DashboardRole = "Admin" | "Manager" | "Staff" | "User";

export interface DashboardUser {
  username: string;
  role: string;
  email?: string;
  photoURL?: string;
}

export function useDashboardAuth() {
  const [userRole, setUserRole] = useState<DashboardRole>("Admin");
  const [currentUser, setCurrentUser] = useState<DashboardUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          username: user.displayName || user.email || "Google User",
          role: "Admin",
          email: user.email || undefined,
          photoURL: user.photoURL || undefined,
        });
        setUserRole("Admin");
      } else {
        const storedUser = localStorage.getItem("localCurrentUser");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setCurrentUser(parsed);
            setUserRole(parsed.role);
          } catch (_) {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const loginLocalUser = (username: string, role: DashboardRole) => {
    const userObj = { username, role, email: "demo@foodpenguin.com" };
    localStorage.setItem("localCurrentUser", JSON.stringify(userObj));
    setCurrentUser(userObj);
    setUserRole(role);
  };

  const logout = async () => {
    localStorage.removeItem("localCurrentUser");
    setCurrentUser(null);
    await signOut(auth).catch(() => { });
  };

  return { currentUser, setCurrentUser, userRole, setUserRole, loginLocalUser, logout };
}
