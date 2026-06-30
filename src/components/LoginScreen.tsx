import React, { useState } from 'react';
import { ChefHat, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, auth } from '../firebase';

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

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      const provider = new GoogleAuthProvider();
      // Enforce custom parameters if needed
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        onLogin(result.user.displayName || result.user.email || 'Google User', 'Admin');
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err.message || 'Google Sign-In failed');
    }
  };

  // Very basic mock storage for users
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    const usersStr = localStorage.getItem('mockUsers');
    const users = usersStr ? JSON.parse(usersStr) : [];

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

        {!isRegistering && (
          <>
            <div className="relative my-5 flex py-1 items-center">
              <div className={`flex-grow border-t ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}></div>
              <span className={`flex-shrink mx-4 text-[10px] font-mono font-bold uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>Or Corporate Auth</span>
              <div className={`flex-grow border-t ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl border font-bold transition-all hover:-translate-y-0.5 active:scale-[0.98] focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none ${
                isLight 
                  ? 'bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50 hover:shadow-lg hover:shadow-yellow-500/5' 
                  : 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-850 hover:shadow-lg hover:shadow-yellow-500/10'
              }`}
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.65 14.99 1 12 1 7.35 1 3.39 3.65 1.41 7.5l3.83 2.97c.91-2.73 3.46-4.43 6.76-4.43z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.44-1.09 2.66-2.31 3.48l3.58 2.78c2.09-1.93 3.78-4.78 3.78-8.36z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.24 14.53c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18L1.41 7.5C.51 9.3.01 11.3.01 13.43c0 2.13.5 4.13 1.4 5.93l3.83-2.83z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.58-2.78c-.99.66-2.26 1.05-3.58 1.05-3.3 0-5.85-2.14-6.76-4.87l-3.83 2.97C3.39 20.35 7.35 23 12 23z"
                />
              </svg>
              Sign in with Google
            </button>
          </>
        )}

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

      </div>
    </div>
  );
}
