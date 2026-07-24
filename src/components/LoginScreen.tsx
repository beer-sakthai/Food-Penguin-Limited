// Saksee · 2026-07-24 · feat/density-cut
import React, { useState } from "react";
import { User, Lock, ChevronRight } from "lucide-react";

interface Props {
  theme: "light" | "dark" | "metallic";
  onLogin: (username: string, role: "Admin" | "User") => void;
}

export default function LoginScreen({ theme, onLogin }: Props) {
  const [username, setUsername] = useState("Skipper");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Admin" | "User">("Admin");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg p-8 space-y-4">
        <div className="text-center pb-2">
          <div className="w-12 h-12 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center text-lg font-bold mx-auto mb-3">FP</div>
          <h1 className="text-lg font-bold text-[var(--text)]">Food Penguin</h1>
          <p className="text-xs font-mono text-[var(--muted)] mt-0.5">Operations dashboard</p>
        </div>
        <div className="relative">
          <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]" />
        </div>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]" />
        </div>
        <select value={role} onChange={e => setRole(e.target.value as any)}
          className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]">
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="Staff">Staff</option>
        </select>
        <button type="submit" className="w-full px-3 py-2 text-sm font-semibold rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] flex items-center justify-center gap-1.5">
          Sign in <ChevronRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
