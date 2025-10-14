import { createClient } from '@supabase/supabase-js';

// Supabase configuration (from .env)
const supabaseUrl = 'https://ywmvnpuigvxdfyvxfdub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3bXZucHVpZ3Z4ZGZ5dnhmZHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTM5NjcsImV4cCI6MjA3NTU4OTk2N30.96xb8FHS1giTKjOD17367qQPRQgBbCQhchZpPUbKb40';

// Admin credentials
const adminEmail = 'ediliziaedinfissi@hotmail.com';
const adminPassword = 'Provaedilizia1';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteAuthFlow() {
  console.log('🔍 TESTING COMPLETE AUTHENTICATION FLOW');
  console.log('=====================================');
  console.log('Reproducing the exact same flow as the app...\n');
  
  try {
    // Step 1: Sign in
    console.log('1️⃣ Signing in...');
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
    console.log('Email:', authData.user.email);

    // Step 2: Test connectivity (like in the app)
    console.log('\n2️⃣ Testing Supabase connectivity...');
    const connectivityStart = Date.now();
    
    try {
      const { data: connectivityData, error: connectivityError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      const connectivityTime = Date.now() - connectivityStart;
      
      if (connectivityError) {
        console.log('❌ Connectivity test failed:', connectivityError.message);
        console.log('Error code:', connectivityError.code);
        console.log('Error details:', connectivityError);
      } else {
        console.log('✅ Connectivity test successful');
        console.log('Time taken:', connectivityTime + 'ms');
        console.log('Result:', connectivityData);
      }
    } catch (connectivityErr) {
      console.log('💥 Connectivity test threw error:', connectivityErr.message);
    }

    // Step 3: Fetch user profile (the main operation)
    console.log('\n3️⃣ Fetching user profile...');
    const profileStart = Date.now();
    
    // Create a timeout promise (10 seconds like in the app)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile fetch timeout')), 10000);
    });
    
    // Create the profile fetch promise
    const profilePromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    console.log('⏱️ Starting race between profile fetch and 10s timeout...');
    
    try {
      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]);
      
      const profileTime = Date.now() - profileStart;
      
      if (profileError) {
        console.log('❌ Profile fetch failed:', profileError.message);
        console.log('Error code:', profileError.code);
        console.log('Time taken:', profileTime + 'ms');
      } else {
        console.log('✅ Profile fetch successful');
        console.log('Time taken:', profileTime + 'ms');
        console.log('Profile data:', profile);
        
        // Check role
        if (profile.role === 'admin') {
          console.log('✅ User has admin role');
        } else {
          console.log('❌ User role is:', profile.role);
        }
      }
    } catch (timeoutError) {
      const profileTime = Date.now() - profileStart;
      console.log('⏰ TIMEOUT OCCURRED!');
      console.log('Time taken:', profileTime + 'ms');
      console.log('Error:', timeoutError.message);
      
      // Try to get the actual result without timeout
      console.log('\n🔄 Trying profile fetch without timeout...');
      try {
        const { data: profileNoTimeout, error: profileNoTimeoutError } = await profilePromise;
        if (profileNoTimeoutError) {
          console.log('❌ Profile fetch (no timeout) failed:', profileNoTimeoutError.message);
        } else {
          console.log('✅ Profile fetch (no timeout) successful:', profileNoTimeout);
        }
      } catch (err) {
        console.log('💥 Profile fetch (no timeout) threw error:', err.message);
      }
    }

    // Step 4: Test direct query performance
    console.log('\n4️⃣ Testing direct query performance...');
    const queries = [
      { name: 'Simple count', query: () => supabase.from('profiles').select('count').limit(1) },
      { name: 'Select all profiles', query: () => supabase.from('profiles').select('*') },
      { name: 'Select by ID', query: () => supabase.from('profiles').select('*').eq('id', authData.user.id) },
      { name: 'Select by email', query: () => supabase.from('profiles').select('*').eq('email', adminEmail) }
    ];

    for (const test of queries) {
      const start = Date.now();
      try {
        const { data, error } = await test.query();
        const time = Date.now() - start;
        
        if (error) {
          console.log(`❌ ${test.name}: ${error.message} (${time}ms)`);
        } else {
          console.log(`✅ ${test.name}: Success (${time}ms) - ${Array.isArray(data) ? data.length : 1} records`);
        }
      } catch (err) {
        const time = Date.now() - start;
        console.log(`💥 ${test.name}: ${err.message} (${time}ms)`);
      }
    }

    console.log('\n🎯 ANALYSIS COMPLETE!');
    
  } catch (error) {
    console.log('💥 Unexpected error:', error);
  }
}

testCompleteAuthFlow().catch(console.error);