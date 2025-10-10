import { supabase } from './supabase';
import { Client, ClientFormData, ClientStatus } from '../types';

export class ClientService {
  // Ottieni tutti i clienti
  static async getAllClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Errore nel recuperare i clienti:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Errore nel recuperare i clienti:', error);
      return [];
    }
  }

  // Ottieni solo i clienti attivi
  static async getActiveClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Errore nel recuperare i clienti attivi:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Errore nel recuperare i clienti attivi:', error);
      return [];
    }
  }

  // Ottieni un cliente per ID
  static async getClientById(id: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Errore nel recuperare il cliente:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Errore nel recuperare il cliente:', error);
      return null;
    }
  }

  // Crea un nuovo cliente
  static async createClient(clientData: ClientFormData): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        console.error('Errore nella creazione del cliente:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Errore nella creazione del cliente:', error);
      return null;
    }
  }

  // Aggiorna un cliente esistente
  static async updateClient(id: string, clientData: Partial<ClientFormData>): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          ...clientData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Errore nell\'aggiornamento del cliente:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Errore nell\'aggiornamento del cliente:', error);
      return null;
    }
  }

  // Elimina un cliente
  static async deleteClient(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Errore nell\'eliminazione del cliente:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Errore nell\'eliminazione del cliente:', error);
      return false;
    }
  }

  // Cerca clienti per nome, email o telefono
  static async searchClients(searchTerm: string): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Errore nella ricerca dei clienti:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Errore nella ricerca dei clienti:', error);
      return [];
    }
  }

  // Aggiorna lo status di un cliente
  static async updateClientStatus(id: string, status: ClientStatus): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Errore nell\'aggiornamento dello status del cliente:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Errore nell\'aggiornamento dello status del cliente:', error);
      return false;
    }
  }

  // Disattiva un cliente (imposta is_active = false)
  static async deactivateClient(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Errore nella disattivazione del cliente:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Errore nella disattivazione del cliente:', error);
      return false;
    }
  }

  // Riattiva un cliente (imposta is_active = true)
  static async reactivateClient(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Errore nella riattivazione del cliente:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Errore nella riattivazione del cliente:', error);
      return false;
    }
  }

  // Ottieni statistiche sui clienti
  static async getClientStats(): Promise<{
    total: number;
    active: number;
    leads: number;
    prospects: number;
    inactive: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('status');

      if (error) {
        console.error('Errore nel recuperare le statistiche dei clienti:', error);
        return { total: 0, active: 0, leads: 0, prospects: 0, inactive: 0 };
      }

      const stats = {
        total: data.length,
        active: 0,
        leads: 0,
        prospects: 0,
        inactive: 0
      };

      data.forEach(client => {
        switch (client.status) {
          case 'active':
            stats.active++;
            break;
          case 'lead':
            stats.leads++;
            break;
          case 'prospect':
            stats.prospects++;
            break;
          case 'inactive':
            stats.inactive++;
            break;
        }
      });

      return stats;
    } catch (error) {
      console.error('Errore nel recuperare le statistiche dei clienti:', error);
      return { total: 0, active: 0, leads: 0, prospects: 0, inactive: 0 };
    }
  }
}