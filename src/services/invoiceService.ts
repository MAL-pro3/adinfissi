import { supabase } from './supabase';

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string | null;
  client_name: string;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  invoice_date: string;
  due_date: string;
  status: 'BOZZA' | 'INVIATA' | 'PAGATA' | 'SCADUTA' | 'ANNULLATA';
  description: string | null;
  notes: string | null;
  payment_date: string | null;
  order_id: string | null;
  created_at: string;
  updated_at: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceFormData {
  client_id: string;
  client_name: string;
  issue_date: string;
  due_date: string;
  description: string;
  notes?: string;
  order_id?: string;
  items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at' | 'updated_at'>[];
}

export interface InvoiceStats {
  total: number;
  totalAmount: number;
  byStatus: Record<string, number>;
  thisMonth: number;
  thisMonthAmount: number;
  overdue: number;
  overdueAmount: number;
}

class InvoiceServiceClass {
  // Genera numero fattura automatico
  async generateInvoiceNumber(): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('generate_invoice_number');
      if (error) throw error;
      return data || `${new Date().getFullYear()}-0001`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback: genera numero manualmente
      const year = new Date().getFullYear();
      const { data: invoices } = await supabase
        .from('invoices')
        .select('number')
        .like('number', `${year}-%`)
        .order('number', { ascending: false })
        .limit(1);
      
      if (invoices && invoices.length > 0) {
        const lastNumber = parseInt(invoices[0].number.split('-')[1]) || 0;
        return `${year}-${String(lastNumber + 1).padStart(4, '0')}`;
      }
      return `${year}-0001`;
    }
  }

  // Ottieni tutte le fatture con le righe
  async getAllInvoices(): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  // Ottieni fattura per ID
  async getInvoiceById(id: string): Promise<Invoice | null> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }
  }

  // Crea nuova fattura
  async createInvoice(invoiceData: InvoiceFormData): Promise<Invoice | null> {
    try {
      // Calcola totale (importo già netto)
      const amount = invoiceData.items.reduce((sum, item) => sum + item.total, 0);

      // Genera numero fattura
      const number = await this.generateInvoiceNumber();

      // Crea fattura
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          number,
          client_id: invoiceData.client_id,
          client_name: invoiceData.client_name,
          amount,
          issue_date: invoiceData.issue_date,
          due_date: invoiceData.due_date,
          description: invoiceData.description,
          notes: invoiceData.notes,
          order_id: invoiceData.order_id,
          status: 'BOZZA'
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Crea righe fattura
      if (invoiceData.items.length > 0) {
        const items = invoiceData.items.map(item => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      return await this.getInvoiceById(invoice.id);
    } catch (error) {
      console.error('Error creating invoice:', error);
      return null;
    }
  }

  // Aggiorna fattura
  async updateInvoice(id: string, updates: Partial<InvoiceFormData>): Promise<Invoice | null> {
    try {
      // Se ci sono items da aggiornare, gestiscili separatamente
      const { items, ...invoiceUpdates } = updates;

      // Aggiorna fattura
      if (Object.keys(invoiceUpdates).length > 0) {
        const { error: invoiceError } = await supabase
          .from('invoices')
          .update(invoiceUpdates)
          .eq('id', id);

        if (invoiceError) throw invoiceError;
      }

      // Aggiorna items se forniti
      if (items) {
        // Elimina items esistenti
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', id);

        // Inserisci nuovi items
        if (items.length > 0) {
          const newItems = items.map(item => ({
            invoice_id: id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total
          }));

          const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(newItems);

          if (itemsError) throw itemsError;
        }
      }

      return await this.getInvoiceById(id);
    } catch (error) {
      console.error('Error updating invoice:', error);
      return null;
    }
  }

  // Elimina fattura
  async deleteInvoice(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return false;
    }
  }

  // Aggiorna stato fattura
  async updateInvoiceStatus(id: string, status: Invoice['status'], paymentDate?: string): Promise<boolean> {
    try {
      // Prima ottieni i dati della fattura per recuperare l'order_id
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('order_id')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const updates: any = { status };
      if (status === 'PAGATA' && paymentDate) {
        updates.payment_date = paymentDate;
      }

      const { error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Se la fattura è stata pagata e ha un order_id associato, aggiorna lo stato dell'ordine
      if (status === 'PAGATA' && invoice?.order_id) {
        const { OrderService } = await import('./orderService');
        await OrderService.updateOrderPaymentFromInvoices(invoice.order_id);
      }

      return true;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      return false;
    }
  }

  // Ottieni statistiche fatture
  async getInvoiceStats(): Promise<InvoiceStats> {
    try {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('status, amount, issue_date');

      if (error) throw error;

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const stats: InvoiceStats = {
        total: invoices?.length || 0,
        totalAmount: 0,
        byStatus: {},
        thisMonth: 0,
        thisMonthAmount: 0,
        overdue: 0,
        overdueAmount: 0
      };

      invoices?.forEach(invoice => {
        stats.totalAmount += invoice.amount || 0;
        stats.byStatus[invoice.status] = (stats.byStatus[invoice.status] || 0) + 1;

        const issueDate = new Date(invoice.issue_date);
        if (issueDate >= thisMonth) {
          stats.thisMonth++;
          stats.thisMonthAmount += invoice.amount || 0;
        }

        // Calcola scadute (status INVIATA e data scadenza passata)
        if (invoice.status === 'INVIATA') {
          // Assumiamo 30 giorni di scadenza dalla data emissione
          const dueDate = new Date(issueDate);
          dueDate.setDate(dueDate.getDate() + 30);
          
          if (dueDate < now) {
            stats.overdue++;
            stats.overdueAmount += invoice.amount || 0;
          }
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
      return {
        total: 0,
        totalAmount: 0,
        byStatus: {},
        thisMonth: 0,
        thisMonthAmount: 0,
        overdue: 0,
        overdueAmount: 0
      };
    }
  }

  // Cerca fatture
  async searchInvoices(searchTerm: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .or(`number.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching invoices:', error);
      return [];
    }
  }

  // Ottieni fatture per cliente
  async getInvoicesByCustomer(clientId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching customer invoices:', error);
      return [];
    }
  }

  // Ottieni fatture per ordine
  async getInvoicesByOrder(orderId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching order invoices:', error);
      return [];
    }
  }
}

export const InvoiceService = new InvoiceServiceClass();