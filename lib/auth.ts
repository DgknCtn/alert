import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component context — cookies can't be set here
          }
        },
      },
    }
  );
}

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getWorkspaceUser() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) redirect('/login');

  const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
  if (!dbUser) redirect('/login');

  return dbUser;
}
