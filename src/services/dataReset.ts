import { ClientService } from './storage';
import { AppointmentService } from './appointmentService';
import { eventBus, EVENTS } from './eventBus';

export class DataResetService {
  // Cancella tutti i dati dell'applicazione
  static clearAllData(): void {
    console.log('🗑️ Inizio cancellazione di tutti i dati...');
    
    // Cancella dati clienti
    ClientService.clearAllData();
    
    // Cancella dati appuntamenti
    AppointmentService.clearAllData();
    
    // Cancella dati fatture
    localStorage.removeItem('adinfissi_invoices');
    console.log('Dati fatture cancellati');
    
    // Cancella dati documenti
    localStorage.removeItem('gestionale_documents');
    console.log('Dati documenti cancellati');
    
    // Non cancello i dati utente per mantenere il login
    // localStorage.removeItem('user');
    
    console.log('✅ Tutti i dati di prova sono stati cancellati!');
    console.log('🔄 Ricarica la pagina per vedere l\'applicazione pulita');
    
    // Emetti eventi per notificare i componenti
    eventBus.emit(EVENTS.ALL_DATA_CLEARED);
    eventBus.emit(EVENTS.DATA_CHANGED);
    eventBus.emit(EVENTS.CLIENTS_CHANGED);
    eventBus.emit(EVENTS.APPOINTMENTS_CHANGED);
    eventBus.emit(EVENTS.INVOICES_CHANGED);
    eventBus.emit(EVENTS.DOCUMENTS_CHANGED);
    
    // Ricarica automaticamente la pagina
    window.location.reload();
  }
  
  // Conferma prima di cancellare
  static confirmAndClearAllData(): void {
    const confirmed = window.confirm(
      '⚠️ ATTENZIONE!\n\n' +
      'Questa operazione cancellerà TUTTI i dati:\n' +
      '• Clienti\n' +
      '• Appuntamenti (sopralluoghi e team)\n' +
      '• Fatture\n' +
      '• Documenti\n\n' +
      'Sei sicuro di voler procedere?'
    );
    
    if (confirmed) {
      this.clearAllData();
    }
  }
}

// Espone la funzione globalmente per uso da console
(window as any).clearAllData = DataResetService.confirmAndClearAllData;
(window as any).forceClearAllData = DataResetService.clearAllData;

console.log('🔧 Funzioni di reset disponibili:');
console.log('• clearAllData() - Cancella tutti i dati con conferma');
console.log('• forceClearAllData() - Cancella tutti i dati senza conferma');