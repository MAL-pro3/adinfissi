import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { AppointmentService, Appointment } from '../services/appointmentService';

interface TimeSlotSuggestionsProps {
  selectedDate: string;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  appointmentType: Appointment['type'];
  excludeAppointmentId?: string;
}

interface DaySchedule {
  totalAppointments: number;
  busyHours: string[];
  appointments: Appointment[];
}

const TimeSlotSuggestions: React.FC<TimeSlotSuggestionsProps> = ({
  selectedDate,
  selectedTime,
  onTimeSelect,
  appointmentType,
  excludeAppointmentId
}) => {
  const [daySchedule, setDaySchedule] = useState<DaySchedule>({
    totalAppointments: 0,
    busyHours: [],
    appointments: []
  });
  const [hasConflict, setHasConflict] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      loadDaySchedule();
    }
  }, [selectedDate, appointmentType]);

  useEffect(() => {
    if (selectedDate && selectedTime) {
      checkTimeConflict();
    } else {
      setHasConflict(false);
    }
  }, [selectedDate, selectedTime, appointmentType, excludeAppointmentId]);

  const loadDaySchedule = async () => {
    setLoading(true);
    try {
      const schedule = await AppointmentService.getDayScheduleSummary(selectedDate, appointmentType);
      setDaySchedule(schedule);
    } catch (error) {
      console.error('Error loading day schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkTimeConflict = async () => {
    try {
      const conflict = await AppointmentService.checkTimeConflict(selectedDate, selectedTime, appointmentType, excludeAppointmentId);
      setHasConflict(conflict);
    } catch (error) {
      console.error('Error checking time conflict:', error);
      setHasConflict(false);
    }
  };

  if (!selectedDate) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-700">
          <Calendar size={20} />
          <span className="font-medium">Seleziona una data per vedere i suggerimenti orari</span>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <div className="space-y-4">
      {/* Data selezionata e riepilogo */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">
            {formatDate(selectedDate)}
          </h4>
          <span className="text-sm text-gray-600">
            {daySchedule.totalAppointments} appuntament{daySchedule.totalAppointments !== 1 ? 'i' : 'o'} programmati
          </span>
        </div>

        {daySchedule.totalAppointments > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Orari occupati: </span>
            {daySchedule.busyHours.map((time, index) => (
              <span key={time}>
                {formatTime(time)}
                {index < daySchedule.busyHours.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Conflitto orario */}
      {hasConflict && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertTriangle size={20} />
            <span className="font-medium">Conflitto orario!</span>
          </div>
          <p className="text-sm text-red-600">
            L'orario {formatTime(selectedTime)} è già occupato. Seleziona un altro orario.
          </p>
        </div>
      )}

      {/* Orario selezionato valido */}
      {selectedTime && !hasConflict && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle size={20} />
            <span className="font-medium">Orario disponibile: {formatTime(selectedTime)}</span>
          </div>
        </div>
      )}



      {/* Lista appuntamenti esistenti */}
      {daySchedule.appointments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3">
            {appointmentType === 'SOPRALLUOGO' ? 'Altri sopralluoghi' : 'Altri appuntamenti del team'}
          </h5>
          <div className="space-y-2">
            {daySchedule.appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="font-medium">{formatTime(appointment.time)}</span>
                  <span className="text-gray-600">{appointment.client_name}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  appointment.type === 'SOPRALLUOGO' ? 'bg-blue-100 text-blue-800' :
                  appointment.type === 'INSTALLAZIONE' ? 'bg-green-100 text-green-800' :
                  appointment.type === 'CONSEGNA' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {appointment.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotSuggestions;