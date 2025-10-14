import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://ywmvnpuigvxdfyvxfdub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3bXZucHVpZ3Z4ZGZ5dnhmZHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTM5NjcsImV4cCI6MjA3NTU4OTk2N30.96xb8FHS1giTKjOD17367qQPRQgBbCQhchZpPUbKb40';

// Admin credentials
const adminEmail = 'ediliziaedinfissi@hotmail.com';
const adminPassword = 'Provaedilizia1';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSupabaseIssue() {
  console.log('🔍 DEBUGGING SUPABASE AUTHENTICATION ISSUE');
  console.log('==========================================');
  
  try {
    // Step 1: Test basic connection
    console.log('\n1️⃣ Testing basic Supabase connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.log('❌ Basic connection failed:', healthError.message);
      console.log('Error details:', healthError);
      
      // Check if table exists
      if (healthError.code === 'PGRST116' || healthError.message.includes('relation "public.profiles" does not exist')) {
        console.log('\n🚨 PROBLEM IDENTIFIED: profiles table does not exist!');
        await createProfilesTable();
      } else if (healthError.code === 'PGRST301') {
        console.log('\n🚨 PROBLEM IDENTIFIED: RLS policy issue!');
        await fixRLSPolicies();
      }
    } else {
      console.log('✅ Basic connection successful');
    }

    // Step 2: Test authentication
    console.log('\n2️⃣ Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    if (authError) {
      console.log('❌ Authentication failed:', authError.message);
      return;
    }

    console.log('✅ Authentication successful');
    console.log('User ID:', authData.user.id);

    // Step 3: Test profile fetch with authenticated user
    console.log('\n3️⃣ Testing profile fetch...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.log('❌ Profile fetch failed:', profileError.message);
      
      if (profileError.code === 'PGRST116') {
        console.log('🔧 Creating profile for user...');
        await createUserProfile(authData.user);
      }
    } else {
      console.log('✅ Profile found:', profile);
      
      if (profile.role !== 'admin') {
        console.log('🔧 Updating user role to admin...');
        await updateUserRole(authData.user.id, 'admin');
      }
    }

    console.log('\n🎉 DIAGNOSIS COMPLETE!');
    
  } catch (error) {
    console.log('💥 Unexpected error:', error);
  }
}

async function createProfilesTable() {
  console.log('\n🔧 Creating profiles table...');
  
  // This would need to be run in Supabase SQL editor
  const createTableSQL = `
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

  console.log('📋 SQL to execute in Supabase:');
  console.log(createTableSQL);
}

async function createUserProfile(user) {
  console.log('🔧 Creating user profile...');
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || 'Admin User',
      role: 'admin'
    });

  if (error) {
    console.log('❌ Failed to create profile:', error.message);
  } else {
    console.log('✅ Profile created successfully');
  }
}

async function updateUserRole(userId, role) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.log('❌ Failed to update role:', error.message);
  } else {
    console.log('✅ Role updated to admin');
  }
}

async function fixRLSPolicies() {
  console.log('\n🔧 RLS policies need to be fixed in Supabase SQL editor');
  
  const rlsSQL = `
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Recreate policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
`;

  console.log('📋 SQL to execute in Supabase:');
  console.log(rlsSQL);
}

// Run the debug
debugSupabaseIssue().catch(console.error);