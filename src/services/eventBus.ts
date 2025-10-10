// Event Bus per notificare i cambiamenti nei dati
type EventCallback = () => void;

class EventBus {
  private listeners: Map<string, EventCallback[]> = new Map();

  // Registra un listener per un evento
  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    const callbacks = this.listeners.get(event)!;
    callbacks.push(callback);
    
    // Ritorna una funzione per rimuovere il listener
    return () => {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  // Emette un evento
  emit(event: string): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }

  // Rimuove tutti i listeners per un evento
  off(event: string): void {
    this.listeners.delete(event);
  }

  // Rimuove tutti i listeners
  clear(): void {
    this.listeners.clear();
  }
}

// Istanza singleton dell'event bus
export const eventBus = new EventBus();

// Eventi predefiniti
export const EVENTS = {
  DATA_CHANGED: 'data_changed',
  CLIENTS_CHANGED: 'clients_changed',
  APPOINTMENTS_CHANGED: 'appointments_changed',
  INVOICES_CHANGED: 'invoices_changed',
  DOCUMENTS_CHANGED: 'documents_changed',
  ALL_DATA_CLEARED: 'all_data_cleared',
  // Eventi per azioni rapide
  OPEN_CLIENT_FORM: 'open_client_form',
  OPEN_SURVEY_FORM: 'open_survey_form',
  OPEN_INVOICE_FORM: 'open_invoice_form'
} as const;