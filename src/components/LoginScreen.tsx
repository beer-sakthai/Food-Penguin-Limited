import React, { useState } from 'react';
import { ChefHat, Lock, User, LogIn, UserPlus } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string, role: string) => void;
  theme?: 'light' | 'dark';
}

export default function LoginScreen({ onLogin, theme = 'dark' }: LoginScreenProps) {
  const isLight = theme === 'light';
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'User'>('User');
  const [error, setError] = useState('');

  // Very basic mock storage for users
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    const usersStr = localStorage.getItem('mockUsers');
    const users = usersStr ? JSON.parse(usersStr) : [{ username: 'admin', password: 'password', role: 'Admin' }];

    if (isRegistering) {
      if (users.find((u: any) => u.username === username)) {
        setError('Username already exists');
        return;
      }
      const newUser = { username, password, role };
      localStorage.setItem('mockUsers', JSON.stringify([...users, newUser]));
      onLogin(username, role);
    } else {
      const user = users.find((u: any) => u.username === username && u.password === password);
      if (user) {
        onLogin(user.username, user.role);
      } else {
        setError('Invalid username or password');
      }
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center font-sans ${isLight ? 'bg-zinc-100' : 'bg-black'}`}>
      <div className={`w-full max-w-md p-8 gold-liner-box ${isLight ? 'bg-white shadow-zinc-200/50' : 'bg-zinc-950 shadow-amber-500/5'}`}>
        
        <div className="flex flex-col items-center justify-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border ${isLight ? 'bg-amber-100 border-amber-200 text-amber-600' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
            <ChefHat size={32} />
          </div>
          <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            Food Penguin Limited
          </h1>
          <p className={`text-sm mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {isRegistering ? 'Create a new account' : 'Sign in to your account'}
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
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                  isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white' : 'bg-zinc-900 border-zinc-800 text-white focus:bg-black'
                }`}
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                  isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white' : 'bg-zinc-900 border-zinc-800 text-white focus:bg-black'
                }`}
                placeholder="Enter password"
              />
            </div>
          </div>

          {isRegistering && (
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as 'Admin' | 'User')}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none cursor-pointer ${
                  isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white' : 'bg-zinc-900 border-zinc-800 text-white focus:bg-black'
                }`}
              >
                <option value="User">User (View Only)</option>
                <option value="Admin">Admin (Full Access)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-6 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold py-3 rounded-xl transition-all hover:-translate-y-0.5 active:scale-[0.98] focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 shadow-md shadow-amber-500/10"
          >
            {isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            {isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>



        <div className={`mt-6 pt-6 border-t text-center text-sm ${isLight ? 'border-zinc-200 text-zinc-500' : 'border-zinc-800 text-zinc-400'}`}>
          {isRegistering ? 'Already have an account? ' : 'Need an account? '}
          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="font-bold text-amber-500 hover:text-amber-400 underline transition-colors"
          >
            {isRegistering ? 'Sign in' : 'Register now'}
          </button>
        </div>
        
        {!isRegistering && (
          <div className="mt-4 text-center">
            <span className={`text-[10px] uppercase font-mono ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Demo Credentials: user=admin pass=password
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
