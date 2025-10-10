// SCRIPT PER AGGIUNGERE IL PROFILO UTENTE MANCANTE
// Versione semplificata che crea il profilo direttamente

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Leggi le variabili d'ambiente
let supabaseUrl, supabaseKey;

try {
    const envFile = readFileSync('.env', 'utf8');
    const envLines = envFile.split('\n');
    
    for (const line of envLines) {
        if (line.startsWith('VITE_SUPABASE_URL=')) {
            supabaseUrl = line.split('=')[1].trim();
        }
        if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
            supabaseKey = line.split('=')[1].trim();
        }
    }
} catch (error) {
    console.error('❌ Errore lettura file .env:', error.message);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createMissingProfile() {
    console.log('🔧 Creazione profilo per utente esistente...\n');
    
    try {
        // Prova a fare login con le credenziali fornite
        console.log('🔐 Tentativo di autenticazione...');
        
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'ediliziaedinfissi@hotmail.com',
            password: 'Provaedilizia1'
        });
        
        if (authError) {
            console.error('❌ Errore autenticazione:', authError.message);
            console.log('💡 Verifica che le credenziali siano corrette');
            return;
        }
        
        console.log('✅ Autenticazione riuscita!');
        console.log('👤 User ID:', authData.user.id);
        
        // Controlla se il profilo esiste già
        console.log('🔍 Verificando profilo esistente...');
        
        const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
        
        if (existingProfile && !profileError) {
            console.log('✅ Profilo già esistente:');
            console.log('   - ID:', existingProfile.id);
            console.log('   - Email:', existingProfile.email);
            console.log('   - Ruolo:', existingProfile.role);
            console.log('\n🎉 Il profilo esiste già! Prova a fare logout e login di nuovo.');
            return;
        }
        
        // Crea il profilo mancante
        console.log('📝 Creando profilo mancante...');
        
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                email: authData.user.email,
                role: 'admin',
                full_name: 'Edilizia e Infissi',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (insertError) {
            console.error('❌ Errore creazione profilo:', insertError.message);
            console.log('\n🔧 POSSIBILI CAUSE:');
            console.log('1. Policy RLS troppo restrittive');
            console.log('2. Permessi insufficienti');
            console.log('3. Trigger che interferiscono');
            
            console.log('\n💡 SOLUZIONE MANUALE:');
            console.log('1. Vai nel Dashboard Supabase → Table Editor → profiles');
            console.log('2. Clicca "Insert row"');
            console.log('3. Inserisci:');
            console.log(`   - id: ${authData.user.id}`);
            console.log(`   - email: ${authData.user.email}`);
            console.log('   - role: admin');
            console.log('   - full_name: Edilizia e Infissi');
            return;
        }
        
        console.log('✅ Profilo creato con successo!');
        console.log('   - ID:', newProfile.id);
        console.log('   - Email:', newProfile.email);
        console.log('   - Ruolo:', newProfile.role);
        
        // Logout per pulire la sessione
        await supabase.auth.signOut();
        
        console.log('\n🎉 PROBLEMA RISOLTO!');
        console.log('💡 Ora prova a fare il login nell\'applicazione - dovrebbe funzionare!');
        
    } catch (error) {
        console.error('❌ Errore generale:', error.message);
        console.log('\n🔧 Se il problema persiste:');
        console.log('1. Controlla le policy RLS');
        console.log('2. Verifica i permessi del database');
        console.log('3. Usa la soluzione manuale nel Dashboard Supabase');
    }
}

// Esegui lo script
createMissingProfile();