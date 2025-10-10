// Browser-compatible database configuration
// This file provides database schemas and types without SQLite dependencies

export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  created_at: string;
}

export interface Client {
  id: number;
  name: string;
  surname: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  status: 'LEAD' | 'CLIENTE' | 'INATTIVO';
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Survey {
  id: number;
  client_id: number;
  title: string;
  description?: string;
  scheduled_date: string;
  duration: number;
  status: 'PROGRAMMATO' | 'COMPLETATO' | 'ANNULLATO';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamAppointment {
  id: number;
  client_id: number;
  title: string;
  description?: string;
  scheduled_date: string;
  duration: number;
  status: 'PROGRAMMATO' | 'COMPLETATO' | 'ANNULLATO';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  client_id: number;
  order_number: string;
  description: string;
  total_amount: number;
  status: 'BOZZA' | 'CONFERMATO' | 'IN_PRODUZIONE' | 'COMPLETATO' | 'ANNULLATO';
  order_date: string;
  delivery_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  client_id: number;
  order_id?: number;
  invoice_number: string;
  description: string;
  amount: number;
  status: 'BOZZA' | 'INVIATA' | 'PAGATA' | 'SCADUTA';
  issue_date: string;
  due_date: string;
  payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoicePayment {
  id: number;
  invoice_id: number;
  amount: number;
  payment_date: string;
  payment_method: 'CONTANTI' | 'BONIFICO' | 'CARTA' | 'ASSEGNO';
  notes?: string;
  created_at: string;
}

// Database initialization function (placeholder for browser environment)
export function initializeDatabase() {
  console.log('Database schemas defined for browser environment');
  // In a real application, this would initialize IndexedDB or another browser database
}

// Export a placeholder db object for compatibility
export const db = {
  pragma: () => {},
  exec: () => {},
  prepare: () => ({
    all: () => [],
    get: () => null,
    run: () => ({ changes: 0, lastInsertRowid: 0 })
  })
};

// Database statistics queries (placeholder implementations)
export const dbQueries = {
  getUserStats: () => ({
    total: 0,
    active: 0
  }),
  
  getClientStats: () => ({
    total: 0,
    leads: 0,
    clients: 0,
    inactive: 0
  }),
  
  getSurveyStats: () => ({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0
  }),
  
  getTeamAppointmentStats: () => ({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0
  }),
  
  getOrderStats: () => ({
    total: 0,
    draft: 0,
    confirmed: 0,
    in_production: 0,
    completed: 0,
    cancelled: 0,
    total_value: 0
  }),
  
  getInvoiceStats: () => ({
    total: 0,
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
    total_amount: 0,
    paid_amount: 0,
    pending_amount: 0
  })
};