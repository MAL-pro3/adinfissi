# Configurazione Supabase per AD INFISSI

## 1. Creazione Progetto Supabase

1. Vai su [supabase.com](https://supabase.com)
2. Crea un account o accedi
3. Clicca su "New Project"
4. Scegli un nome per il progetto (es. "ad-infissi")
5. Imposta una password sicura per il database
6. Seleziona la regione più vicina (Europe West per l'Italia)

## 2. Configurazione Database

1. Nel dashboard Supabase, vai alla sezione "SQL Editor"
2. Copia e incolla il contenuto del file `src/database/schema.sql`
3. Esegui lo script cliccando su "Run"

## 3. Configurazione Autenticazione

1. Vai alla sezione "Authentication" > "Settings"
2. In "Site URL" inserisci: `http://localhost:5174` (per sviluppo)
3. In "Redirect URLs" aggiungi (una per riga):
   - `http://localhost:5174/`
   - `http://localhost:5174/app/dashboard`
   - `http://localhost:5174/app/login`
   - `http://localhost:5174/**`
4. Abilita "Enable email confirmations" se desideri conferma email
5. Configura i provider di autenticazione se necessario

## 4. Configurazione Variabili d'Ambiente

1. Nel dashboard Supabase, vai a "Settings" > "API"
2. Copia i seguenti valori:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. Aggiorna il file `.env` nel progetto:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 5. Creazione Primo Utente Admin

1. Vai alla sezione "Authentication" > "Users"
2. Clicca su "Add user"
3. Inserisci email e password per l'amministratore
4. Dopo la creazione, vai alla sezione "Table Editor"
5. Apri la tabella "profiles"
6. Trova l'utente appena creato e modifica il campo "role" in "admin"

## 6. Test della Configurazione

1. Avvia il server di sviluppo: `npm run dev`
2. Vai su `http://localhost:5173/app/login`
3. Prova ad accedere con le credenziali dell'admin
4. Se tutto funziona, dovresti essere reindirizzato alla dashboard

## 7. Configurazione Storage (Opzionale)

Per caricare documenti e immagini:

1. Vai alla sezione "Storage"
2. Crea un nuovo bucket chiamato "documents"
3. Configura le policy di accesso secondo le tue esigenze

## 8. Backup e Sicurezza

- Configura backup automatici nel dashboard Supabase
- Monitora l'utilizzo delle risorse
- Configura alerting per errori e limiti

## Struttura Database Creata

### Tabelle Principali:
- **profiles**: Profili utenti estesi
- **customers**: Clienti e prospect
- **products**: Catalogo prodotti
- **orders**: Ordini e preventivi
- **order_items**: Dettagli ordini
- **appointments**: Appuntamenti
- **documents**: Documenti clienti

### Funzionalità Implementate:
- Autenticazione con Supabase Auth
- Row Level Security (RLS)
- Trigger per timestamp automatici
- Generazione automatica numeri ordine
- Indici per performance ottimali

## Troubleshooting

### Errore di connessione:
- Verifica che le variabili d'ambiente siano corrette
- Controlla che il progetto Supabase sia attivo

### Errori di autenticazione:
- Verifica le impostazioni di autenticazione
- Controlla che l'utente esista nella tabella profiles

### Errori di permessi:
- Verifica le policy RLS
- Controlla che l'utente abbia il ruolo corretto