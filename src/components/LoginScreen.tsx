// Saksee · 2026-07-24 · feat/new-design
import React, { useState } from "react";
import { User, Lock, ChevronRight, AlertCircle } from "lucide-react";
import { login, AuthUser } from "../api";

interface Props {
  theme: "light" | "dark";
  onLogin: (user: AuthUser) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(username, password);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center text-lg font-bold shadow-lg shadow-[var(--accent-soft)]/30">
            FP
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[var(--text)]">Food Penguin</h1>
            <p className="text-xs text-[var(--muted)]">Operations dashboard</p>
          </div>
        </div>

        <form onSubmit={submit} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-5 shadow-xl shadow-black/20">
          <div className="space-y-4">
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                autoComplete="username"
                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-hover)] flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"} <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-[10px] text-[var(--muted)] mt-6">
          Food Penguin Limited · Operations Dashboard
        </p>
      </div>
    </div>
  );
}
