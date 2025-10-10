import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Euro, Calendar, User, FileText, AlertCircle, CheckCircle, Clock, Package, TrendingUp } from 'lucide-react';
import { OrderService } from '../services/orderService';
import { ClientService } from '../services/clientService';
import { Client, Order, OrderStatus, PaymentStatus, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../types';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    client_id: '',
    description: '',
    total_amount: 0,
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    status: 'BOZZA' as Order['status'],
    notes: ''
  });

  useEffect(() => {
    loadData();
    
    // Ascolta gli eventi di aggiornamento pagamenti ordini
    const handleOrderPaymentUpdate = () => {
      loadData();
    };
    
    window.addEventListener('orderPaymentUpdated', handleOrderPaymentUpdate);
    
    return () => {
      window.removeEventListener('orderPaymentUpdated', handleOrderPaymentUpdate);
    };
  }, []);

  const loadData = async () => {
    const [ordersData, activeClientsData] = await Promise.all([
      OrderService.getAllOrders(),
      ClientService.getActiveClients()
    ]);
    setOrders(ordersData);
    setClients(activeClientsData);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesPayment = !paymentFilter || order.payment_status === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate client selection
    if (!formData.client_id || formData.client_id === '') {
      alert('Seleziona un cliente prima di creare l\'ordine');
      return;
    }
    
    const selectedClient = clients.find(c => c.id === formData.client_id);
    if (!selectedClient) {
      alert('Cliente non trovato. Seleziona un cliente valido.');
      return;
    }

    const orderData = {
      ...formData,
      client_name: `${selectedClient.name} ${selectedClient.surname}`
    };

    try {
      if (editingOrder) {
        const success = await OrderService.updateOrder(editingOrder.id, orderData);
        if (success) {
          await loadData();
          resetForm();
        }
      } else {
        const newOrder = await OrderService.createOrder(orderData);
        if (newOrder) {
          await loadData();
          resetForm();
        }
      }
    } catch (error) {
      console.error('Errore durante il salvataggio dell\'ordine:', error);
      alert('Errore durante il salvataggio dell\'ordine');
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      description: '',
      total_amount: 0,
      order_date: new Date().toISOString().split('T')[0],
      delivery_date: '',
      status: 'BOZZA',
      notes: ''
    });
    setEditingOrder(null);
    setShowModal(false);
  };

  const handleNewOrder = () => {
    setEditingOrder(null);
    setFormData({
      client_id: '',
      description: '',
      total_amount: 0,
      order_date: new Date().toISOString().split('T')[0],
      delivery_date: '',
      status: 'BOZZA',
      notes: ''
    });
    setShowModal(true);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      client_id: order.client_id, // Keep as string (UUID)
      description: order.description,
      total_amount: order.total_amount,
      order_date: order.order_date,
      delivery_date: order.delivery_date || '',
      status: order.status,
      notes: order.notes || ''
    });
    setShowModal(true);
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'NON_PAGATO': return 'bg-red-100 text-red-800 border-red-200';
      case 'PARZIALMENTE_PAGATO': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETAMENTE_PAGATO': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'NON_PAGATO': return <AlertCircle className="text-red-500" size={16} />;
      case 'PARZIALMENTE_PAGATO': return <Clock className="text-yellow-500" size={16} />;
      case 'COMPLETAMENTE_PAGATO': return <CheckCircle className="text-green-500" size={16} />;
      default: return <AlertCircle className="text-gray-500" size={16} />;
    }
  };

  const getOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'BOZZA': return 'bg-gray-100 text-gray-800';
      case 'CONFERMATO': return 'bg-blue-100 text-blue-800';
      case 'IN_PRODUZIONE': return 'bg-purple-100 text-purple-800';
      case 'PRONTO': return 'bg-orange-100 text-orange-800';
      case 'CONSEGNATO': return 'bg-green-100 text-green-800';
      case 'COMPLETATO': return 'bg-emerald-100 text-emerald-800';
      case 'ANNULLATO': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getProgressPercentage = (order: Order) => {
    return order.payment_percentage || 0;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Ordini</h1>
          <p className="text-gray-600">Gestisci gli ordini e monitora i pagamenti</p>
        </div>
        <button
          onClick={handleNewOrder}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nuovo Ordine
        </button>
      </div>

      {/* Filtri */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cerca per cliente, numero ordine o descrizione..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tutti gli stati</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tutti i pagamenti</option>
            {Object.entries(PAYMENT_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setPaymentFilter('');
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset Filtri
          </button>
        </div>
      </div>

      {/* Statistiche rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ordini Totali</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <Package className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valore Totale</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(orders.reduce((sum, order) => sum + order.total_amount, 0))}
              </p>
            </div>
            <Euro className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Incassato</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(orders.reduce((sum, order) => sum + order.paid_amount, 0))}
              </p>
            </div>
            <TrendingUp className="text-blue-500" size={32} />
          </div>
        </div>
      </div>

      {/* Tabella ordini */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numero Ordine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrizione
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Importo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Ordine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.client_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {order.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{formatCurrency(order.total_amount)}</div>
                      <div className="text-xs text-gray-500">
                        Pagato: {formatCurrency(order.paid_amount)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.payment_status)}`}>
                        {getPaymentStatusIcon(order.payment_status)}
                        {PAYMENT_STATUS_LABELS[order.payment_status]}
                      </span>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            order.payment_status === 'COMPLETAMENTE_PAGATO' ? 'bg-green-500' :
                            order.payment_status === 'PARZIALMENTE_PAGATO' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${getProgressPercentage(order)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {getProgressPercentage(order)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.order_date).toLocaleDateString('it-IT')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingOrder(order)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Visualizza"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(order)}
                        className="text-green-600 hover:text-green-900"
                        title="Modifica"
                      >
                        <Edit size={16} />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={resetForm}>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">
              {editingOrder ? 'Modifica Ordine' : 'Nuovo Ordine'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente *
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleziona cliente</option>
                     {clients.map(client => (
                       <option key={client.id} value={client.id.toString()}>
                         {client.name} {client.surname}
                       </option>
                     ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Importo Totale *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Ordine *
                  </label>
                  <input
                    type="date"
                    value={formData.order_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Consegna
                  </label>
                  <input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stato
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as OrderStatus }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
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
                  {editingOrder ? 'Aggiorna' : 'Crea'} Ordine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizzazione */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Dettagli Ordine</h2>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Numero Ordine</p>
                  <p className="font-medium">{viewingOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-medium">{viewingOrder.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stato Ordine</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(viewingOrder.status)}`}>
                    {ORDER_STATUS_LABELS[viewingOrder.status]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stato Pagamento</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(viewingOrder.payment_status)}`}>
                    {getPaymentStatusIcon(viewingOrder.payment_status)}
                    {PAYMENT_STATUS_LABELS[viewingOrder.payment_status]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data Ordine</p>
                  <p className="font-medium">{new Date(viewingOrder.order_date).toLocaleDateString('it-IT')}</p>
                </div>
                {viewingOrder.delivery_date && (
                  <div>
                    <p className="text-sm text-gray-600">Data Consegna</p>
                    <p className="font-medium">{new Date(viewingOrder.delivery_date).toLocaleDateString('it-IT')}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Descrizione</p>
                <p className="font-medium">{viewingOrder.description}</p>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Importo Totale</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(viewingOrder.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Importo Pagato</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(viewingOrder.paid_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rimanente</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(viewingOrder.remaining_amount)}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progresso Pagamento</span>
                    <span>{getProgressPercentage(viewingOrder)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        viewingOrder.payment_status === 'COMPLETAMENTE_PAGATO' ? 'bg-green-500' :
                        viewingOrder.payment_status === 'PARZIALMENTE_PAGATO' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${getProgressPercentage(viewingOrder)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {viewingOrder.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Note</p>
                  <p className="text-sm">{viewingOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;