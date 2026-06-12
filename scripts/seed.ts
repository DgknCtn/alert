import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { workspaces, users, notificationSettings } from '../lib/db/schema';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } }
);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const USER_1 = {
  name: process.env.SEED_USER1_NAME ?? 'Ali',
  email: process.env.SEED_USER1_EMAIL ?? 'ali@example.com',
  password: process.env.SEED_USER1_PASSWORD ?? 'changeme123',
};

const USER_2 = {
  name: process.env.SEED_USER2_NAME ?? 'Mehmet',
  email: process.env.SEED_USER2_EMAIL ?? 'mehmet@example.com',
  password: process.env.SEED_USER2_PASSWORD ?? 'changeme456',
};

const WORKSPACE_NAME = process.env.SEED_WORKSPACE_NAME ?? 'Ortak Çalışma Alanı';

async function main() {
  console.log('Seeding database...\n');

  // 1. Create workspace
  const [workspace] = await db
    .insert(workspaces)
    .values({ name: WORKSPACE_NAME })
    .returning();

  console.log(`✓ Workspace created: ${workspace.name} (${workspace.id})`);

  // 2. Create Supabase Auth users
  const authResults = await Promise.all([
    supabase.auth.admin.createUser({
      email: USER_1.email,
      password: USER_1.password,
      email_confirm: true,
    }),
    supabase.auth.admin.createUser({
      email: USER_2.email,
      password: USER_2.password,
      email_confirm: true,
    }),
  ]);

  for (const result of authResults) {
    if (result.error) {
      // If user already exists, try to fetch them
      if (result.error.message.includes('already')) {
        console.log(`  (User already exists in Auth, continuing...)`);
      } else {
        throw new Error(`Auth error: ${result.error.message}`);
      }
    }
  }

  // Fetch users from Auth to get their IDs
  const { data: authUsersList } = await supabase.auth.admin.listUsers();
  const authUser1 = authUsersList?.users.find((u) => u.email === USER_1.email);
  const authUser2 = authUsersList?.users.find((u) => u.email === USER_2.email);

  if (!authUser1 || !authUser2) {
    throw new Error('Could not find created auth users');
  }

  console.log(`✓ Auth user 1: ${authUser1.email} (${authUser1.id})`);
  console.log(`✓ Auth user 2: ${authUser2.email} (${authUser2.id})`);

  // 3. Insert users into our users table
  await db
    .insert(users)
    .values([
      {
        id: authUser1.id,
        workspaceId: workspace.id,
        name: USER_1.name,
        email: USER_1.email,
      },
      {
        id: authUser2.id,
        workspaceId: workspace.id,
        name: USER_2.name,
        email: USER_2.email,
      },
    ])
    .onConflictDoNothing();

  console.log(`✓ DB users inserted`);

  // 4. Create notification settings
  await db
    .insert(notificationSettings)
    .values({
      workspaceId: workspace.id,
      dailySummaryEnabled: false,
      dailySummaryTime: '18:00',
      timezone: 'Europe/Istanbul',
    })
    .onConflictDoNothing();

  console.log(`✓ Notification settings created`);

  console.log('\n========================================');
  console.log('Seed complete! Add this to your .env.local:');
  console.log(`WORKSPACE_ID=${workspace.id}`);
  console.log('========================================\n');
  console.log('Login credentials:');
  console.log(`  ${USER_1.name}: ${USER_1.email} / ${USER_1.password}`);
  console.log(`  ${USER_2.name}: ${USER_2.email} / ${USER_2.password}`);

  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
