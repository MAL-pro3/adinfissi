import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://ywmvnpuigvxdfyvxfdub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3bXZucHVpZ3Z4ZGZ5dnhmZHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTM5NjcsImV4cCI6MjA3NTU4OTk2N30.96xb8FHS1giTKjOD17367qQPRQgBbCQhchZpPUbKb40';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProfilesTable() {
  console.log('🔧 FIXING PROFILES TABLE - ADDING ROLE COLUMN');
  console.log('==============================================');
  
  console.log('\n📋 SQL COMMANDS TO EXECUTE IN SUPABASE:');
  console.log('Go to Supabase Dashboard → SQL Editor → New Query');
  console.log('Copy and paste this SQL:');
  console.log('\n' + '='.repeat(50));
  
  const sqlCommands = `
-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
CHECK (role IN ('admin', 'user'));

-- Update the specific user to admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'ediliziaedinfissi@hotmail.com';

-- Verify the update
SELECT id, email, full_name, role, created_at 
FROM public.profiles 
WHERE email = 'ediliziaedinfissi@hotmail.com';
`;

  console.log(sqlCommands);
  console.log('='.repeat(50));
  
  console.log('\n📝 STEPS TO FIX:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project: ywmvnpuigvxdfyvxfdub');
  console.log('3. Go to SQL Editor');
  console.log('4. Click "New Query"');
  console.log('5. Copy and paste the SQL above');
  console.log('6. Click "Run"');
  console.log('7. Verify the result shows role = "admin"');
  
  console.log('\n🎯 AFTER RUNNING THE SQL:');
  console.log('- The profiles table will have the role column');
  console.log('- Your user will have role = "admin"');
  console.log('- The authentication timeout will be fixed!');
  
  console.log('\n⚡ ALTERNATIVE: I can try to update via API...');
  
  try {
    // Try to authenticate first
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'ediliziaedinfissi@hotmail.com',
      password: 'Provaedilizia1'
    });

    if (authError) {
      console.log('❌ Auth failed for API update:', authError.message);
      return;
    }

    // Try to update the profile (this might fail due to column not existing)
    console.log('\n🔄 Attempting to update role via API...');
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', authData.user.id);

    if (updateError) {
      console.log('❌ API update failed (expected):', updateError.message);
      console.log('👆 This confirms the role column doesn\'t exist');
      console.log('📋 Please use the SQL commands above in Supabase Dashboard');
    } else {
      console.log('✅ API update successful! Role set to admin');
    }

  } catch (error) {
    console.log('💥 Error during API update:', error.message);
  }
}

fixProfilesTable().catch(console.error);