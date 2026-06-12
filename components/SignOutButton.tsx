'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs text-white/30 hover:text-white/60 transition-colors px-2 py-1 rounded-md hover:bg-white/6"
    >
      Çıkış
    </button>
  );
}
