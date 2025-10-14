import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Edit, Trash2, Eye, Euro, Calendar, User, FileText, AlertCircle, CheckCircle, Clock, Send } from 'lucide-react';
import { ClientService } from '../services/clientService';
import { Client, Order } from '../types';
import { OrderService } from '../services/orderService';
import { InvoiceService, Invoice, InvoiceItem, InvoiceFormData } from '../services/invoiceService';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    client_id: '',
    order_id: '',
    amount: 0,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    notes: '',
    items: [] as Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at' | 'updated_at'>[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [invoicesData, clientsData, ordersData] = await Promise.all([
      InvoiceService.getAllInvoices(),
      ClientService.getAllClients(),
      OrderService.getAllOrders()
    ]);
    setInvoices(invoicesData);
    setClients(clientsData);
    setOrders(ordersData);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const client = clients.find(c => c.id === invoice.client_id);
    const clientName = client ? `${client.name} ${client.surname}` : '';
    
    const matchesSearch = 
      (invoice.number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingInvoice) {
        await InvoiceService.updateInvoice(editingInvoice.id, formData);
      } else {
        await InvoiceService.createInvoice(formData);
      }

      loadData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Errore durante il salvataggio della fattura:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      client_name: '',
      order_id: '',
      amount: 0,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '',
      notes: '',
      items: []
    });
    setEditingInvoice(null);
    setShowModal(false);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      client_id: invoice.client_id,
      client_name: invoice.client_name || '',
      order_id: invoice.order_id || '',
      amount: invoice.amount,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      description: invoice.description,
      notes: invoice.notes || '',
      items: invoice.items?.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total
      })) || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa fattura?')) {
      try {
        const ok = await InvoiceService.deleteInvoice(id);
        if (ok) {
          loadData();
        } else {
          alert('Eliminazione non riuscita. Controlla i permessi o riprova.');
        }
      } catch (error) {
        console.error('Errore durante l\'eliminazione della fattura:', error);
        alert('Si è verificato un errore durante l\'eliminazione.');
      }
    }
  };

  const handleStatusChange = async (id: string, status: Invoice['status']) => {
    try {
      await InvoiceService.updateInvoiceStatus(id, status);
      loadData();
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dello stato:', error);
    }
  };

  const addInvoiceItem = () => {
    const newItem = {
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Calcola il totale se cambiano quantità o prezzo unitario
      if (field === 'quantity' || field === 'unit_price') {
        newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
      }
      
      // Calcola il totale della fattura
      const totalAmount = newItems.reduce((sum, item) => sum + item.total, 0);
      
      return {
        ...prev,
        items: newItems,
        amount: totalAmount
      };
    });
  };

  const removeInvoiceItem = (index: number) => {
    setFormData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const totalAmount = newItems.reduce((sum, item) => sum + item.total, 0);
      
      return {
        ...prev,
        items: newItems,
        amount: totalAmount
      };
    });
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'BOZZA': return <FileText className="text-gray-500" size={16} />;
      case 'INVIATA': return <Send className="text-blue-500" size={16} />;
      case 'PAGATA': return <CheckCircle className="text-green-500" size={16} />;
      case 'SCADUTA': return <AlertCircle className="text-red-500" size={16} />;
      case 'ANNULLATA': return <AlertCircle className="text-gray-500" size={16} />;
      default: return <Clock className="text-yellow-500" size={16} />;
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'BOZZA': return 'bg-gray-100 text-gray-800';
      case 'INVIATA': return 'bg-blue-100 text-blue-800';
      case 'PAGATA': return 'bg-green-100 text-green-800';
      case 'SCADUTA': return 'bg-red-100 text-red-800';
      case 'ANNULLATA': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const totalRevenue = invoices
    .filter(inv => inv.status === 'PAGATA')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingAmount = invoices
    .filter(inv => inv.status === 'INVIATA')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueInvoices = invoices.filter(inv => 
    inv.status === 'INVIATA' && new Date(inv.due_date) < new Date()
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestione Fatture</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nuova Fattura
        </button>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fatturato Totale</p>
              <p className="text-2xl font-bold text-green-600">€{totalRevenue.toFixed(2)}</p>
            </div>
            <Euro className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Attesa</p>
              <p className="text-2xl font-bold text-blue-600">€{pendingAmount.toFixed(2)}</p>
            </div>
            <Clock className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fatture Scadute</p>
              <p className="text-2xl font-bold text-red-600">{overdueInvoices.length}</p>
            </div>
            <AlertCircle className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totale Fatture</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
            <FileText className="text-gray-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filtri */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cerca per numero, cliente o descrizione..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tutti gli stati</option>
            <option value="BOZZA">Bozza</option>
            <option value="INVIATA">Inviata</option>
            <option value="PAGATA">Pagata</option>
            <option value="SCADUTA">Scaduta</option>
            <option value="ANNULLATA">Annullata</option>
          </select>
        </div>
      </div>

      {/* Lista Fatture */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numero
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Importo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Emissione
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scadenza
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
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {clients.find(c => c.id === invoice.client_id)?.name || 'Cliente non trovato'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.order_id ? 
                      orders.find(o => o.id === invoice.order_id)?.order_number || `Ordine #${invoice.order_id}` 
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.issue_date).toLocaleDateString('it-IT')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.due_date).toLocaleDateString('it-IT')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={invoice.status}
                      onChange={(e) => handleStatusChange(invoice.id, e.target.value as Invoice['status'])}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)} border-0 focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="BOZZA">Bozza</option>
                      <option value="INVIATA">Inviata</option>
                      <option value="PAGATA">Pagata</option>
                      <option value="SCADUTA">Scaduta</option>
                      <option value="ANNULLATA">Annullata</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Visualizza"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="text-green-600 hover:text-green-900"
                        title="Modifica"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Elimina"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Creazione/Modifica */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingInvoice ? 'Modifica Fattura' : 'Nuova Fattura'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente *
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => {
                      const clientId = e.target.value;
                      const client = clients.find(c => c.id.toString() === clientId);
                      setFormData(prev => ({ 
                        ...prev, 
                        client_id: clientId,
                        client_name: client ? `${client.name} ${client.surname}` : '',
                        order_id: '' // Reset order when client changes
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleziona cliente</option>
                    {clients.filter(c => c.is_active).map(client => (
                       <option key={client.id} value={client.id.toString()}>
                         {client.name} {client.surname}
                       </option>
                     ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordine (opzionale)
                  </label>
                  <select
                    value={formData.order_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!formData.client_id}
                  >
                    <option value="">Nessun ordine associato</option>
                    {orders
                      .filter(order => order.client_id && order.client_id.toString() === formData.client_id)
                      .map(order => (
                        <option key={order.id} value={order.id.toString()}>
                          {order.order_number} - €{order.total_amount.toFixed(2)} 
                          {order.remaining_amount > 0 && ` (Residuo: €${order.remaining_amount.toFixed(2)})`}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrizione *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Emissione *
                  </label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Scadenza *
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Voci Fattura */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Voci Fattura
                  </label>
                  <button
                    type="button"
                    onClick={addInvoiceItem}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Aggiungi Voce
                  </button>
                </div>
                
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2 p-3 border rounded-lg">
                    <input
                      type="text"
                      placeholder="Descrizione"
                      value={item.description}
                      onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Quantità"
                      value={item.quantity}
                      onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                      min="0"
                      step="1"
                    />
                    <input
                      type="text"
                      placeholder="Prezzo unitario"
                      value={item.unit_price === 0 ? '' : item.unit_price.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Permette solo numeri e punti decimali
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          const numericValue = value === '' ? 0 : parseFloat(value);
                          updateInvoiceItem(index, 'unit_price', isNaN(numericValue) ? 0 : numericValue);
                        }
                      }}
                      onBlur={(e) => {
                        // Formatta il valore quando l'utente esce dal campo
                        const value = parseFloat(e.target.value) || 0;
                        updateInvoiceItem(index, 'unit_price', value);
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <div className="px-2 py-1 bg-gray-100 rounded text-sm flex items-center">
                      €{item.total.toFixed(2)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeInvoiceItem(index)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Totale Fattura
                </label>
                <div className="text-2xl font-bold text-green-600">
                  €{formData.amount.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingInvoice ? 'Aggiorna' : 'Crea'} Fattura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizzazione */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Fattura {viewingInvoice.number}</h2>
              <button
                onClick={() => setViewingInvoice(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-medium">
                    {clients.find(c => c.id === viewingInvoice.client_id)?.name || 'Cliente non trovato'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stato</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewingInvoice.status)}`}>
                    {getStatusIcon(viewingInvoice.status)}
                    {viewingInvoice.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data Emissione</p>
                  <p className="font-medium">{new Date(viewingInvoice.issue_date).toLocaleDateString('it-IT')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Scadenza</p>
                  <p className="font-medium">{new Date(viewingInvoice.due_date).toLocaleDateString('it-IT')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Descrizione</p>
                <p className="font-medium">{viewingInvoice.description}</p>
              </div>

              {viewingInvoice.items && viewingInvoice.items.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Voci</p>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Descrizione</th>
                          <th className="px-3 py-2 text-right">Qta</th>
                          <th className="px-3 py-2 text-right">Prezzo</th>
                          <th className="px-3 py-2 text-right">Totale</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingInvoice.items.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-3 py-2">{item.description}</td>
                            <td className="px-3 py-2 text-right">{item.quantity}</td>
                            <td className="px-3 py-2 text-right">€{item.unit_price.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right font-medium">€{item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Totale:</span>
                  <span className="text-2xl font-bold text-green-600">€{viewingInvoice.amount.toFixed(2)}</span>
                </div>
              </div>

              {viewingInvoice.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Note</p>
                  <p className="text-sm">{viewingInvoice.notes}</p>
                </div>
              )}

              {viewingInvoice.paymentDate && (
                <div>
                  <p className="text-sm text-gray-600">Data Pagamento</p>
                  <p className="font-medium text-green-600">
                    {new Date(viewingInvoice.paymentDate).toLocaleDateString('it-IT')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;