import { supabase } from './supabase';
import { ClientDocument, DocumentCategory } from '../types';

// Utility per formattare la dimensione del file
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility per ottenere l'icona del tipo di file
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('doc')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
  return '📎';
}

// Utility per generare path del file nello storage
function generateStoragePath(userId: string, clientId: string, fileName: string): string {
  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${userId}/${clientId}/${timestamp}_${cleanFileName}`;
}

// Utility per creare thumbnail per immagini
async function createImageThumbnail(file: File, maxWidth: number = 200): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(null);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.7);
    };

    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
}

export class DocumentService {
  // Ottieni tutti i documenti per un cliente
  static async getClientDocuments(clientId: string): Promise<ClientDocument[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Utente non autenticato');

      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', clientId)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Genera URL di download per ogni documento
      const documentsWithUrls = await Promise.all(
        (data || []).map(async (doc) => {
          const downloadUrl = await this.getDownloadUrl(doc.file_path);
          let thumbnailUrl: string | undefined;

          // Genera thumbnail URL per immagini
          if (doc.mime_type.startsWith('image/')) {
            thumbnailUrl = downloadUrl; // Per ora usiamo l'immagine originale come thumbnail
          }

          return {
            ...doc,
            download_url: downloadUrl,
            thumbnail_url: thumbnailUrl
          };
        })
      );

      return documentsWithUrls;
    } catch (error) {
      console.error('Errore nel recuperare i documenti:', error);
      return [];
    }
  }

  // Ottieni documenti per categoria
  static async getDocumentsByCategory(clientId: string, category: DocumentCategory): Promise<ClientDocument[]> {
    const allDocuments = await this.getClientDocuments(clientId);
    return allDocuments.filter(doc => doc.category === category);
  }

  // Aggiungi documento
  static async addDocument(
    clientId: string,
    file: File,
    category: DocumentCategory,
    notes?: string
  ): Promise<ClientDocument> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Utente non autenticato');

      // Verifica dimensione file (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Il file è troppo grande. Dimensione massima: 10MB');
      }

      // Genera path per il file
      const filePath = generateStoragePath(user.user.id, clientId, file.name);

      // Carica il file nello storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Crea thumbnail se è un'immagine
      let thumbnailPath: string | undefined;
      if (file.type.startsWith('image/')) {
        const thumbnail = await createImageThumbnail(file);
        if (thumbnail) {
          const thumbPath = `${filePath}_thumb`;
          const { error: thumbError } = await supabase.storage
            .from('documents')
            .upload(thumbPath, thumbnail, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (!thumbError) {
            thumbnailPath = thumbPath;
          }
        }
      }

      // Salva i metadati nel database
      const { data, error: dbError } = await supabase
        .from('client_documents')
        .insert({
          client_id: clientId,
          user_id: user.user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          category,
          notes
        })
        .select()
        .single();

      if (dbError) {
        // Se il database fallisce, elimina il file dallo storage
        await supabase.storage.from('documents').remove([filePath]);
        if (thumbnailPath) {
          await supabase.storage.from('documents').remove([thumbnailPath]);
        }
        throw dbError;
      }

      // Genera URL di download
      const downloadUrl = await this.getDownloadUrl(filePath);
      const thumbnailUrl = thumbnailPath ? await this.getDownloadUrl(thumbnailPath) : undefined;

      return {
        ...data,
        download_url: downloadUrl,
        thumbnail_url: thumbnailUrl
      };
    } catch (error) {
      console.error('Errore nell\'aggiungere il documento:', error);
      throw error;
    }
  }

  // Rimuovi documento
  static async removeDocument(documentId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Utente non autenticato');

      // Ottieni i dettagli del documento
      const { data: document, error: fetchError } = await supabase
        .from('client_documents')
        .select('file_path')
        .eq('id', documentId)
        .eq('user_id', user.user.id)
        .single();

      if (fetchError || !document) {
        throw new Error('Documento non trovato');
      }

      // Elimina il record dal database (il trigger eliminerà automaticamente il file)
      const { error: deleteError } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.user.id);

      if (deleteError) throw deleteError;

      return true;
    } catch (error) {
      console.error('Errore nella rimozione del documento:', error);
      return false;
    }
  }

  // Ottieni URL di download
  static async getDownloadUrl(filePath: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600); // URL valido per 1 ora

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Errore nel generare URL di download:', error);
      return '';
    }
  }

  // Scarica documento
  static async downloadDocument(documentId: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Utente non autenticato');

      // Ottieni i dettagli del documento
      const { data: document, error: fetchError } = await supabase
        .from('client_documents')
        .select('file_path, file_name')
        .eq('id', documentId)
        .eq('user_id', user.user.id)
        .single();

      if (fetchError || !document) {
        throw new Error('Documento non trovato');
      }

      // Ottieni URL di download
      const downloadUrl = await this.getDownloadUrl(document.file_path);
      
      // Crea link per il download
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = document.file_name;
      link.click();
    } catch (error) {
      console.error('Errore nel download del documento:', error);
      throw error;
    }
  }

  // Aggiorna note documento
  static async updateDocumentNotes(documentId: string, notes: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Utente non autenticato');

      const { error } = await supabase
        .from('client_documents')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', documentId)
        .eq('user_id', user.user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Errore nell\'aggiornare le note:', error);
      return false;
    }
  }

  // Ottieni statistiche documenti per cliente
  static async getClientDocumentStats(clientId: string) {
    try {
      const documents = await this.getClientDocuments(clientId);
      const totalSize = documents.reduce((sum, doc) => sum + doc.file_size, 0);
      const byCategory: { [key in DocumentCategory]?: number } = {};
      
      documents.forEach(doc => {
        byCategory[doc.category] = (byCategory[doc.category] || 0) + 1;
      });

      return {
        total: documents.length,
        totalSize,
        byCategory
      };
    } catch (error) {
      console.error('Errore nel calcolare le statistiche:', error);
      return {
        total: 0,
        totalSize: 0,
        byCategory: {}
      };
    }
  }

  // Pulisci documenti per cliente (quando si elimina un cliente)
  static async removeClientDocuments(clientId: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Utente non autenticato');

      // Elimina tutti i documenti del cliente (i trigger elimineranno i file)
      const { error } = await supabase
        .from('client_documents')
        .delete()
        .eq('client_id', clientId)
        .eq('user_id', user.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Errore nella rimozione dei documenti del cliente:', error);
    }
  }

  // Migrazione da localStorage (funzione di utilità)
  static async migrateFromLocalStorage(): Promise<void> {
    try {
      const localDocuments = localStorage.getItem('gestionale_documents');
      if (!localDocuments) return;

      const documents = JSON.parse(localDocuments);
      console.log(`Trovati ${documents.length} documenti nel localStorage da migrare`);

      // Questa funzione può essere chiamata manualmente per migrare i dati esistenti
      // L'implementazione completa richiederebbe la conversione da base64 a File
      // e il caricamento su Supabase Storage
      
      console.log('Migrazione da localStorage non ancora implementata automaticamente');
      console.log('I documenti esistenti rimarranno nel localStorage fino alla migrazione manuale');
    } catch (error) {
      console.error('Errore nella migrazione da localStorage:', error);
    }
  }
}