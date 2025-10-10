import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Filter, FileText } from 'lucide-react';
import { Client, ClientFormData, ClientStatus, CLIENT_STATUS_LABELS } from '../types';
import { ClientService } from '../services/clientService';
import ClientForm from './ClientForm';
import ClientStatusBadge from './ClientStatusBadge';
import ClientDocuments from './ClientDocuments';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'ALL'>('ALL');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedClientForDocuments, setSelectedClientForDocuments] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, statusFilter, showInactive]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const allClients = await ClientService.getAllClients();
      setClients(allClients);
    } catch (error) {
      console.error('Errore nel caricamento dei clienti:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = showInactive ? clients : clients.filter(client => client.is_active);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(client =>
        (client.name || '').toLowerCase().includes(term) ||
        (client.surname || '').toLowerCase().includes(term) ||
        (client.email || '').toLowerCase().includes(term) ||
        (client.phone || '').includes(term) ||
        (client.city || '').toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    setFilteredClients(filtered);
  };

  const handleCreateClient = async (formData: ClientFormData) => {
    try {
      await ClientService.createClient(formData);
      await loadClients();
      setShowForm(false);
    } catch (error) {
      console.error('Errore nella creazione del cliente:', error);
    }
  };

  const handleUpdateClient = async (formData: ClientFormData) => {
    if (editingClient) {
      try {
        await ClientService.updateClient(editingClient.id, formData);
        await loadClients();
        setEditingClient(null);
        setShowForm(false);
      } catch (error) {
        console.error('Errore nell\'aggiornamento del cliente:', error);
      }
    }
  };

  const handleStatusChange = async (clientId: string, newStatus: ClientStatus) => {
    try {
      await ClientService.updateClientStatus(clientId, newStatus);
      await loadClients();
    } catch (error) {
      console.error('Errore nell\'aggiornamento dello stato:', error);
    }
  };

  const handleDeactivateClient = async (clientId: string) => {
    if (window.confirm('Sei sicuro di voler disattivare questo cliente?')) {
      try {
        await ClientService.deactivateClient(clientId);
        await loadClients();
      } catch (error) {
        console.error('Errore nella disattivazione del cliente:', error);
      }
    }
  };

  const handleReactivateClient = async (clientId: string) => {
    try {
      await ClientService.reactivateClient(clientId);
      await loadClients();
    } catch (error) {
      console.error('Errore nella riattivazione del cliente:', error);
    }
  };

  const openEditForm = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestione Clienti</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nuovo Cliente
        </button>
      </div>

      {/* Filtri e ricerca */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Ricerca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cerca clienti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro stato */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ClientStatus | 'ALL')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="ALL">Tutti gli stati</option>
              {Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Toggle clienti inattivi */}
          <div className="flex items-center">
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                showInactive 
                  ? 'bg-gray-100 border-gray-300 text-gray-700' 
                  : 'bg-white border-gray-300 text-gray-500'
              }`}
            >
              {showInactive ? <Eye size={20} /> : <EyeOff size={20} />}
              {showInactive ? 'Nascondi inattivi' : 'Mostra inattivi'}
            </button>
          </div>

          {/* Contatore risultati */}
          <div className="flex items-center text-sm text-gray-600">
            {filteredClients.length} clienti trovati
          </div>
        </div>
      </div>

      {/* Lista clienti */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contatti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Indirizzo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className={!client.is_active ? 'bg-gray-50 opacity-60' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {client.name} {client.surname}
                      </div>
                      <div className="text-sm text-gray-500">ID: {client.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.phone}</div>
                    <div className="text-sm text-gray-500">{client.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.address}</div>
                    <div className="text-sm text-gray-500">{client.city} {client.postal_code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ClientStatusBadge 
                      status={client.status} 
                      onChange={(newStatus) => handleStatusChange(client.id, newStatus)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(client)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Modifica"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setSelectedClientForDocuments(client)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Gestisci Documenti"
                      >
                        <FileText size={16} />
                      </button>
                      {client.is_active ? (
                        <button
                          onClick={() => handleDeactivateClient(client.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Disattiva"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivateClient(client.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Riattiva"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div className="text-gray-500 text-lg mt-4">Caricamento clienti...</div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Nessun cliente trovato</div>
            <div className="text-gray-400 text-sm mt-2">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Prova a modificare i filtri di ricerca' 
                : 'Inizia aggiungendo il primo cliente'
              }
            </div>
          </div>
        ) : null}
      </div>

      {/* Form modale */}
      {showForm && (
        <ClientForm
          client={editingClient}
          onSubmit={editingClient ? handleUpdateClient : handleCreateClient}
          onCancel={closeForm}
        />
      )}

      {/* Gestione documenti modale */}
      {selectedClientForDocuments && (
        <ClientDocuments
          client={selectedClientForDocuments}
          onClose={() => setSelectedClientForDocuments(null)}
        />
      )}
    </div>
  );
};

export default Clients;