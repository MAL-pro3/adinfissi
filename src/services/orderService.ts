import { supabase } from './supabase';
import { Order, OrderStatus, PaymentStatus } from '../types';

export class OrderService {
  static async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Errore nel recupero degli ordini:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Errore nel recupero degli ordini:', error);
      return [];
    }
  }

  static async getOrderById(id: number): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id.toString())
        .single();

      if (error) {
        console.error('Errore nel recupero dell\'ordine:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Errore nel recupero dell\'ordine:', error);
      return null;
    }
  }

  static async createOrder(orderData: {
    client_id: string;
    client_name: string;
    description: string;
    total_amount: number;
    order_date: string;
    delivery_date?: string;
    status?: OrderStatus;
    notes?: string;
  }): Promise<Order | null> {
    try {
      // Generate order number
      const orderNumber = await this.generateOrderNumber();
      
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          client_id: orderData.client_id,
          client_name: orderData.client_name,
          order_number: orderNumber,
          title: orderData.description, // Use description as title for now
          description: orderData.description,
          total_amount: orderData.total_amount,
          order_date: orderData.order_date,
          delivery_date: orderData.delivery_date || null,
          status: orderData.status || 'BOZZA',
          notes: orderData.notes || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Errore nella creazione dell\'ordine:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Errore nella creazione dell\'ordine:', error);
      return null;
    }
  }

  static async updateOrder(id: number, updates: {
    description?: string;
    total_amount?: number;
    delivery_date?: string;
    status?: OrderStatus;
    notes?: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          description: updates.description,
          total_amount: updates.total_amount,
          delivery_date: updates.delivery_date,
          status: updates.status,
          notes: updates.notes
        })
        .eq('id', id.toString());

      if (error) {
        console.error('Errore nell\'aggiornamento dell\'ordine:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Errore nell\'aggiornamento dell\'ordine:', error);
      return false;
    }
  }

  static updateOrderPayment(orderId: number, newPaidAmount: number): boolean {
    try {
      const order = this.getOrderById(orderId);
      if (!order) return false;

      const remaining_amount = order.total_amount - newPaidAmount;
      
      let payment_status: PaymentStatus;
      if (newPaidAmount === 0) {
        payment_status = 'NON_PAGATO';
      } else if (newPaidAmount >= order.total_amount) {
        payment_status = 'COMPLETAMENTE_PAGATO';
      } else {
        payment_status = 'PARZIALMENTE_PAGATO';
      }

      const result = queries.updateOrderPayment.run(
        newPaidAmount,
        remaining_amount,
        payment_status,
        orderId
      );

      return result.changes > 0;
    } catch (error) {
      console.error('Errore nell\'aggiornamento del pagamento dell\'ordine:', error);
      return false;
    }
  }

  static calculateOrderPaymentFromInvoices(orderId: number): number {
    try {
      const invoices = queries.getInvoicesByOrderId.all(orderId) as any[];
      return invoices
        .filter(invoice => invoice.status === 'PAID')
        .reduce((total, invoice) => total + invoice.total_amount, 0);
    } catch (error) {
      console.error('Errore nel calcolo dei pagamenti dell\'ordine:', error);
      return 0;
    }
  }

  static async calculatePaymentFromInvoices(orderId: number): Promise<number> {
    try {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('amount')
        .eq('order_id', orderId)
        .eq('status', 'PAGATA');

      if (error) {
        console.error('Errore nel recupero delle fatture per il calcolo dei pagamenti:', error);
        return 0;
      }

      return invoices?.reduce((total, invoice) => total + (invoice.amount || 0), 0) || 0;
    } catch (error) {
      console.error('Errore nel calcolo dei pagamenti dalle fatture:', error);
      return 0;
    }
  }

  static async updateOrderPaymentFromInvoices(orderId: number): Promise<boolean> {
    try {
      // Prima ottieni l'ordine da Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        console.error('Errore nel recupero dell\'ordine:', orderError);
        return false;
      }

      // Calcola il totale pagato dalle fatture
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('amount')
        .eq('order_id', orderId)
        .eq('status', 'PAGATA');

      if (invoicesError) {
        console.error('Errore nel recupero delle fatture:', invoicesError);
        return false;
      }

      const paidAmount = invoices?.reduce((total, invoice) => total + (invoice.amount || 0), 0) || 0;
      const remainingAmount = order.total_amount - paidAmount;
      const paymentPercentage = order.total_amount > 0 ? Math.round((paidAmount / order.total_amount) * 100) : 0;
      
      let paymentStatus: PaymentStatus;
      if (paidAmount === 0) {
        paymentStatus = 'NON_PAGATO';
      } else if (paidAmount >= order.total_amount) {
        paymentStatus = 'COMPLETAMENTE_PAGATO';
      } else {
        paymentStatus = 'PARZIALMENTE_PAGATO';
      }

      // Aggiorna l'ordine in Supabase
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          paid_amount: paidAmount,
          remaining_amount: remainingAmount,
          payment_percentage: paymentPercentage,
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Errore nell\'aggiornamento dell\'ordine:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Errore nell\'aggiornamento automatico dei pagamenti:', error);
      return false;
    }
  }

  static async generateOrderNumber(): Promise<string> {
    try {
      const year = new Date().getFullYear();
      
      // Get orders for current year from Supabase
      const { data: orders, error } = await supabase
        .from('orders')
        .select('order_number')
        .like('order_number', `ORD-${year}-%`)
        .order('order_number', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Errore nel recupero degli ordini per generare numero:', error);
        return `ORD-${year}-0001`;
      }

      let nextNumber = 1;
      if (orders && orders.length > 0) {
        const lastOrderNumber = orders[0].order_number;
        const lastNumber = parseInt(lastOrderNumber.split('-')[2]) || 0;
        nextNumber = lastNumber + 1;
      }

      return `ORD-${year}-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Errore nella generazione del numero ordine:', error);
      return `ORD-${new Date().getFullYear()}-0001`;
    }
  }

  static getOrdersByPaymentStatus(status: PaymentStatus): Order[] {
    try {
      const orders = this.getAllOrders();
      return orders.filter(order => order.payment_status === status);
    } catch (error) {
      console.error('Errore nel filtro degli ordini per stato pagamento:', error);
      return [];
    }
  }
}