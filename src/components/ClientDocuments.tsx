import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Download, Trash2, FileText, Eye, Plus, FolderOpen } from 'lucide-react';
import { Client, ClientDocument, DocumentCategory, DOCUMENT_CATEGORY_LABELS } from '../types';
import { DocumentService, formatFileSize, getFileIcon } from '../services/documentService';

interface ClientDocumentsProps {
  client: Client;
  onClose: () => void;
}

const ClientDocuments: React.FC<ClientDocumentsProps> = ({ client, onClose }) => {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'ALL'>('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('ALTRO');
  const [uploadNotes, setUploadNotes] = useState('');
  const [previewDocument, setPreviewDocument] = useState<ClientDocument | null>(null);
  const [stats, setStats] = useState({ total: 0, totalSize: 0, byCategory: {} });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, [client.id]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const clientDocs = await DocumentService.getClientDocuments(client.id.toString());
      setDocuments(clientDocs);
      
      const documentStats = await DocumentService.getClientDocumentStats(client.id.toString());
      setStats(documentStats);
    } catch (error) {
      console.error('Errore nel caricamento dei documenti:', error);
      setDocuments([]);
      setStats({ total: 0, totalSize: 0, byCategory: {} });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocuments = selectedCategory === 'ALL' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        await DocumentService.addDocument(client.id.toString(), file, uploadCategory, uploadNotes);
      }
      await loadDocuments();
      setUploadNotes('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Errore nel caricamento del file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo documento?')) {
      try {
        await DocumentService.removeDocument(documentId);
        await loadDocuments();
      } catch (error) {
        alert('Errore nell\'eliminazione del documento');
      }
    }
  };

  const handleDownloadDocument = async (documentId: string) => {
    try {
      await DocumentService.downloadDocument(documentId);
    } catch (error) {
      alert('Errore nel download del documento');
    }
  };

  const handlePreviewDocument = (document: ClientDocument) => {
    setPreviewDocument(document);
  };

  const getDocumentsByCategory = () => {
    const categories: { [key in DocumentCategory]: ClientDocument[] } = {
      PREVENTIVO: [],
      CONTRATTO: [],
      FATTURA: [],
      FOTO: [],
      DOCUMENTO_IDENTITA: [],
      ALTRO: []
    };

    documents.forEach(doc => {
      categories[doc.category].push(doc);
    });

    return categories;
  };

  const documentsByCategory = getDocumentsByCategory();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Documenti - {client.name} {client.surname}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {stats.total} documenti • {formatFileSize(stats.totalSize)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar categorie */}
          <div className="w-64 bg-gray-50 border-r p-4 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Categorie</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    selectedCategory === 'ALL'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between">
                    <span>Tutti i documenti</span>
                    <span className="text-xs">{stats.total}</span>
                  </div>
                </button>
                {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([category, label]) => {
                  const count = stats.byCategory[category as DocumentCategory] || 0;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category as DocumentCategory)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        selectedCategory === category
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>{label}</span>
                        <span className="text-xs">{count}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upload section */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Carica Documento</h3>
              <div className="space-y-3">
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <textarea
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="Note (opzionale)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.rar"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {isUploading ? (
                    <>Caricamento...</>
                  ) : (
                    <>
                      <Upload size={16} />
                      Carica File
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Caricamento documenti...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nessun documento
                </h3>
                <p className="text-gray-500">
                  {selectedCategory === 'ALL' 
                    ? 'Non ci sono documenti per questo cliente'
                    : `Non ci sono documenti nella categoria "${DOCUMENT_CATEGORY_LABELS[selectedCategory as DocumentCategory]}"`
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((document) => (
                  <div key={document.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getFileIcon(document.mime_type)}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {document.file_name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {DOCUMENT_CATEGORY_LABELS[document.category]}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Thumbnail per immagini */}
                    {document.thumbnail_url && (
                      <div className="mb-3">
                        <img
                          src={document.thumbnail_url}
                          alt={document.file_name}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer"
                          onClick={() => handlePreviewDocument(document)}
                        />
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mb-3">
                      <div>Dimensione: {formatFileSize(document.file_size)}</div>
                      <div>Caricato: {new Date(document.created_at).toLocaleDateString()}</div>
                    </div>

                    {document.notes && (
                      <div className="text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded">
                        {document.notes}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePreviewDocument(document)}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-200 flex items-center justify-center gap-1"
                      >
                        <Eye size={12} />
                        Anteprima
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(document.id)}
                        className="flex-1 bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200 flex items-center justify-center gap-1"
                      >
                        <Download size={12} />
                        Scarica
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(document.id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs hover:bg-red-200"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">{previewDocument.file_name}</h3>
              <button
                onClick={() => setPreviewDocument(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 max-h-[80vh] overflow-auto">
              {previewDocument.mime_type.startsWith('image/') && previewDocument.download_url ? (
                <img
                  src={previewDocument.download_url}
                  alt={previewDocument.file_name}
                  className="max-w-full h-auto"
                />
              ) : previewDocument.mime_type === 'application/pdf' && previewDocument.download_url ? (
                <iframe
                  src={previewDocument.download_url}
                  className="w-full h-96"
                  title={previewDocument.file_name}
                />
              ) : (
                <div className="text-center py-8">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    Anteprima non disponibile per questo tipo di file.
                  </p>
                  <button
                    onClick={() => handleDownloadDocument(previewDocument.id)}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                  >
                    <Download size={16} />
                    Scarica per visualizzare
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDocuments;