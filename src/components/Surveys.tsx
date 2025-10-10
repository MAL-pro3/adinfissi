import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Plus, Edit, Trash2, CheckCircle, X, Filter, Search, AlertTriangle } from 'lucide-react';
import { AppointmentService, Appointment } from '../services/appointmentService';
import { ClientService } from '../services/clientService';
import { Client } from '../types';
import TimeSlotSuggestions from './TimeSlotSuggestions';

const Surveys: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Appointment['status'] | 'ALL'>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    client_id: '',
    date: '',
    time: '',
    notes: '',
    address: ''
  });

  useEffect(() => {
    loadData();
    
    // Listen for client status changes
    const handleClientStatusChange = () => {
      loadData();
    };
    
    window.addEventListener('clientStatusChanged', handleClientStatusChange);
    
    return () => {
      window.removeEventListener('clientStatusChanged', handleClientStatusChange);
    };
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter, selectedDate]);

  const loadData = async () => {
    try {
      const allAppointments = await AppointmentService.getAppointmentsByType('SOPRALLUOGO');
      const allClients = await ClientService.getAllClients();
      
      setAppointments(allAppointments);
      setClients(allClients);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        (apt.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (apt.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (apt.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter(apt => apt.date === selectedDate);
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

    setFilteredAppointments(filtered);
  };

  const handleCreateAppointment = async () => {
    if (!formData.client_id || !formData.date || !formData.time) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    try {
      // Controllo conflitti orari solo con altri sopralluoghi
      const hasConflict = await AppointmentService.checkTimeConflict(formData.date, formData.time, 'SOPRALLUOGO');
      if (hasConflict) {
        alert(`L'orario ${formData.time} è già occupato da un altro sopralluogo per il ${formData.date}. Seleziona un altro orario.`);
        return;
      }

      const client = clients.find(c => c.id.toString() === formData.client_id);
      if (!client) return;

      const appointmentData = {
        client_id: formData.client_id,
        client_name: `${client.name} ${client.surname}`,
        type: 'SOPRALLUOGO' as const,
        date: formData.date,
        time: formData.time,
        status: 'PROGRAMMATO' as const,
        notes: formData.notes,
        address: formData.address || `${client.address}, ${client.city}`
      };

      await AppointmentService.createAppointment(appointmentData);
      loadData();
      resetForm();
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Errore durante la creazione del sopralluogo');
    }
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment || !formData.date || !formData.time) return;

    try {
      // Controllo conflitti orari solo con altri sopralluoghi (escludendo l'appuntamento corrente)
      const hasConflict = await AppointmentService.checkTimeConflict(formData.date, formData.time, 'SOPRALLUOGO', editingAppointment.id);
      if (hasConflict) {
        alert(`L'orario ${formData.time} è già occupato da un altro sopralluogo per il ${formData.date}. Seleziona un altro orario.`);
        return;
      }

      await AppointmentService.updateAppointment(editingAppointment.id, {
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
        address: formData.address
      });

      loadData();
      resetForm();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Errore durante l\'aggiornamento del sopralluogo');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo sopralluogo?')) {
      try {
        await AppointmentService.deleteAppointment(id);
        loadData();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Errore durante l\'eliminazione del sopralluogo');
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

  const resetForm = () => {
    setFormData({
      client_id: '',
      date: '',
      time: '',
      notes: '',
      address: ''
    });
    setShowForm(false);
    setEditingAppointment(null);
  };

  const openEditForm = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      client_id: appointment.client_id,
      date: appointment.date,
      time: appointment.time,
      notes: appointment.notes || '',
      address: appointment.address
    });
    setShowForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROGRAMMATO': return 'bg-blue-100 text-blue-800';
      case 'COMPLETATO': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PROGRAMMATO': return 'Programmato';
      case 'COMPLETATO': return 'Completato';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stats = {
    total: appointments.length,
    programmati: appointments.filter(a => a.status === 'PROGRAMMATO').length,
    completati: appointments.filter(a => a.status === 'COMPLETATO').length,
    oggi: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sopralluoghi</h1>
          <p className="text-gray-600">Gestisci i sopralluoghi programmati</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nuovo Sopralluogo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Totali</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">{stats.programmati}</div>
          <div className="text-sm text-gray-600">Programmati</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{stats.confermati}</div>
          <div className="text-sm text-gray-600">Confermati</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-600">{stats.completati}</div>
          <div className="text-sm text-gray-600">Completati</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">{stats.oggi}</div>
          <div className="text-sm text-gray-600">Oggi</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cerca cliente, indirizzo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Appointment['status'] | 'ALL')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">Tutti gli stati</option>
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
              setStatusFilter('ALL');
              setSelectedDate('');
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset Filtri
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredAppointments.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun sopralluogo</h3>
            <p className="text-gray-500">
              {appointments.length === 0 
                ? 'Non ci sono sopralluoghi programmati'
                : 'Nessun sopralluogo corrisponde ai filtri selezionati'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {appointment.client_name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span className="truncate">{appointment.address}</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {appointment.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {appointment.status === 'PROGRAMMATO' && (
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'COMPLETATO')}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Completa"
                      >
                        <CheckCircle size={20} />
                      </button>
                    )}

                    <button
                      onClick={() => openEditForm(appointment)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Modifica"
                    >
                      <Edit size={20} />
                    </button>

                    <button
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Elimina"
                    >
                      <Trash2 size={20} />
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
                {editingAppointment ? 'Modifica Sopralluogo' : 'Nuovo Sopralluogo'}
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
                         address: client ? `${client.address}, ${client.city}` : ''
                       });
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
              )}

              <div className="grid grid-cols-2 gap-4">
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
                    Ora *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Suggerimenti orari */}
              <TimeSlotSuggestions
                selectedDate={formData.date}
                selectedTime={formData.time}
                onTimeSelect={(time) => setFormData({ ...formData, time })}
                appointmentType="SOPRALLUOGO"
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
                  placeholder="Indirizzo del sopralluogo"
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

export default Surveys;