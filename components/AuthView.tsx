
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Music4, ChevronLeft } from 'lucide-react';
import { supabase } from '../services/supabase';

interface AuthViewProps {
  onLogin: () => void;
  onBack?: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, onBack }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        });
        if (error) throw error;
        alert('Cek email Anda untuk konfirmasi pendaftaran!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000] flex items-center justify-center p-6 font-sans overflow-hidden z-[200]">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
      </div>

      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 z-20 flex items-center gap-2 text-gray-500 hover:text-white transition-all group"
        >
          <div className="p-2 rounded-full bg-white/5 border border-white/5 group-hover:border-white/20 transition-all">
            <ChevronLeft size={20} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Back to Player</span>
        </button>
      )}

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-cyan-600 text-black mb-6 shadow-xl shadow-green-500/20">
            <Music4 size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white mb-2">Rampfor</h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
            {isRegistering ? 'Create your account' : 'Welcome back streamer'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-white/[0.08] transition-all active:scale-[0.98] text-white disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <span className="animate-pulse">Connecting...</span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-white/5"></div>
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">or email</span>
            <div className="h-[1px] flex-1 bg-white/5"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" size={20} />
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-[#0d0d0d] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-green-500/50 transition-all text-sm font-medium placeholder:text-gray-700"
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" size={20} />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full bg-[#0d0d0d] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-green-500/50 transition-all text-sm font-medium placeholder:text-gray-700"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" size={20} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-[#0d0d0d] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-green-500/50 transition-all text-sm font-medium placeholder:text-gray-700"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-[0.98] shadow-2xl shadow-white/5 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Log In')}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-gray-500 hover:text-white text-xs font-bold transition-colors"
          >
            {isRegistering ? 'Already have an account? Log In' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
