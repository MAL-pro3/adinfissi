import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Client, ClientFormData, ClientStatus, CLIENT_STATUS_LABELS } from '../types';

interface ClientFormProps {
  client?: Client | null;
  onSubmit: (formData: ClientFormData) => void;
  onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    surname: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postal_code: '',
    status: 'PREVENTIVO_INIZIALE',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<ClientFormData>>({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        surname: client.surname,
        phone: client.phone,
        email: client.email,
        address: client.address,
        city: client.city,
        postal_code: client.postal_code,
        status: client.status,
        notes: client.notes || ''
      });
    }
  }, [client]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ClientFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Il nome è obbligatorio';
    }

    if (!formData.surname.trim()) {
      newErrors.surname = 'Il cognome è obbligatorio';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Il telefono è obbligatorio';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Formato telefono non valido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email è obbligatoria';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato email non valido';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'L\'indirizzo è obbligatorio';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La città è obbligatoria';
    }

    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'Il CAP è obbligatorio';
    } else if (!/^\d{5}$/.test(formData.postal_code)) {
      newErrors.postal_code = 'Il CAP deve essere di 5 cifre';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Rimuovi l'errore quando l'utente inizia a digitare
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {client ? 'Modifica Cliente' : 'Nuovo Cliente'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Inserisci il nome"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Cognome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cognome *
              </label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => handleChange('surname', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.surname ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Inserisci il cognome"
              />
              {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname}</p>}
            </div>

            {/* Telefono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefono *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="333-1234567"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="cliente@email.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Indirizzo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indirizzo *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Via Roma 123"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            {/* Città */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Città *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Milano"
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            {/* CAP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CAP *
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.postal_code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="20100"
                maxLength={5}
              />
              {errors.postal_code && <p className="text-red-500 text-sm mt-1">{errors.postal_code}</p>}
            </div>

            {/* Stato */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stato del Cliente
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as ClientStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Note */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Note aggiuntive sul cliente..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {client ? 'Aggiorna' : 'Crea'} Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;