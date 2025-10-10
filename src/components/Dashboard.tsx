import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, FileText, TrendingUp, Clock, CheckCircle, AlertCircle, MapPin, DollarSign } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClients: 0,
    todayAppointments: 0,
    totalOrders: 0,
    monthlyRevenue: 0,
    recentActivities: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Carica statistiche clienti
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, created_at')
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      // Carica appuntamenti di oggi
      const today = new Date().toISOString().split('T')[0];
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, date, type')
        .eq('date', today);

      if (appointmentsError) throw appointmentsError;

      // Carica ordini del mese
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, created_at')
        .gte('created_at', startOfMonth);

      if (ordersError) throw ordersError;

      // Calcola revenue mensile
      const monthlyRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Attività recenti (ultimi 5 clienti)
      const recentCustomers = customers?.slice(0, 5) || [];

      setStats({
        totalClients: customers?.length || 0,
        todayAppointments: appointments?.length || 0,
        totalOrders: orders?.length || 0,
        monthlyRevenue,
        recentActivities: recentCustomers
      });

    } catch (error) {
      console.error('Errore nel caricamento dati dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers per le azioni rapide
  const handleAddNewClient = () => {
    navigate('/app/clients');
  };

  const handleScheduleAppointment = () => {
    navigate('/app/surveys');
  };

  const handleViewOrders = () => {
    navigate('/app/orders');
  };

  // Statistiche dinamiche basate sui dati reali
  const dashboardStats = [
    {
      title: 'Clienti Totali',
      value: stats.totalClients.toString(),
      change: stats.totalClients > 0 ? 'Attivi' : 'Nessun cliente',
      changeType: stats.totalClients > 0 ? 'positive' as const : 'neutral' as const,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Appuntamenti Oggi',
      value: stats.todayAppointments.toString(),
      change: stats.todayAppointments > 0 ? 'Programmati' : 'Nessun appuntamento',
      changeType: stats.todayAppointments > 0 ? 'positive' as const : 'neutral' as const,
      icon: Calendar,
      color: 'green'
    },
    {
      title: 'Ordini Questo Mese',
      value: stats.totalOrders.toString(),
      change: stats.totalOrders > 0 ? 'In corso' : 'Nessun ordine',
      changeType: stats.totalOrders > 0 ? 'positive' as const : 'neutral' as const,
      icon: FileText,
      color: 'yellow'
    },
    {
      title: 'Fatturato Mensile',
      value: `€${stats.monthlyRevenue.toLocaleString()}`,
      change: stats.monthlyRevenue > 0 ? 'Questo mese' : 'Nessun fatturato',
      changeType: stats.monthlyRevenue > 0 ? 'positive' as const : 'neutral' as const,
      icon: DollarSign,
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      green: 'bg-green-500 text-green-600 bg-green-50',
      yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
      purple: 'bg-purple-500 text-purple-600 bg-purple-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Caricamento Dashboard...</h1>
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            <p className="text-blue-100">Caricamento dati in corso...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Benvenuto, {user?.full_name || user?.email}!</h1>
        <p className="text-blue-100">
          Ecco una panoramica delle attività di oggi
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = getColorClasses(stat.color).split(' ');
          
          return (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${colorClasses[2]} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${colorClasses[1]}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  rispetto al mese scorso
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Azioni Rapide
          </h3>
          <div className="space-y-3">
            <button 
              onClick={handleAddNewClient}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium">Aggiungi Nuovo Cliente</span>
              </div>
            </button>
            <button 
              onClick={handleScheduleAppointment}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-green-600 mr-3" />
                <span className="font-medium">Programma Sopralluogo</span>
              </div>
            </button>
            <button 
              onClick={handleViewOrders}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-purple-600 mr-3" />
                <span className="font-medium">Gestisci Ordini</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Riepilogo Sistema
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Clienti Registrati
              </span>
              <span className="text-sm font-bold text-gray-900">{stats.totalClients}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Appuntamenti Oggi
              </span>
              <span className="text-sm font-bold text-gray-900">{stats.todayAppointments}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Ordini Questo Mese
              </span>
              <span className="text-sm font-bold text-gray-900">{stats.totalOrders}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Attività Recenti
          </h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Dashboard caricata
                </p>
                <p className="text-xs text-gray-500">Sistema operativo</p>
              </div>
            </div>
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Nuovo cliente registrato
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Nessuna attività recente
                  </p>
                  <p className="text-xs text-gray-500">Inizia aggiungendo clienti</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}