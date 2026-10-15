import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ywmvnpuigvxdfyvxfdub.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3bXZucHVpZ3Z4ZGZ5dnhmZHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTM5NjcsImV4cCI6MjA3NTU4OTk2N30.96xb8FHS1giTKjOD17367qQPRQgBbCQhchZpPUbKb40'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Using fallback Supabase configuration')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Workaround: evita l'uso di `navigator.locks` da parte di supabase-js.
    // Su alcune versioni il lock resta bloccato e fa rimanere
    // getSession()/onAuthStateChange in attesa per sempre (spinner infinito
    // al reload). Eseguiamo la callback direttamente, senza lock.
    lock: (_name, _acquireTimeout, fn) => fn()
  }
})

// Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'user'
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          surname: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          province: string | null
          tax_code: string | null
          vat_number: string | null
          status: 'PREVENTIVO_INIZIALE' | 'SOPRALLUOGO_PROGRAMMATO' | 'PREVENTIVO_UFFICIALE' | 'CONTRATTO_FIRMATO' | 'ORDINE_INVIATO' | 'ORDINE_ARRIVATO' | 'CONSEGNATO'
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          surname: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          province?: string | null
          tax_code?: string | null
          vat_number?: string | null
          status?: 'PREVENTIVO_INIZIALE' | 'SOPRALLUOGO_PROGRAMMATO' | 'PREVENTIVO_UFFICIALE' | 'CONTRATTO_FIRMATO' | 'ORDINE_INVIATO' | 'ORDINE_ARRIVATO' | 'CONSEGNATO'
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          surname?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          province?: string | null
          tax_code?: string | null
          vat_number?: string | null
          status?: 'PREVENTIVO_INIZIALE' | 'SOPRALLUOGO_PROGRAMMATO' | 'PREVENTIVO_UFFICIALE' | 'CONTRATTO_FIRMATO' | 'ORDINE_INVIATO' | 'ORDINE_ARRIVATO' | 'CONSEGNATO'
          notes?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          total_amount: number | null
          created_at: string
          updated_at: string
          due_date: string | null
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          total_amount?: number | null
          created_at?: string
          updated_at?: string
          due_date?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          total_amount?: number | null
          updated_at?: string
          due_date?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          price: number | null
          stock_quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          price?: number | null
          stock_quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          price?: number | null
          stock_quantity?: number
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          client_id: string
          client_name: string
          type: 'SOPRALLUOGO' | 'INSTALLAZIONE' | 'ASSISTENZA' | 'PRODUZIONE'
          date: string
          time: string
          status: 'PROGRAMMATO' | 'COMPLETATO'
          notes: string | null
          address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          client_name: string
          type: 'SOPRALLUOGO' | 'INSTALLAZIONE' | 'ASSISTENZA' | 'PRODUZIONE'
          date: string
          time: string
          status?: 'PROGRAMMATO' | 'COMPLETATO'
          notes?: string | null
          address: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          client_name?: string
          type?: 'SOPRALLUOGO' | 'INSTALLAZIONE' | 'ASSISTENZA' | 'PRODUZIONE'
          date?: string
          time?: string
          status?: 'PROGRAMMATO' | 'COMPLETATO'
          notes?: string | null
          address?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          number: string
          client_id: string | null
          client_name: string
          amount: number
          issue_date: string
          due_date: string
          status: 'BOZZA' | 'INVIATA' | 'PAGATA' | 'SCADUTA' | 'ANNULLATA'
          description: string | null
          notes: string | null
          payment_date: string | null
          order_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          number: string
          client_id?: string | null
          client_name: string
          amount?: number
          issue_date: string
          due_date: string
          status?: 'BOZZA' | 'INVIATA' | 'PAGATA' | 'SCADUTA' | 'ANNULLATA'
          description?: string | null
          notes?: string | null
          payment_date?: string | null
          order_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          number?: string
          client_id?: string | null
          client_name?: string
          amount?: number
          issue_date?: string
          due_date?: string
          status?: 'BOZZA' | 'INVIATA' | 'PAGATA' | 'SCADUTA' | 'ANNULLATA'
          description?: string | null
          notes?: string | null
          payment_date?: string | null
          order_id?: string | null
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity?: number
          unit_price?: number
          total?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          total?: number
          updated_at?: string
        }
      }
    }
  }
}