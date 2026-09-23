import React, { useState } from 'react';
import { Appointment, Client, Vehicle, AppointmentStatus } from '../types';
import { Plus, Calendar, List, Clock, Filter } from 'lucide-react';
import { AppointmentCalendarView } from '../components/appointments/AppointmentCalendarView';
import { AppointmentListView } from '../components/appointments/AppointmentListView';
import { AppointmentFormModal } from '../components/appointments/AppointmentFormModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

interface AppointmentsPageProps {
  appointments: Appointment[];
  clients: Client[];
  vehicles: Vehicle[];
  onCreateAppointment: (data: Omit<Appointment, 'id' | 'created_at' | 'client' | 'vehicle'>) => Promise<void>;
  onUpdateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  onDeleteAppointment: (id: string) => Promise<void>;
  initialClientId?: string;
  initialVehicleId?: string;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({
  appointments,
  clients,
  vehicles,
  onCreateAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  initialClientId,
  initialVehicleId,
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingAppointment(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Appointment, 'id' | 'created_at' | 'client' | 'vehicle'>) => {
    setIsSubmitting(true);
    try {
      if (editingAppointment) {
        await onUpdateAppointment(editingAppointment.id, data);
      } else {
        await onCreateAppointment(data);
      }
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    await onUpdateAppointment(id, { status: newStatus });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAppointmentId) return;
    setIsSubmitting(true);
    try {
      await onDeleteAppointment(deletingAppointmentId);
      setDeletingAppointmentId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Planning & Rendez-vous Atelier</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Rendez-vous clients, créneaux de diagnostic et affectation des baies
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'calendar'
                  ? 'bg-slate-800 text-amber-400 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Vue Calendrier</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-amber-400 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Vue Liste</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Rendez-vous</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'calendar' ? (
        <AppointmentCalendarView
          appointments={appointments}
          onSelectAppointment={handleOpenEdit}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <AppointmentListView
          appointments={appointments}
          onEdit={handleOpenEdit}
          onDelete={(id) => setDeletingAppointmentId(id)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Form Modal */}
      <AppointmentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        appointment={editingAppointment}
        clients={clients}
        vehicles={vehicles}
        initialClientId={initialClientId}
        initialVehicleId={initialVehicleId}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingAppointmentId}
        onClose={() => setDeletingAppointmentId(null)}
        onConfirm={handleDeleteConfirm}
        title="Annuler le rendez-vous"
        message="Êtes-vous sûr de vouloir supprimer ce créneau de rendez-vous du planning de l'atelier ?"
        confirmText="Supprimer le créneau"
        cancelText="Annuler"
        isDanger
        isLoading={isSubmitting}
      />
    </div>
  );
};
