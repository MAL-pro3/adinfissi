import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Clock, User, MapPin, Edit, Trash2, X, AlertTriangle } from 'lucide-react';
import { AppointmentService, Appointment } from '../services/appointmentService';
import { ClientService } from '../services/clientService';
import { Client } from '../types';
import TimeSlotSuggestions from './TimeSlotSuggestions';

const TeamAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    date: '',
    time: '',
    notes: '',
    address: '',
    type: 'INSTALLAZIONE' as 'INSTALLAZIONE' | 'ASSISTENZA' | 'PRODUZIONE'
  });

  useEffect(() => {
    loadData();
    
    // Listen for client status changes
    const handleClientStatusChange = () => {
      loadData();
    };
    
    window.addEventListener('clientStatusChanged', handleClientStatusChange);
    return () => window.removeEventListener('clientStatusChanged', handleClientStatusChange);
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter, selectedDate]);

  const loadData = async () => {
    try {
      // Get all team appointment types
      const installationAppointments = await AppointmentService.getAppointmentsByType('INSTALLAZIONE');
      const assistanceAppointments = await AppointmentService.getAppointmentsByType('ASSISTENZA');
      const productionAppointments = await AppointmentService.getAppointmentsByType('PRODUZIONE');
      const allTeamAppointments = [...installationAppointments, ...assistanceAppointments, ...productionAppointments];
      const activeClients = await ClientService.getActiveClients();
      
      setAppointments(allTeamAppointments);
      setClients(activeClients);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        (appointment.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.address || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }

    if (selectedDate) {
      filtered = filtered.filter(appointment => appointment.date === selectedDate);
    }

    setFilteredAppointments(filtered);
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      date: '',
      time: '',
      notes: '',
      address: '',
      type: 'INSTALLAZIONE'
    });
    setEditingAppointment(null);
    setShowForm(false);
  };

  const handleCreateAppointment = async () => {
    if (!formData.client_id || !formData.date || !formData.time) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    try {
      // Check for time conflicts only with other team appointments
      const hasConflict = await AppointmentService.checkTimeConflict(formData.date, formData.time, formData.type);
      if (hasConflict) {
        alert('Questo orario è già occupato da un altro appuntamento del team. Seleziona un altro orario.');
        return;
      }

      const client = clients.find(c => c.id.toString() === formData.client_id);
      if (!client) {
        alert('Cliente non trovato');
        return;
      }

      const appointmentData = {
        client_id: formData.client_id,
        client_name: `${client.name} ${client.surname}`,
        type: formData.type,
        date: formData.date,
        time: formData.time,
        status: 'PROGRAMMATO',
        notes: formData.notes,
        address: formData.address || `${client.address}, ${client.city}`
      };

      await AppointmentService.createAppointment(appointmentData);
      loadData();
      resetForm();
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Errore durante la creazione dell\'appuntamento');
    }
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment || !formData.client_id || !formData.date || !formData.time) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    try {
      // Check for time conflicts (excluding current appointment)
      const hasConflict = await AppointmentService.checkTimeConflict(
        formData.date, 
        formData.time, 
        formData.type,
        editingAppointment.id
      );

      if (hasConflict) {
        alert('Esiste già un appuntamento in questo orario');
        return;
      }

      const client = clients.find(c => c.id.toString() === formData.client_id);
      if (!client) {
        alert('Cliente non trovato');
        return;
      }

      const appointmentData = {
        client_id: formData.client_id,
        client_name: `${client.name} ${client.surname}`,
        type: formData.type,
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
        address: formData.address || `${client.address}, ${client.city}`
      };

      await AppointmentService.updateAppointment(editingAppointment.id, appointmentData);
      loadData();
      resetForm();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Errore durante l\'aggiornamento dell\'appuntamento');
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      client_id: appointment.client_id.toString(),
      date: appointment.date,
      time: appointment.time,
      notes: appointment.notes || '',
      address: appointment.address || '',
      type: appointment.type || 'INSTALLAZIONE'
    });
    setShowForm(true);
  };

  const handleDeleteAppointment = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo appuntamento?')) {
      try {
        await AppointmentService.deleteAppointment(id);
        loadData();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Errore durante l\'eliminazione dell\'appuntamento');
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: Appointment['status']) => {
    try {
      await AppointmentService.updateAppointment(id, { status: newStatus });
      loadData();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Errore durante l\'aggiornamento dello stato');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROGRAMMATO': return 'bg-blue-100 text-blue-800';
      case 'COMPLETATO': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INSTALLAZIONE': return 'bg-green-100 text-green-800';
      case 'ASSISTENZA': return 'bg-blue-100 text-blue-800';
      case 'PRODUZIONE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INSTALLAZIONE': return '🔧';
      case 'ASSISTENZA': return '🛠️';
      case 'PRODUZIONE': return '🏭';
      default: return '📅';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Appuntamenti Team</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nuovo Appuntamento
        </button>
      </div>

      {/* Filtri */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cerca per cliente o indirizzo..."
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
            <option value="all">Tutti gli stati</option>
            <option value="PROGRAMMATO">Programmato</option>
            <option value="COMPLETATO">Completato</option>
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setSelectedDate('');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Reset Filtri
          </button>
        </div>
      </div>

      {/* Lista Appuntamenti */}
      <div className="bg-white rounded-lg shadow-sm">
        {filteredAppointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nessun appuntamento trovato</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(appointment.type)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.client_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>{new Date(appointment.date).toLocaleDateString('it-IT')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={16} />
                            <span>{appointment.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}>
                        {appointment.type}
                      </span>
                      <select
                        value={appointment.status}
                        onChange={(e) => handleStatusChange(appointment.id, e.target.value as Appointment['status'])}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(appointment.status)}`}
                      >
                        <option value="PROGRAMMATO">Programmato</option>
                        <option value="COMPLETATO">Completato</option>
                      </select>
                    </div>

                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditAppointment(appointment)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingAppointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento Team'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {!editingAppointment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cliente *
                    </label>
                    <select
                      value={formData.client_id}
                      onChange={(e) => {
                        const clientId = e.target.value;
                        const client = clients.find(c => c.id.toString() === clientId);
                        setFormData({
                          ...formData,
                          client_id: clientId,
                          address: client ? `${client.address || ''}, ${client.city || ''}`.trim().replace(/^,\s*|,\s*$/g, '') : ''
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Seleziona cliente</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id.toString()}>
                          {client.name} {client.surname}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo Appuntamento *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'INSTALLAZIONE' | 'ASSISTENZA' | 'PRODUZIONE' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="INSTALLAZIONE">🔧 Installazione</option>
                    <option value="ASSISTENZA">🛠️ Assistenza</option>
                    <option value="PRODUZIONE">🏭 Produzione</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orario *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Time Slot Suggestions */}
                <TimeSlotSuggestions
                  selectedDate={formData.date}
                  selectedTime={formData.time}
                  onTimeSelect={(time) => setFormData({ ...formData, time })}
                  appointmentType={formData.type}
                  excludeAppointmentId={editingAppointment?.id}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Indirizzo
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Indirizzo appuntamento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Note aggiuntive..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingAppointment ? handleUpdateAppointment : handleCreateAppointment}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  {editingAppointment ? 'Aggiorna' : 'Crea'}
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamAppointments;