import React, { useState } from 'react';
import { ChefHat, Lock, User, LogIn } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string, role: string) => void;
  theme?: 'light' | 'dark';
}

export default function LoginScreen({ onLogin, theme = 'dark' }: LoginScreenProps) {
  const isLight = theme === 'light';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Demo-only local sign-in. Production roles must come from a real
  // authentication provider, not from a browser-controlled picker.
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (username === 'demo' && password === 'password') {
      onLogin('Demo User', 'User');
      return;
    }

    setError('Invalid demo credentials');
  };

  return (
    <div className={`h-full w-full flex items-center justify-center font-sans ${isLight ? 'bg-zinc-100' : 'bg-black'}`}>
      <div className={`w-full max-w-md p-8 gold-liner-box ${isLight ? 'bg-white shadow-zinc-200/50' : 'bg-zinc-950 shadow-amber-500/5'}`}>
        
        <div className="flex flex-col items-center justify-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border ${isLight ? 'bg-amber-100 border-amber-200 text-amber-600' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
            <ChefHat size={32} />
          </div>
          <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            Food Penguin Limited
          </h1>
          <p className={`text-sm mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Username</label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`} />
              <input className={`input-gold-glow w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_15px_rgba(234,179,8,0.3)] ${ isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white' : 'bg-zinc-900 border-zinc-800 text-white focus:bg-black' }`} type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username"/>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`} />
              <input className={`input-gold-glow w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_15px_rgba(234,179,8,0.3)] ${ isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white' : 'bg-zinc-900 border-zinc-800 text-white focus:bg-black' }`} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password"/>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold py-3 rounded-xl transition-all hover:-translate-y-0.5 active:scale-[0.98] focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 shadow-md shadow-amber-500/10 btn-interactive"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
        </form>

        {(
          <div className="mt-4 text-center">
            <span className={`text-xs uppercase font-mono ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Demo Credentials: user=demo pass=password (User role only)
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
