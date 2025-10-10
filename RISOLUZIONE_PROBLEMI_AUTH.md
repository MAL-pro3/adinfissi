# 🔧 Guida alla Risoluzione dei Problemi di Autenticazione

## ✅ Stato Attuale
Il test di connessione ha confermato che:
- ✅ Connessione a Supabase: OK
- ✅ Tutte le tabelle esistono: OK
- ✅ Sistema di autenticazione: OK

## 🎯 Problema Identificato
Il problema del "caricamento infinito" dopo il login è probabilmente dovuto a:

### 1. **Mancanza di un utente admin nel sistema**
### 2. **Policy RLS che bloccano l'accesso**
### 3. **Configurazione URL di redirect**

---

## 🚀 SOLUZIONE PASSO-PASSO

### PASSO 1: Crea un Utente Admin
1. Vai nel **Dashboard Supabase** → `https://supabase.com/dashboard`
2. Seleziona il tuo progetto
3. Vai in **Authentication** → **Users**
4. Clicca **"Add user"**
5. Inserisci:
   - **Email**: `admin@adinfissi.com` (o la tua email)
   - **Password**: `password123` (o una password sicura)
   - **Confirm Password**: stessa password
6. Clicca **"Create user"**

### PASSO 2: Configura il Profilo Admin
1. Vai in **Table Editor** → **profiles**
2. Se non vedi l'utente appena creato, clicca **"Insert"** → **"Insert row"**
3. Inserisci:
   - **id**: copia l'ID dell'utente da Authentication → Users
   - **email**: stessa email dell'utente
   - **role**: `admin`
   - **full_name**: `Amministratore` (opzionale)

### PASSO 3: Verifica le Policy RLS (OPZIONALE)
Se il problema persiste, esegui questo script nel **SQL Editor**:

```sql
-- Verifica che le policy RLS siano corrette
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

Se non vedi policy, esegui il file `supabase_fix.sql` che ho creato.

### PASSO 4: Configura gli URL di Redirect
1. Vai in **Authentication** → **Settings**
2. In **Site URL** inserisci: `http://localhost:5173`
3. In **Redirect URLs** aggiungi (una per riga):
   ```
   http://localhost:5173
   http://localhost:5173/app/dashboard
   http://localhost:5173/app/login
   http://localhost:5173/**
   ```

### PASSO 5: Test del Login
1. Avvia l'applicazione: `npm run dev`
2. Vai su `http://localhost:5173/app/login`
3. Usa le credenziali dell'admin creato
4. Dovrebbe reindirizzarti automaticamente alla dashboard

---

## 🔍 DEBUGGING AVANZATO

### Se il problema persiste, controlla:

#### 1. Console del Browser
Apri **F12** → **Console** e cerca errori come:
- `Failed to fetch`
- `Invalid JWT`
- `Row Level Security`

#### 2. Network Tab
Controlla le chiamate API in **F12** → **Network**:
- Cerca chiamate a `/auth/v1/token`
- Verifica che restituiscano status 200

#### 3. Supabase Logs
Nel Dashboard Supabase → **Logs** → **Auth logs**
Cerca errori di autenticazione

---

## 🛠️ SCRIPT DI EMERGENZA

Se nulla funziona, esegui questo nel **SQL Editor** di Supabase:

```sql
-- RESET COMPLETO AUTENTICAZIONE
-- ⚠️ ATTENZIONE: Questo cancellerà tutti gli utenti esistenti

-- 1. Disabilita RLS temporaneamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Cancella tutti i profili
DELETE FROM public.profiles;

-- 3. Riabilita RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Crea un profilo admin di default
-- (Sostituisci con l'ID del tuo utente da Authentication → Users)
INSERT INTO public.profiles (id, email, role, full_name) 
VALUES (
    'YOUR_USER_ID_HERE', 
    'admin@adinfissi.com', 
    'admin', 
    'Amministratore'
);
```

---

## 📞 SUPPORTO

Se il problema persiste:

1. **Controlla i log del browser** (F12 → Console)
2. **Verifica le credenziali** nel file `.env`
3. **Controlla che il progetto Supabase sia attivo**
4. **Prova a creare un nuovo utente** nel dashboard

---

## ✨ VERIFICA FINALE

Dopo aver seguito tutti i passi:

1. ✅ Utente admin creato in Supabase
2. ✅ Profilo admin nella tabella profiles
3. ✅ URL di redirect configurati
4. ✅ Login funzionante senza loop infiniti

**Il sistema dovrebbe ora funzionare correttamente!** 🎉