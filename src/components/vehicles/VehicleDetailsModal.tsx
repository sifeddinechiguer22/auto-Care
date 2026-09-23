import React from 'react';
import { Vehicle, Client, Repair, Appointment } from '../../types';
import { Modal } from '../common/Modal';
import { Car, User, Wrench, Calendar, Gauge, Fuel, Hash, Plus } from 'lucide-react';
import { formatDate, formatCurrency, getRepairStatusBadge } from '../../utils/formatters';

interface VehicleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  client?: Client | null;
  repairs: Repair[];
  appointments: Appointment[];
  onCreateRepair: (vehicleId: string) => void;
  onBookAppointment: (vehicleId: string) => void;
}

export const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  client,
  repairs,
  appointments,
  onCreateRepair,
  onBookAppointment,
}) => {
  if (!vehicle) return null;

  const vehicleRepairs = repairs.filter((r) => r.vehicle_id === vehicle.id);
  const vehicleAppointments = appointments.filter((a) => a.vehicle_id === vehicle.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${vehicle.brand} ${vehicle.model} (${vehicle.year})`}
      subtitle={`Immatriculation : ${vehicle.registration_number}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Technical overview cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-amber-400" />
              Immatriculation
            </span>
            <span className="text-sm font-bold text-amber-400 font-mono">
              {vehicle.registration_number}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
              Kilométrage
            </span>
            <span className="text-sm font-semibold text-white font-mono tabular-nums">
              {vehicle.mileage.toLocaleString('fr-FR')} km
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-emerald-400" />
              Motorisation
            </span>
            <span className="text-sm font-medium text-white">{vehicle.fuel_type}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" />
              Propriétaire
            </span>
            <span className="text-sm font-medium text-white truncate block">
              {client ? `${client.first_name} ${client.last_name}` : vehicle.owner_name || '—'}
            </span>
          </div>
        </div>

        {/* VIN & Internal Notes */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Numéro VIN (Châssis) :</span>
            <span className="font-mono text-slate-200 tracking-wider font-semibold">
              {vehicle.vin}
            </span>
          </div>
          {vehicle.notes && (
            <div className="pt-2 border-t border-slate-850 text-slate-300">
              <span className="text-amber-400 font-semibold">Consignes Atelier : </span>
              {vehicle.notes}
            </div>
          )}
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onCreateRepair(vehicle.id)}
            className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Ouvrir un Ordre de Réparation</span>
          </button>
          <button
            type="button"
            onClick={() => onBookAppointment(vehicle.id)}
            className="flex-1 py-2 px-3 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Planifier un Rendez-vous</span>
          </button>
        </div>

        {/* Repair History */}
        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-2.5">
            <Wrench className="w-4 h-4 text-amber-400" />
            Historique des Réparations & Services ({vehicleRepairs.length})
          </h4>

          {vehicleRepairs.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">Aucun ordre de réparation pour ce véhicule.</p>
          ) : (
            <div className="space-y-2">
              {vehicleRepairs.map((r) => {
                const badge = getRepairStatusBadge(r.status);
                return (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-white">{r.diagnosis || 'Inspection & Entretien périodique'}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Date : {formatDate(r.created_at)} · Mécanicien : {r.mechanic_name || 'Affecté'}</span>
                      <span className="font-mono text-amber-400 font-semibold tabular-nums">
                        {formatCurrency(r.total_amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
};
