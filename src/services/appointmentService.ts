import { supabase } from './supabase';

export interface Appointment {
  id: string;
  client_id: string | null;
  client_name: string;
  type: 'SOPRALLUOGO' | 'INSTALLAZIONE' | 'ASSISTENZA' | 'PRODUZIONE';
  date: string;
  time: string;
  status: 'PROGRAMMATO' | 'COMPLETATO';
  notes?: string;
  address: string;
  created_at?: string;
  updated_at?: string;
}

// Compatibility aliases for existing code
export type AppointmentType = Appointment['type'];
export type AppointmentStatus = Appointment['status'];

interface DaySchedule {
  totalAppointments: number;
  busyHours: string[];
  appointments: Appointment[];
}

interface AppointmentStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  thisWeek: number;
  thisMonth: number;
}

class AppointmentServiceClass {
  async getAllAppointments(): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  }

  async getAppointmentsByType(type: AppointmentType): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('type', type)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching appointments by type:', error);
      return [];
    }
  }

  async getAppointmentById(id: string): Promise<Appointment | null> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching appointment by id:', error);
      return null;
    }
  }

  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment | null> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      return null;
    }
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      return null;
    }
  }

  async deleteAppointment(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return false;
    }
  }

  async getAppointmentStats(): Promise<AppointmentStats> {
    try {
      const appointments = await this.getAllAppointments();
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats: AppointmentStats = {
        total: appointments.length,
        byType: {},
        byStatus: {},
        thisWeek: 0,
        thisMonth: 0
      };

      appointments.forEach(appointment => {
        // Count by type
        stats.byType[appointment.type] = (stats.byType[appointment.type] || 0) + 1;
        
        // Count by status
        stats.byStatus[appointment.status] = (stats.byStatus[appointment.status] || 0) + 1;
        
        // Count this week
        const appointmentDate = new Date(appointment.date);
        if (appointmentDate >= startOfWeek) {
          stats.thisWeek++;
        }
        
        // Count this month
        if (appointmentDate >= startOfMonth) {
          stats.thisMonth++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting appointment stats:', error);
      return {
        total: 0,
        byType: {},
        byStatus: {},
        thisWeek: 0,
        thisMonth: 0
      };
    }
  }

  async checkTimeConflict(date: string, time: string, type: AppointmentType, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('appointments')
        .select('id')
        .eq('date', date)
        .eq('time', time)
        .eq('type', type);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error checking time conflict:', error);
      return false;
    }
  }

  async getDayScheduleSummary(date: string, type: AppointmentType): Promise<DaySchedule> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('date', date)
        .eq('type', type)
        .order('time', { ascending: true });

      if (error) throw error;
      
      const appointments = data || [];
      
      return {
        totalAppointments: appointments.length,
        busyHours: appointments.map(apt => apt.time).sort(),
        appointments: appointments
      };
    } catch (error) {
      console.error('Error getting day schedule summary:', error);
      return {
        totalAppointments: 0,
        busyHours: [],
        appointments: []
      };
    }
  }

  async getAvailableTimeSlots(date: string, type: AppointmentType): Promise<string[]> {
    try {
      const schedule = await this.getDayScheduleSummary(date, type);
      const allSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        '17:00', '17:30', '18:00'
      ];
      
      return allSlots.filter(slot => !schedule.busyHours.includes(slot));
    } catch (error) {
      console.error('Error getting available time slots:', error);
      return [];
    }
  }

  // Legacy compatibility methods
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('date', date)
        .order('time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching appointments by date:', error);
      return [];
    }
  }

  async getClientAppointments(customerId: string): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_id', customerId)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        console.error('Error fetching appointments by customer:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching client appointments:', error);
      return [];
    }
  }

  async getScheduledAppointments(): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'PROGRAMMATO')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching scheduled appointments:', error);
      return [];
    }
  }

  async getTodayAppointments(): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointmentsByDate(today);
  }

  async getRecentAppointments(limit: number = 10): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent appointments:', error);
      return [];
    }
  }

  async searchAppointments(searchTerm: string): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .or(`client_name.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching appointments:', error);
      return [];
    }
  }
}

export const AppointmentService = new AppointmentServiceClass();