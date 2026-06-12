import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getWorkspaceUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { workspaces } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import SignOutButton from '@/components/SignOutButton';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getWorkspaceUser().catch(() => redirect('/login'));

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, currentUser.workspaceId))
    .limit(1);

  if (!workspace) redirect('/login');

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <header className="border-b border-white/8 bg-[#0f0f0f]/95 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-[10px] tracking-widest">V</span>
              </div>
              <span className="font-semibold text-sm text-white/90">{workspace.name}</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              <NavLink href="/">Açık İşler</NavLink>
              <NavLink href="/completed">Tamamlananlar</NavLink>
              <NavLink href="/settings">Ayarlar</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30 hidden sm:block">{currentUser.name}</span>
            <SignOutButton />
          </div>
        </div>
        {/* Mobile nav */}
        <div className="sm:hidden border-t border-white/8 px-4 py-1.5 flex gap-1 overflow-x-auto">
          <NavLink href="/">Açık İşler</NavLink>
          <NavLink href="/completed">Tamamlananlar</NavLink>
          <NavLink href="/settings">Ayarlar</NavLink>
        </div>
      </header>
      <main className="max-w-3xl mx-auto w-full px-4 py-6">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-2.5 py-1 rounded-md text-sm text-white/50 hover:text-white/90 hover:bg-white/6 transition-all whitespace-nowrap"
    >
      {children}
    </Link>
  );
}
