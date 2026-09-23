import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '../../types';
import { ChevronLeft, ChevronRight, Clock, Car, User, CheckCircle2 } from 'lucide-react';
import { getAppointmentStatusBadge, formatDate } from '../../utils/formatters';

interface AppointmentCalendarViewProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onStatusChange: (id: string, newStatus: AppointmentStatus) => void;
}

export const AppointmentCalendarView: React.FC<AppointmentCalendarViewProps> = ({
  appointments,
  onSelectAppointment,
  onStatusChange,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month & total days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  // Map appointments by YYYY-MM-DD
  const appointmentsByDate: Record<string, Appointment[]> = {};
  appointments.forEach((app) => {
    if (!appointmentsByDate[app.date]) {
      appointmentsByDate[app.date] = [];
    }
    appointmentsByDate[app.date].push(app);
  });

  const selectedDayAppointments = appointmentsByDate[selectedDayStr] || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid (2 Cols) */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white tracking-tight capitalize">{monthName}</h3>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setCurrentDate(now);
                setSelectedDayStr(now.toISOString().split('T')[0]);
              }}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
          <span>Dim</span>
          <span>Lun</span>
          <span>Mar</span>
          <span>Mer</span>
          <span>Jeu</span>
          <span>Ven</span>
          <span>Sam</span>
        </div>

        {/* Days matrix */}
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-lg bg-slate-950/30" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayApps = appointmentsByDate[dateStr] || [];
            const isSelected = selectedDayStr === dateStr;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDayStr(dateStr)}
                className={`h-16 sm:h-20 p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10'
                    : isToday
                    ? 'border-slate-700 bg-slate-850'
                    : 'border-slate-850 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-semibold ${
                      isToday
                        ? 'text-amber-400'
                        : isSelected
                        ? 'text-white'
                        : 'text-slate-400'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayApps.length > 0 && (
                    <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-400">
                      {dayApps.length}
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 overflow-hidden">
                  {dayApps.slice(0, 2).map((app) => (
                    <div
                      key={app.id}
                      className="text-[10px] truncate px-1 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-800/80"
                    >
                      {app.time_slot.split(' - ')[0]} {app.reason}
                    </div>
                  ))}
                  {dayApps.length > 2 && (
                    <div className="text-[9px] text-slate-400 pl-1">
                      +{dayApps.length - 2} autre(s)
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda (1 Col) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
        <div className="pb-3 border-b border-slate-800 mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Agenda du jour sélectionné
          </h4>
          <p className="text-sm font-bold text-white mt-1">{formatDate(selectedDayStr)}</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {selectedDayAppointments.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Aucun rendez-vous prévu à cette date.
            </div>
          ) : (
            selectedDayAppointments.map((app) => {
              const badge = getAppointmentStatusBadge(app.status);

              return (
                <div
                  key={app.id}
                  className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white truncate">{app.reason}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{app.time_slot}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-900">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3 h-3 text-slate-500" />
                      <span className="truncate">
                        {app.client ? `${app.client.first_name} ${app.client.last_name}` : 'Client'}
                      </span>
                    </div>
                    {app.vehicle && (
                      <span className="font-mono text-amber-400 bg-amber-500/10 px-1 rounded text-[10px]">
                        {app.vehicle.registration_number}
                      </span>
                    )}
                  </div>

                  {/* Quick Status Selector */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-900">
                    <button
                      type="button"
                      onClick={() => onSelectAppointment(app)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                    >
                      Modifier le créneau
                    </button>
                    <select
                      value={app.status}
                      onChange={(e) => onStatusChange(app.id, e.target.value as AppointmentStatus)}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300 focus:outline-none"
                    >
                      <option value="PENDING">En attente</option>
                      <option value="CONFIRMED">Confirmé</option>
                      <option value="IN_PROGRESS">En cours</option>
                      <option value="COMPLETED">Terminé</option>
                      <option value="CANCELLED">Annulé</option>
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
