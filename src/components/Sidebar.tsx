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
      className={`w-full flex flex-col shrink-0 shadow-lg md:border-r border-b md:border-b-0 transition-all duration-300 ${isMobileMenuOpen ? "fixed inset-0 z-50 h-[100dvh] overflow-hidden" : "sticky md:relative top-0 z-40"} ${
        isLight
          ? "bg-white/95 border-zinc-200 text-zinc-800 backdrop-blur-xl"
          : "bg-zinc-950/95 border-zinc-800 text-zinc-100 backdrop-blur-xl"
      }`}
      style={{ minWidth: 0 }}
    >
      {/* Brand Header */}
      <div
        className={`p-4 md:p-6 border-b flex items-center justify-between gap-3 transition-colors ${isLight ? "border-zinc-150" : "border-zinc-900"}`}
      >
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 relative group shrink-0">
            <span className="font-bold text-white font-sans text-lg tracking-tighter select-none">
              FP
            </span>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${healthColorClass} rounded-full border border-black animate-pulse`}
              title={healthTooltip}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className={`text-base font-bold font-sans tracking-tight leading-tight truncate ${isLight ? "text-zinc-900" : "text-white"}`}
            >
              Food Penguin
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[10px] font-mono tracking-wider uppercase leading-none ${isLight ? "text-zinc-500" : "text-zinc-500"}`}
              >
                Personal dashboard
              </span>
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-[1px] rounded-full text-[9px] font-mono font-bold border shrink-0 cursor-help ${healthBgClass} ${healthTextClass}`}
                title={healthTooltip}
              >
                <span
                  className={`w-1 h-1 rounded-full ${healthColorClass} animate-pulse`}
                />
                {healthLabel}
              </span>
            </div>
          </div>
        </div>
        {/* Mobile Menu Toggle Button */}
        <button
          className={`md:hidden p-2 rounded-lg shrink-0 ${isLight ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"} active:scale-[0.98] transition-all `}
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
        <nav className="p-3 mt-2 space-y-1">
          {tabMeta.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button className={`relative overflow-hidden btn-interactive w-full text-left py-2.5 px-3.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${ isActive ? isLight ? "bg-orange-50 text-zinc-950 font-bold shadow-sm border border-orange-200" : "bg-orange-500/12 text-white font-bold shadow-sm border border-orange-500/30" : isLight ? "text-zinc-600 active:scale-[0.98] hover:bg-zinc-100 hover:text-zinc-900 border border-transparent" : "text-zinc-400 active:scale-[0.98] hover:bg-zinc-800/70 hover:text-white border border-transparent" }`} key={tab.id} onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)] rounded-r-md transition-all duration-300 animate-in fade-in zoom-in" />
                )}
                <div className="flex items-center gap-3 min-w-0 z-10 relative">
                  <span
                    className={`shrink-0 transition-colors ${
                      isActive
                        ? "text-orange-500"
                        : isLight
                          ? "text-zinc-400 group-hover:text-zinc-600"
                          : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <span className="truncate tracking-wide">{tab.label}</span>
                </div>
                
                {(tab.id === "Overview" || tab.id === "Planning") && lowStockCount > 0 && (
                  <span className="bg-red-500 text-white font-mono text-[10px] leading-none px-2 py-1 rounded-full font-black animate-pulse shrink-0 ml-2 shadow-sm shadow-red-500/30">
                    {lowStockCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
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
                {currentUser?.username || "Food Penguin User"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <select className={`input-gold-glow bg-transparent font-mono text-xs uppercase cursor-pointer focus:outline-none appearance-none transition-colors ${ isLight ? "text-zinc-500 active:scale-[0.98] hover:text-zinc-800 font-bold" : "text-zinc-500 hover:text-zinc-300" }`} value={userRole} onChange={(e) => setUserRole(e.target.value)}>
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
