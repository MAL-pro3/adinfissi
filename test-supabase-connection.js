// SCRIPT DI TEST PER VERIFICARE LA CONNESSIONE SUPABASE
// Esegui con: node test-supabase-connection.js

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Leggi le variabili d'ambiente dal file .env
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
}

console.log('🔍 Verificando configurazione Supabase...\n');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERRORE: Variabili d\'ambiente mancanti!');
    console.log('Assicurati che .env contenga:');
    console.log('VITE_SUPABASE_URL=https://your-project.supabase.co');
    console.log('VITE_SUPABASE_ANON_KEY=your-anon-key');
    process.exit(1);
}

console.log('✅ Variabili d\'ambiente trovate');
console.log(`📍 URL: ${supabaseUrl}`);
console.log(`🔑 Key: ${supabaseKey.substring(0, 20)}...`);

// Crea client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        console.log('\n🔗 Testando connessione al database...');
        
        // Test 1: Connessione base
        const { data, error } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
            
        if (error) {
            console.error('❌ Errore connessione database:', error.message);
            
            if (error.message.includes('relation "public.profiles" does not exist')) {
                console.log('\n💡 SOLUZIONE: La tabella profiles non esiste!');
                console.log('1. Vai nel SQL Editor di Supabase');
                console.log('2. Esegui il file supabase_fix.sql');
                console.log('3. Riprova questo test');
            }
            
            return false;
        }
        
        console.log('✅ Connessione database OK');
        
        // Test 2: Verifica tabelle
        console.log('\n📋 Verificando tabelle...');
        
        const tables = ['profiles', 'customers', 'appointments', 'orders', 'products'];
        
        for (const table of tables) {
            try {
                const { error: tableError } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1);
                    
                if (tableError) {
                    console.log(`❌ Tabella ${table}: ${tableError.message}`);
                } else {
                    console.log(`✅ Tabella ${table}: OK`);
                }
            } catch (err) {
                console.log(`❌ Tabella ${table}: Errore di connessione`);
            }
        }
        
        // Test 3: Verifica autenticazione
        console.log('\n🔐 Testando autenticazione...');
        
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
            console.log('❌ Errore autenticazione:', authError.message);
        } else {
            console.log('✅ Sistema di autenticazione: OK');
            
            if (authData.session) {
                console.log('👤 Utente attualmente loggato:', authData.session.user.email);
            } else {
                console.log('👤 Nessun utente loggato (normale per questo test)');
            }
        }
        
        console.log('\n🎉 Test completato!');
        console.log('\n📝 PROSSIMI PASSI:');
        console.log('1. Se ci sono errori, esegui supabase_fix.sql');
        console.log('2. Crea un utente admin nel dashboard Supabase');
        console.log('3. Prova il login nell\'applicazione');
        
        return true;
        
    } catch (error) {
        console.error('❌ Errore generale:', error.message);
        return false;
    }
}

// Esegui il test
testConnection().then(success => {
    process.exit(success ? 0 : 1);
});