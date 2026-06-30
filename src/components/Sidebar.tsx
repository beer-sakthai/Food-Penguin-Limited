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
  currentUser: { username: string; role: string; photoURL?: string; email: string } | null;
  userRole: string;
  setUserRole: (role: any) => void;
  isFirebaseSynced: boolean;
  onSignOut: () => void;
}

export function Sidebar({
  isLight,
  healthColorClass,
  healthTooltip,
  healthLabel,
  healthBgClass,
  healthTextClass,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  activeTab,
  setActiveTab,
  tabMeta,
  lowStockCount,
  currentUser,
  userRole,
  setUserRole,
  isFirebaseSynced,
  onSignOut,
}: SidebarProps) {
  return (
    <aside
      className={`w-full md:w-64 flex flex-col shrink-0 shadow-xl md:border-r border-b md:border-b-0 transition-all duration-300 ${isMobileMenuOpen ? "fixed inset-0 z-50 h-[100dvh] overflow-hidden" : "sticky md:relative top-0 z-40"} ${
        isLight
          ? "bg-white/70 border-zinc-200 text-zinc-800 backdrop-blur-xl"
          : "bg-zinc-950/70 border-zinc-800 text-zinc-100 backdrop-blur-xl"
      }`}
    >
      {/* Brand Header */}
      <div
        className={`p-4 md:p-6 border-b flex items-center justify-between gap-3 transition-colors ${isLight ? "border-zinc-150" : "border-zinc-900"}`}
      >
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 relative group shrink-0">
            <span className="font-bold text-white font-sans text-lg tracking-tighter select-none">
              FP
            </span>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${healthColorClass} rounded-full border border-black animate-pulse`}
              title={healthTooltip}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h1
                className={`text-sm font-bold font-sans tracking-tight leading-tight truncate ${isLight ? "text-zinc-900" : "text-white"}`}
              >
                Food Penguin
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-mono font-bold border shrink-0 cursor-help ${healthBgClass} ${healthTextClass}`}
                title={healthTooltip}
              >
                <span
                  className={`w-1 h-1 rounded-full ${healthColorClass} animate-pulse`}
                />
                {healthLabel}
              </span>
            </div>
            <span
              className={`text-xs font-mono tracking-wider uppercase leading-none block mt-0.5 ${isLight ? "text-zinc-500" : "text-zinc-500"}`}
            >
              Limited
            </span>
          </div>
        </div>
        {/* Mobile Menu Toggle Button */}
        <button
          className={`md:hidden p-2 rounded-lg transition-colors shrink-0 ${isLight ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"} hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all `}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Wrapper */}
      <div
        className={`flex-col flex-1 overflow-y-auto ${isMobileMenuOpen ? "flex" : "hidden md:flex"}`}
      >
        {/* Navigation Actions */}
        <nav className="p-2.5 mt-1 space-y-0.5">
          {tabMeta.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors duration-200 ${
                  isActive
                    ? isLight
                      ? "bg-zinc-100 text-zinc-950 font-extrabold shadow-sm"
                      : "bg-zinc-900 text-white font-bold shadow-inner"
                    : isLight
                      ? "text-zinc-600  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-zinc-50 hover:text-zinc-900"
                      : "text-zinc-500 hover:bg-zinc-905 hover:text-white"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 shrink-0 ${
                    isActive
                      ? "bg-orange-500 scale-125"
                      : isLight
                        ? "bg-transparent border border-zinc-300"
                        : "bg-transparent border border-zinc-800"
                  }`}
                />
                <span className="flex-1 flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">
                    <span
                      className={
                        isActive
                          ? "text-orange-500"
                          : isLight
                            ? "text-zinc-400"
                            : "text-zinc-500"
                      }
                    >
                      {tab.icon}
                    </span>
                    {tab.label}
                  </span>
                  {(tab.id === "Overview" || tab.id === "Planning") && lowStockCount > 0 && (
                    <span className="bg-red-500 text-white font-mono text-xs px-1.5 py-0.5 rounded-full font-black animate-pulse shrink-0">
                      {lowStockCount}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer info links */}
        <div
          className={`p-2.5 border-t shrink-0 transition-colors duration-200 ${isLight ? "border-zinc-200 bg-zinc-50/50" : "border-zinc-900 bg-black/40"}`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-full flex flex-col items-center justify-center text-zinc-300 relative shrink-0 border overflow-hidden ${
                isLight
                  ? "bg-zinc-200 border-zinc-300 text-zinc-700"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.username}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span
                className={`w-2 h-2 rounded-full ${isFirebaseSynced ? "bg-emerald-500 animate-pulse" : "bg-orange-500"} absolute -bottom-0.5 -right-0.5 border ${isLight ? "border-zinc-100" : "border-zinc-950"}`}
              />
            </div>
            <div className="text-xs leading-tight flex-1 min-w-0">
              <p
                className={`font-semibold truncate ${isLight ? "text-zinc-900 font-bold" : "text-white"}`}
                title={currentUser?.username || ""}
              >
                {currentUser?.username || "Skipper Koala"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className={`bg-transparent font-mono text-xs uppercase cursor-pointer focus:outline-none appearance-none transition-colors ${
                    isLight
                      ? "text-zinc-500 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:text-zinc-800 font-bold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                  <option value="User">User</option>
                </select>
                <span className="text-zinc-500 font-mono text-xs">•</span>
                <button
                  onClick={onSignOut}
                  className={`text-xs font-mono hover:text-rose-500 flex items-center gap-0.5 transition-colors cursor-pointer ${
                    isLight ? "text-zinc-500 font-bold" : "text-zinc-400"
                  }`}
                  title="Sign Out"
                >
                  <LogOut className="w-2.5 h-2.5" />
                  OUT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
