import { Client, ClientFormData, ClientStatus } from '../types';
import { eventBus, EVENTS } from './eventBus';

// Chiavi per localStorage
const STORAGE_KEYS = {
  CLIENTS: 'gestionale_clients',
  NEXT_CLIENT_ID: 'gestionale_next_client_id'
};

// Funzioni helper per localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Errore nel salvare i dati:', error);
  }
}

// Servizio per la gestione dei clienti
export class ClientService {
  static getAllClients(): Client[] {
    return getFromStorage<Client[]>(STORAGE_KEYS.CLIENTS, []);
  }

  static getActiveClients(): Client[] {
    return this.getAllClients().filter(client => client.is_active);
  }

  static getClientById(id: number): Client | undefined {
    return this.getAllClients().find(client => client.id === id);
  }

  static createClient(formData: ClientFormData): Client {
    const clients = this.getAllClients();
    const nextId = getFromStorage(STORAGE_KEYS.NEXT_CLIENT_ID, 1);
    
    const newClient: Client = {
      id: nextId,
      ...formData,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    clients.push(newClient);
    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    saveToStorage(STORAGE_KEYS.NEXT_CLIENT_ID, nextId + 1);

    // Emetti evento di cambiamento
    eventBus.emit(EVENTS.CLIENTS_CHANGED);
    eventBus.emit(EVENTS.DATA_CHANGED);

    return newClient;
  }

  static updateClient(id: number, formData: ClientFormData): Client | null {
    const clients = this.getAllClients();
    const index = clients.findIndex(client => client.id === id);
    
    if (index === -1) return null;

    const oldClient = clients[index];
    const updatedClient = {
      ...oldClient,
      ...formData,
      updated_at: new Date().toISOString()
    };
    
    clients[index] = updatedClient;

    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    
    // Emetti evento di cambiamento
    eventBus.emit(EVENTS.CLIENTS_CHANGED);
    eventBus.emit(EVENTS.DATA_CHANGED);
    
    // Trigger sync events for other sections if status changed
    if (oldClient.status !== updatedClient.status) {
      this.triggerStatusChangeSync(updatedClient, oldClient.status);
    }
    
    return updatedClient;
  }

  // Trigger synchronization events for other sections
  private static triggerStatusChangeSync(client: Client, oldStatus: ClientStatus) {
    // Dispatch custom events for other sections to listen to
    const event = new CustomEvent('clientStatusChanged', {
      detail: {
        client,
        oldStatus,
        newStatus: client.status
      }
    });
    window.dispatchEvent(event);
  }

  static updateClientStatus(id: number, status: ClientStatus): Client | null {
    const clients = this.getAllClients();
    const index = clients.findIndex(client => client.id === id);
    
    if (index === -1) return null;

    clients[index] = {
      ...clients[index],
      status,
      updated_at: new Date().toISOString()
    };

    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    return clients[index];
  }

  static deactivateClient(id: number): boolean {
    const clients = this.getAllClients();
    const index = clients.findIndex(client => client.id === id);
    
    if (index === -1) return false;

    clients[index] = {
      ...clients[index],
      is_active: false,
      updated_at: new Date().toISOString()
    };

    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    return true;
  }

  static reactivateClient(id: number): boolean {
    const clients = this.getAllClients();
    const index = clients.findIndex(client => client.id === id);
    
    if (index === -1) return false;

    clients[index] = {
      ...clients[index],
      is_active: true,
      updated_at: new Date().toISOString()
    };

    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    return true;
  }

  static getClientStats() {
    const clients = this.getActiveClients();
    const stats: { [key in ClientStatus]?: number } = {};
    
    clients.forEach(client => {
      stats[client.status] = (stats[client.status] || 0) + 1;
    });

    return Object.entries(stats).map(([status, count]) => ({
      status: status as ClientStatus,
      count
    }));
  }

  // Funzione per inizializzare dati di esempio
  static initializeSampleData(): void {
    const existingClients = this.getAllClients();
    if (existingClients.length > 0) return; // Dati già presenti

    const sampleClients: ClientFormData[] = [
      {
        name: 'Mario',
        surname: 'Rossi',
        phone: '333-1234567',
        email: 'mario.rossi@email.com',
        address: 'Via Roma 123',
        city: 'Milano',
        postal_code: '20100',
        status: 'PREVENTIVO_INIZIALE',
        notes: 'Interessato a finestre per soggiorno'
      },
      {
        name: 'Giulia',
        surname: 'Bianchi',
        phone: '339-7654321',
        email: 'giulia.bianchi@email.com',
        address: 'Corso Italia 45',
        city: 'Roma',
        postal_code: '00100',
        status: 'SOPRALLUOGO_PROGRAMMATO',
        notes: 'Ristrutturazione completa appartamento'
      },
      {
        name: 'Luca',
        surname: 'Verdi',
        phone: '347-9876543',
        email: 'luca.verdi@email.com',
        address: 'Piazza Garibaldi 8',
        city: 'Napoli',
        postal_code: '80100',
        status: 'CONTRATTO_FIRMATO',
        notes: 'Infissi per villa bifamiliare'
      }
    ];

    sampleClients.forEach(clientData => {
      this.createClient(clientData);
    });
  }

  // Cancella tutti i dati di prova
  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.CLIENTS);
    localStorage.removeItem(STORAGE_KEYS.NEXT_CLIENT_ID);
    console.log('Tutti i dati dei clienti sono stati cancellati');
  }
}