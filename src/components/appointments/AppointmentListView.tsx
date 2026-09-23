import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '../../types';
import { Search, Calendar, Filter, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { getAppointmentStatusBadge, formatDate } from '../../utils/formatters';

interface AppointmentListViewProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: AppointmentStatus) => void;
}

export const AppointmentListView: React.FC<AppointmentListViewProps> = ({
  appointments,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter((app) => {
    // Search
    const clientName = app.client ? `${app.client.first_name} ${app.client.last_name}` : '';
    const plate = app.vehicle?.registration_number || '';
    const matchSearch =
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.reason.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchStatus = statusFilter === 'ALL' || app.status === statusFilter;

    // Date filter
    let matchDate = true;
    if (dateFilter === 'TODAY') {
      matchDate = app.date === todayStr;
    } else if (dateFilter === 'UPCOMING') {
      matchDate = app.date >= todayStr;
    } else if (dateFilter === 'PAST') {
      matchDate = app.date < todayStr;
    }

    return matchSearch && matchStatus && matchDate;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
      {/* Search and Filters toolbar */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par client, plaque ou motif d'intervention..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Date Filter Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-850">
            {[
              { id: 'ALL', label: 'Toutes dates' },
              { id: 'TODAY', label: "Aujourd'hui" },
              { id: 'UPCOMING', label: 'À venir' },
              { id: 'PAST', label: 'Passés' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setDateFilter(id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  dateFilter === id
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmé</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="COMPLETED">Terminé</option>
            <option value="CANCELLED">Annulé</option>
          </select>
        </div>
      </div>

      {/* Appointments Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Date & Heure</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Véhicule</th>
              <th className="py-3 px-4">Motif / Diagnostic</th>
              <th className="py-3 px-4">Statut</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  Aucun rendez-vous ne correspond à vos critères de filtrage.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((app) => {
                const badge = getAppointmentStatusBadge(app.status);

                return (
                  <tr key={app.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white font-mono">{formatDate(app.date)}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{app.time_slot}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {app.client ? (
                        <>
                          <div className="font-medium text-slate-200">
                            {app.client.first_name} {app.client.last_name}
                          </div>
                          <div className="text-[11px] text-slate-400">{app.client.phone}</div>
                        </>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {app.vehicle ? (
                        <>
                          <div className="font-mono text-amber-400 font-semibold">
                            {app.vehicle.registration_number}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {app.vehicle.brand} {app.vehicle.model}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-slate-200 truncate">{app.reason}</div>
                      {app.notes && (
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {app.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={app.status}
                        onChange={(e) => onStatusChange(app.id, e.target.value as AppointmentStatus)}
                        className={`text-xs px-2 py-1 rounded border font-medium bg-slate-950 focus:outline-none ${badge.className}`}
                      >
                        <option value="PENDING">En attente</option>
                        <option value="CONFIRMED">Confirmé</option>
                        <option value="IN_PROGRESS">En cours</option>
                        <option value="COMPLETED">Terminé</option>
                        <option value="CANCELLED">Annulé</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(app)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Modifier le rendez-vous"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(app.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Supprimer le rendez-vous"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
