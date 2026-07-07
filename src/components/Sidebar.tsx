import React from "react";
import { X, Menu, LogOut, User } from "lucide-react";

export interface SidebarProps {
  isLight: boolean;
  healthColorClass: string;
  healthTooltip: string;
  healthLabel: string;
  healthBgClass: string;
  healthTextClass: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabMeta: Array<{ id: string; label: string; icon: React.ReactNode }>;
  lowStockCount: number;
  currentUser: { username: string; role: string; photoURL?: string; email?: string } | null;
  userRole: string;
  setUserRole: (role: any) => void;
  isFirebaseSynced: boolean;
  onSignOut: () => void;
}
