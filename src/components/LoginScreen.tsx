import { useState, type FormEvent } from "react";
import { ChefHat, Lock, LogIn, User, UserPlus } from "lucide-react";

interface LoginScreenProps {
  onLogin: (username: string, role: string) => void;
  theme?: "light" | "dark";
}

export default function LoginScreen({ onLogin, theme = "dark" }: LoginScreenProps) {
  const isLight = theme === "light";
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Admin" | "User">("User");
  const [error, setError] = useState("");

  const handleAuth = (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }
    const usersStr = localStorage.getItem("mockUsers");
    const users = usersStr ? JSON.parse(usersStr) : [{ username: "admin", password: "password", role: "Admin" }];
    if (isRegistering) {
      if (users.find((u: any) => u.username === username)) {
        setError("Username already exists");
        return;
      }
      const newUser = { username, password, role };
      localStorage.setItem("mockUsers", JSON.stringify([...users, newUser]));
      onLogin(username, role);
    } else {
      const user = users.find((u: any) => u.username === username && u.password === password);
      if (user) onLogin(user.username, user.role);
      else setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div className="w-full max-w-[360px] p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[var(--accent)] text-white mb-3">
            <ChefHat className="w-7 h-7" />
          </div>
          <h1 className="text-lg font-bold">Food Penguin Limited</h1>
          <p className="text-xs text-[var(--muted)]">{isRegistering ? "Create a new account" : "Sign in to your account"}</p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-[var(--danger)]/10 text-[var(--danger)] text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]" />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]" />
          </div>

          {isRegistering && (
            <select value={role} onChange={e => setRole(e.target.value as "Admin" | "User")} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] cursor-pointer">
              <option value="User">User (View Only)</option>
              <option value="Admin">Admin (Full Access)</option>
            </select>
          )}

          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-bold py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity">
            {isRegistering ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {isRegistering ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--muted)]">
          {isRegistering ? "Already have an account? " : "Need an account? "}
          <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(""); }} className="font-medium text-[var(--accent)] hover:underline">
            {isRegistering ? "Sign in" : "Register now"}
          </button>
        </div>

        {!isRegistering && (
          <div className="mt-3 text-center">
            <span className="text-[10px] font-mono text-[var(--muted)]">Demo: user=admin pass=password</span>
          </div>
        )}
      </div>
    </div>
  );
}
