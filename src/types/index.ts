// Tipi per l'applicazione gestionale

export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  created_at: string;
}

export type ClientStatus = 
  | 'PREVENTIVO_INIZIALE'
  | 'SOPRALLUOGO_PROGRAMMATO'
  | 'PREVENTIVO_UFFICIALE'
  | 'CONTRATTO_FIRMATO'
  | 'ORDINE_INVIATO'
  | 'ORDINE_ARRIVATO'
  | 'CONSEGNATO';

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  PREVENTIVO_INIZIALE: 'Preventivo Iniziale',
  SOPRALLUOGO_PROGRAMMATO: 'Sopralluogo Programmato',
  PREVENTIVO_UFFICIALE: 'Preventivo Ufficiale',
  CONTRATTO_FIRMATO: 'Contratto Firmato',
  ORDINE_INVIATO: 'Ordine Inviato',
  ORDINE_ARRIVATO: 'Ordine Arrivato',
  CONSEGNATO: 'Consegnato'
};

export interface Client {
  id: number;
  name: string;
  surname: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  status: ClientStatus;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 
  | 'BOZZA'
  | 'IN_PRODUZIONE'
  | 'CONSEGNATO';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  BOZZA: 'Bozza',
  IN_PRODUZIONE: 'In Produzione',
  CONSEGNATO: 'Consegnato'
};

export type PaymentStatus = 
  | 'NON_PAGATO'
  | 'PARZIALMENTE_PAGATO'
  | 'COMPLETAMENTE_PAGATO';

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  NON_PAGATO: 'Non Pagato',
  PARZIALMENTE_PAGATO: 'Parzialmente Pagato',
  COMPLETAMENTE_PAGATO: 'Completamente Pagato'
};

export interface Order {
  id: number;
  client_id: number;
  client_name: string;
  order_number: string;
  description: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_percentage: number;
  order_date: string;
  delivery_date?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  notes?: string;
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
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  created_at: string;
  // Joined fields
  name?: string;
  surname?: string;
}

export type TeamAppointmentCategory = 'MONTAGGIO' | 'RIPARAZIONE' | 'PRODUZIONE';

export interface TeamAppointment {
  id: number;
  client_id: number;
  title: string;
  description?: string;
  category: TeamAppointmentCategory;
  scheduled_date: string;
  duration: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  team_members?: string;
  notes?: string;
  created_at: string;
  // Joined fields
  name?: string;
  surname?: string;
}

export interface Invoice {
  id: number;
  client_id: number;
  order_id?: number;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  issue_date: string;
  due_date?: string;
  notes?: string;
  created_at: string;
  // Joined fields
  name?: string;
  surname?: string;
}

export interface InvoicePayment {
  id: number;
  invoice_id: number;
  amount: number;
  payment_date: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
}

// Tipi per la gestione documenti
export interface ClientDocument {
  id: string;
  client_id: string; // Changed to string to match Supabase UUID
  user_id: string; // Added for Supabase auth
  file_name: string; // Renamed from 'name' to match database
  file_path: string; // Storage path in Supabase bucket
  file_size: number; // Renamed from 'size' to match database
  mime_type: string; // Renamed from 'type' to match database
  category: DocumentCategory;
  notes?: string;
  created_at: string; // Renamed from 'uploaded_at' to match database
  updated_at: string; // Added for consistency
  // Computed properties for UI
  download_url?: string; // Will be generated when needed
  thumbnail_url?: string; // Will be generated for images when needed
}

export type DocumentCategory = 
  | 'PREVENTIVO'
  | 'CONTRATTO'
  | 'FATTURA'
  | 'FOTO'
  | 'DOCUMENTO_IDENTITA'
  | 'ALTRO';

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  PREVENTIVO: 'Preventivo',
  CONTRATTO: 'Contratto',
  FATTURA: 'Fattura',
  FOTO: 'Foto',
  DOCUMENTO_IDENTITA: 'Documento Identità',
  ALTRO: 'Altro'
};

export interface ClientStats {
  status: ClientStatus;
  count: number;
}

// Tipi per i form
export interface ClientFormData {
  name: string;
  surname: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  status: ClientStatus;
  notes: string;
}

export interface SurveyFormData {
  client_id: number;
  title: string;
  description: string;
  scheduled_date: string;
  duration: number;
  notes: string;
}

export interface TeamAppointmentFormData {
  client_id: number;
  title: string;
  description: string;
  category: TeamAppointmentCategory;
  scheduled_date: string;
  duration: number;
  team_members: string;
  notes: string;
}

export interface InvoiceFormData {
  client_id: number;
  invoice_number: string;
  total_amount: number;
  issue_date: string;
  due_date: string;
  notes: string;
}

// Costanti per le opzioni
export const CLIENT_STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: 'LEAD', label: 'Lead - Cliente potenziale' },
  { value: 'PREVENTIVO_INIZIALE', label: 'Preventivo iniziale inviato' },
  { value: 'SOPRALLUOGO_PROGRAMMATO', label: 'Sopralluogo programmato' },
  { value: 'SOPRALLUOGO_COMPLETATO', label: 'Sopralluogo completato' },
  { value: 'PREVENTIVO_UFFICIALE', label: 'Preventivo ufficiale inviato' },
  { value: 'CONTRATTO_FIRMATO', label: 'Contratto firmato' },
  { value: 'ORDINE_INVIATO', label: 'Ordine inviato' },
  { value: 'ORDINE_ARRIVATO', label: 'Ordine arrivato' },
  { value: 'INSTALLAZIONE_COMPLETATA', label: 'Installazione completata' },
  { value: 'ARCHIVIATO', label: 'Archiviato' }
];

export const TEAM_APPOINTMENT_CATEGORIES: { value: TeamAppointmentCategory; label: string }[] = [
  { value: 'MONTAGGIO', label: 'Montaggio' },
  { value: 'RIPARAZIONE', label: 'Riparazione' },
  { value: 'PRODUZIONE', label: 'Produzione' }
];