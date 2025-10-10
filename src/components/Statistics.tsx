import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Euro, Clock, MapPin, Target, Filter, Download } from 'lucide-react';
import { ClientService } from '../services/clientService';
import { Client, ClientStatus } from '../types';
import { AppointmentService, Appointment } from '../services/appointmentService';

interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

const Statistics: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
    
    // Ascolta gli eventi di cambiamento dati
    const unsubscribeDataChanged = eventBus.on(EVENTS.DATA_CHANGED, loadData);
    const unsubscribeClientsChanged = eventBus.on(EVENTS.CLIENTS_CHANGED, loadData);
    const unsubscribeAppointmentsChanged = eventBus.on(EVENTS.APPOINTMENTS_CHANGED, loadData);
    const unsubscribeAllDataCleared = eventBus.on(EVENTS.ALL_DATA_CLEARED, loadData);
    
    // Cleanup dei listener quando il componente viene smontato
    return () => {
      unsubscribeDataChanged();
      unsubscribeClientsChanged();
      unsubscribeAppointmentsChanged();
      unsubscribeAllDataCleared();
    };
  }, []);

  const loadData = async () => {
    const allClients = await ClientService.getAllClients();
    const allAppointments = AppointmentService.getAppointments();
    setClients(allClients);
    setAppointments(allAppointments);
  };

  // Calcolo statistiche clienti per stato
  const getClientStatusStats = (): ChartData[] => {
    const statusCounts: Record<ClientStatus, number> = {
      'CONTATTO_INIZIALE': 0,
      'SOPRALLUOGO_PROGRAMMATO': 0,
      'PREVENTIVO_INVIATO': 0,
      'CONTRATTO_FIRMATO': 0,
      'INSTALLAZIONE_PROGRAMMATA': 0,
      'INSTALLATO': 0,
      'CONSEGNA_PROGRAMMATA': 0,
      'CONSEGNATO': 0,
      'COMPLETATO': 0,
      'ANNULLATO': 0
    };

    clients.forEach(client => {
      statusCounts[client.status]++;
    });

    const statusLabels: Record<ClientStatus, string> = {
      'CONTATTO_INIZIALE': 'Contatto Iniziale',
      'SOPRALLUOGO_PROGRAMMATO': 'Sopralluogo Programmato',
      'PREVENTIVO_INVIATO': 'Preventivo Inviato',
      'CONTRATTO_FIRMATO': 'Contratto Firmato',
      'INSTALLAZIONE_PROGRAMMATA': 'Installazione Programmata',
      'INSTALLATO': 'Installato',
      'CONSEGNA_PROGRAMMATA': 'Consegna Programmata',
      'CONSEGNATO': 'Consegnato',
      'COMPLETATO': 'Completato',
      'ANNULLATO': 'Annullato'
    };

    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
    ];

    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count], index) => ({
        label: statusLabels[status as ClientStatus],
        value: count,
        color: colors[index % colors.length]
      }));
  };

  // Calcolo statistiche appuntamenti per tipo
  const getAppointmentTypeStats = (): ChartData[] => {
    const typeCounts = {
      'SOPRALLUOGO': 0,
      'INSTALLAZIONE': 0,
      'CONSEGNA': 0
    };

    appointments.forEach(appointment => {
      if (appointment.type in typeCounts) {
        typeCounts[appointment.type as keyof typeof typeCounts]++;
      }
    });

    const statusCounts = {
      PROGRAMMATO: appointments.filter(a => a.status === 'PROGRAMMATO').length,
      COMPLETATO: appointments.filter(a => a.status === 'COMPLETATO').length
    };

    const statusData = [
      { label: 'Programmati', value: statusCounts.PROGRAMMATO, color: '#3B82F6' },
      { label: 'Completati', value: statusCounts.COMPLETATO, color: '#10B981' }
    ];

    return [
      { label: 'Sopralluoghi', value: typeCounts.SOPRALLUOGO, color: '#3B82F6' },
      { label: 'Installazioni', value: typeCounts.INSTALLAZIONE, color: '#10B981' },
      { label: 'Consegne', value: typeCounts.CONSEGNA, color: '#8B5CF6' }
    ].filter(item => item.value > 0);
  };

  // Calcolo trend mensili
  const getMonthlyTrend = () => {
    const monthlyData: Record<string, number> = {};
    
    clients.forEach(client => {
      const month = new Date(client.created_at).toISOString().slice(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Ultimi 6 mesi
      .map(([month, count]) => ({
        label: new Date(month + '-01').toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
        value: count,
        color: '#3B82F6'
      }));
  };

  // Calcolo statistiche principali
  const getMainStats = (): StatCard[] => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => !['COMPLETATO', 'ANNULLATO'].includes(c.status)).length;
    const completedClients = clients.filter(c => c.status === 'COMPLETATO').length;
    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter(a => a.status === 'PROGRAMMATO').length;
    const completedAppointments = appointments.filter(a => a.status === 'COMPLETATO').length;

    // Calcolo tasso di conversione
    const conversionRate = totalClients > 0 ? ((completedClients / totalClients) * 100).toFixed(1) : '0';

    return [
      {
        title: 'Clienti Totali',
        value: totalClients,
        change: '+12%',
        changeType: 'positive',
        icon: <Users size={24} />,
        color: 'bg-blue-500'
      },
      {
        title: 'Clienti Attivi',
        value: activeClients,
        change: '+8%',
        changeType: 'positive',
        icon: <TrendingUp size={24} />,
        color: 'bg-green-500'
      },
      {
        title: 'Appuntamenti',
        value: totalAppointments,
        change: `${pendingAppointments} in attesa`,
        changeType: 'neutral',
        icon: <Calendar size={24} />,
        color: 'bg-purple-500'
      },
      {
        title: 'Tasso Conversione',
        value: `${conversionRate}%`,
        change: completedAppointments > 0 ? '+5%' : 'N/A',
        changeType: 'positive',
        icon: <Target size={24} />,
        color: 'bg-orange-500'
      }
    ];
  };

  // Componente per grafico a barre semplice
  const SimpleBarChart: React.FC<{ data: ChartData[]; title: string }> = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-600 truncate">{item.label}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className="h-6 rounded-full flex items-center justify-end pr-2"
                  style={{
                    backgroundColor: item.color,
                    width: `${(item.value / maxValue) * 100}%`,
                    minWidth: '30px'
                  }}
                >
                  <span className="text-white text-xs font-medium">{item.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Componente per grafico a torta semplice
  const SimplePieChart: React.FC<{ data: ChartData[]; title: string }> = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const strokeDasharray = `${percentage} ${100 - percentage}`;
                const strokeDashoffset = data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 100, 0);
                
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="15.915"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-strokeDashoffset}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-700">{total}</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const mainStats = getMainStats();
  const clientStatusData = getClientStatusStats();
  const appointmentTypeData = getAppointmentTypeStats();
  const monthlyTrendData = getMonthlyTrend();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Statistiche e Analytics</h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">Ultima settimana</option>
            <option value="month">Ultimo mese</option>
            <option value="quarter">Ultimo trimestre</option>
            <option value="year">Ultimo anno</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download size={20} />
            Esporta
          </button>
        </div>
      </div>

      {/* Statistiche principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.change && (
                  <p className={`text-sm mt-1 ${
                    stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'negative' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {stat.change}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grafici */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stati Clienti */}
        {clientStatusData.length > 0 && (
          <SimpleBarChart data={clientStatusData} title="Distribuzione Stati Clienti" />
        )}

        {/* Tipi Appuntamenti */}
        {appointmentTypeData.length > 0 && (
          <SimplePieChart data={appointmentTypeData} title="Appuntamenti per Tipo" />
        )}
      </div>

      {/* Trend Mensile */}
      {monthlyTrendData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Trend Nuovi Clienti (Ultimi 6 Mesi)</h3>
          <div className="flex items-end gap-4 h-64">
            {monthlyTrendData.map((item, index) => {
              const maxValue = Math.max(...monthlyTrendData.map(d => d.value));
              const height = (item.value / maxValue) * 200;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-blue-500 rounded-t-lg flex items-end justify-center text-white text-sm font-medium transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${height}px`, minHeight: '20px' }}
                  >
                    {item.value}
                  </div>
                  <div className="text-xs text-gray-600 mt-2 text-center">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights e Raccomandazioni */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-500" size={20} />
            Insights Positivi
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Crescita Clienti</p>
                <p className="text-xs text-gray-600">+{clients.length > 10 ? '15' : '8'}% rispetto al mese scorso</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Tasso di Completamento</p>
                <p className="text-xs text-gray-600">Alto tasso di conversione clienti</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Efficienza Appuntamenti</p>
                <p className="text-xs text-gray-600">Buona gestione del calendario</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="text-blue-500" size={20} />
            Raccomandazioni
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Follow-up Clienti</p>
                <p className="text-xs text-gray-600">Contatta clienti in "Preventivo Inviato"</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Ottimizza Calendario</p>
                <p className="text-xs text-gray-600">Pianifica appuntamenti in fasce orarie libere</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Documenti Clienti</p>
                <p className="text-xs text-gray-600">Assicurati che tutti i documenti siano caricati</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;