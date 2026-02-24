/**
 * Admin Seeder Script
 *
 * Creates the admin account in Supabase Auth + profiles table.
 * Run with: npm run seed:admin
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@flowday.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || 'Khushal Sinhmar';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

if (!ADMIN_PASSWORD) {
    console.error('❌ Missing ADMIN_PASSWORD in .env');
    process.exit(1);
}

// Use service role key for admin operations
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function seedAdmin() {
    console.log('🔧 Seeding admin account...\n');

    // Check if admin already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(u => u.email === ADMIN_EMAIL);

    if (existing) {
        console.log(`✅ Admin account already exists (${ADMIN_EMAIL})`);

        // Ensure profile has admin role
        const { error: profileErr } = await supabase
            .from('profiles')
            .upsert({
                id: existing.id,
                full_name: ADMIN_NAME,
                email: ADMIN_EMAIL,
                role: 'admin',
                status: 'active',
            }, { onConflict: 'id' });

        if (profileErr) {
            console.error('⚠️  Could not update profile:', profileErr.message);
        } else {
            console.log('✅ Admin profile confirmed with role: admin');
        }
        return;
    }

    // Create admin user
    const { data, error } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
            full_name: ADMIN_NAME,
            role: 'admin',
        },
    });

    if (error) {
        console.error('❌ Failed to create admin:', error.message);
        process.exit(1);
    }

    console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
    console.log(`   ID: ${data.user.id}`);

    // The trigger should auto-create the profile, but let's ensure the role is set
    // Wait a moment for the trigger
    await new Promise(r => setTimeout(r, 1000));

    const { error: roleErr } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', data.user.id);

    if (roleErr) {
        console.error('⚠️  Could not set admin role in profiles:', roleErr.message);
    } else {
        console.log('✅ Admin role set in profiles table');
    }

    console.log('\n🎉 Admin seeding complete!');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Name:  ${ADMIN_NAME}`);
    console.log('   Role:  admin\n');
}

seedAdmin().catch(err => {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
});
