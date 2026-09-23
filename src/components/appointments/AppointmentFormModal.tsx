import React, { useState, useEffect } from 'react';
import { Appointment, Client, Vehicle, AppointmentStatus } from '../../types';
import { Modal } from '../common/Modal';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Appointment, 'id' | 'created_at' | 'client' | 'vehicle'>) => Promise<void>;
  appointment?: Appointment | null;
  clients: Client[];
  vehicles: Vehicle[];
  initialClientId?: string;
  initialVehicleId?: string;
  isLoading?: boolean;
}

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  appointment,
  clients,
  vehicles,
  initialClientId,
  initialVehicleId,
  isLoading = false,
}) => {
  const [clientId, setClientId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 - 10:00');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<AppointmentStatus>('PENDING');
  const [notes, setNotes] = useState('');

  // Filter vehicles by selected client
  const clientVehicles = vehicles.filter((v) => (clientId ? v.client_id === clientId : true));

  useEffect(() => {
    if (appointment) {
      setClientId(appointment.client_id);
      setVehicleId(appointment.vehicle_id);
      setDate(appointment.date);
      setTimeSlot(appointment.time_slot);
      setReason(appointment.reason);
      setStatus(appointment.status);
      setNotes(appointment.notes || '');
    } else {
      const defaultCli = initialClientId || clients[0]?.id || '';
      setClientId(defaultCli);
      const matchingVeh = initialVehicleId || vehicles.find((v) => v.client_id === defaultCli)?.id || vehicles[0]?.id || '';
      setVehicleId(matchingVeh);
      setDate(new Date().toISOString().split('T')[0]);
      setTimeSlot('09:00 - 10:00');
      setReason('');
      setStatus('PENDING');
      setNotes('');
    }
  }, [appointment, initialClientId, initialVehicleId, clients, vehicles, isOpen]);

  // Keep vehicleId synchronized when client changes
  const handleClientChange = (newClientId: string) => {
    setClientId(newClientId);
    const available = vehicles.filter((v) => v.client_id === newClientId);
    if (available.length > 0) {
      setVehicleId(available[0].id);
    } else {
      setVehicleId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      client_id: clientId,
      vehicle_id: vehicleId,
      date,
      time_slot: timeSlot,
      reason: reason.trim(),
      status,
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={appointment ? 'Modifier le Rendez-vous' : 'Planifier un Rendez-vous Atelier'}
      subtitle="Affecter un pont élévateur et un créneau horaire atelier"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Client selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Client <span className="text-amber-400">*</span>
          </label>
          <select
            required
            value={clientId}
            onChange={(e) => handleClientChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="" disabled>
              Sélectionner un client...
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name} ({c.phone})
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Véhicule <span className="text-amber-400">*</span>
          </label>
          <select
            required
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="" disabled>
              Sélectionner un véhicule...
            </option>
            {clientVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                [{v.registration_number}] {v.brand} {v.model} ({v.year})
              </option>
            ))}
          </select>
          {clientVehicles.length === 0 && (
            <p className="text-[11px] text-amber-400 mt-1">
              Note : Ce client n'a aucun véhicule enregistré pour le moment.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Date du Rendez-vous <span className="text-amber-400">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Créneau Horaire <span className="text-amber-400">*</span>
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="08:00 - 09:30">08:00 - 09:30 (Dépôt du matin)</option>
              <option value="09:30 - 11:00">09:30 - 11:00 (Créneau diagnostic)</option>
              <option value="11:00 - 12:30">11:00 - 12:30 (Midi)</option>
              <option value="13:30 - 15:00">13:30 - 15:00 (Début d'après-midi)</option>
              <option value="15:00 - 16:30">15:00 - 16:30 (Fin d'après-midi)</option>
              <option value="16:30 - 18:00">16:30 - 18:00 (Restitution / Bilan)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Motif de Prise en Charge / Symptômes <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="ex. Bruit au freinage, vidange moteur + filtres, voyant moteur allumé"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Statut du Rendez-vous
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="PENDING">En attente (À confirmer)</option>
            <option value="CONFIRMED">Confirmé (Planifié en atelier)</option>
            <option value="IN_PROGRESS">En cours (Véhicule sur pont)</option>
            <option value="COMPLETED">Terminé (Prêt pour restitution)</option>
            <option value="CANCELLED">Annulé</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Remarques & Consignes Client
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instructions spéciales, clé déposée dans la boîte aux lettres, heure souhaitée..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            )}
            {appointment ? 'Enregistrer les Modifications' : 'Confirmer le Rendez-vous'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
