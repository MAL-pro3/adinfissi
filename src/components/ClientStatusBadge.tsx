import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ClientStatus, CLIENT_STATUS_LABELS } from '../types';

interface ClientStatusBadgeProps {
  status: ClientStatus;
  onChange: (newStatus: ClientStatus) => void;
}

// Configurazione colori per ogni stato
const STATUS_COLORS: Record<ClientStatus, { bg: string; text: string; border: string }> = {
  PREVENTIVO_INIZIALE: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  SOPRALLUOGO_PROGRAMMATO: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  PREVENTIVO_UFFICIALE: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  CONTRATTO_FIRMATO: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  ORDINE_INVIATO: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  ORDINE_ARRIVATO: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  CONSEGNATO: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' }
};

const ClientStatusBadge: React.FC<ClientStatusBadgeProps> = ({ status, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const colors = STATUS_COLORS[status];

  const handleStatusChange = (newStatus: ClientStatus) => {
    onChange(newStatus);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border} hover:opacity-80 transition-opacity`}
      >
        {CLIENT_STATUS_LABELS[status]}
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay per chiudere il dropdown */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              {Object.entries(CLIENT_STATUS_LABELS).map(([statusKey, label]) => {
                const statusValue = statusKey as ClientStatus;
                const statusColors = STATUS_COLORS[statusValue];
                const isSelected = statusValue === status;
                
                return (
                  <button
                    key={statusKey}
                    onClick={() => handleStatusChange(statusValue)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                      isSelected ? 'bg-gray-50' : ''
                    }`}
                  >
                    <span 
                      className={`inline-block w-3 h-3 rounded-full ${statusColors.bg} ${statusColors.border} border`}
                    />
                    <span className={isSelected ? 'font-medium' : ''}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientStatusBadge;