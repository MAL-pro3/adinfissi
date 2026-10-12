import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Calendar, 
  CalendarCheck, 
  BarChart3, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  Home,
  MapPin,
  Trash2,
  ShoppingCart
} from 'lucide-react';
import { DataResetService } from '../services/dataReset';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'clients', label: 'Clienti', icon: Users },
  { id: 'surveys', label: 'Sopralluoghi', icon: MapPin },
  { id: 'team-appointments', label: 'Appuntamenti Team', icon: CalendarCheck },
  { id: 'orders', label: 'Ordini', icon: ShoppingCart },
  { id: 'invoices', label: 'Fatture', icon: FileText },
  { id: 'statistics', label: 'Statistiche', icon: BarChart3 },
];

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Header Sidebar */}
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600">
          <h1 className="text-white font-bold text-lg">Gestionale Infissi</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-blue-700 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Segretaria</p>
            </div>
          </div>
          <button
            onClick={DataResetService.confirmAndClearAllData}
            className="w-full flex items-center px-3 py-2 mb-2 text-sm text-brand-yellow-700 hover:bg-brand-yellow-50 rounded-lg transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Cancella Dati
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Esci
          </button>
        </div>
      </div>

      {/* Overlay per mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 p-1 rounded"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-900">
                {menuItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('it-IT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}