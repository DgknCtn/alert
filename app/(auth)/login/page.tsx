'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('E-posta veya şifre hatalı.');
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-4">
            <span className="text-white font-bold text-sm tracking-widest">V</span>
          </div>
          <h1 className="text-white text-xl font-semibold tracking-tight">VANTH</h1>
          <p className="text-white/40 text-sm mt-1">Ortak iş ve karar takibi</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                required
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-medium text-sm rounded-lg py-2.5 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
