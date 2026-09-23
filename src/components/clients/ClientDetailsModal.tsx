import React from 'react';
import { Client, Vehicle, Appointment, Repair } from '../../types';
import { Modal } from '../common/Modal';
import { Car, Calendar, Wrench, Phone, Mail, MapPin, Plus } from 'lucide-react';
import { formatDate, formatCurrency, getAppointmentStatusBadge, getRepairStatusBadge } from '../../utils/formatters';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  vehicles: Vehicle[];
  appointments: Appointment[];
  repairs: Repair[];
  onAddVehicle: (clientId: string) => void;
  onBookAppointment: (clientId: string) => void;
}

export const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  isOpen,
  onClose,
  client,
  vehicles,
  appointments,
  repairs,
  onAddVehicle,
  onBookAppointment,
}) => {
  if (!client) return null;

  const clientVehicles = vehicles.filter((v) => v.client_id === client.id);
  const clientAppointments = appointments.filter((a) => a.client_id === client.id);
  const clientRepairs = repairs.filter((r) => r.client_id === client.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${client.first_name} ${client.last_name}`}
      subtitle={`Compte Client · Enregistré le ${formatDate(client.created_at)}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Contact info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Phone className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{client.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{client.address || 'Aucune adresse renseignée'}</span>
          </div>
        </div>

        {client.notes && (
          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs text-amber-200/90">
            <span className="font-semibold text-amber-300">Note Atelier : </span>
            {client.notes}
          </div>
        )}

        {/* Client Vehicles Section */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Car className="w-4 h-4 text-sky-400" />
              Véhicules Enregistrés ({clientVehicles.length})
            </h4>
            <button
              type="button"
              onClick={() => onAddVehicle(client.id)}
              className="px-2.5 py-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Ajouter un Véhicule</span>
            </button>
          </div>

          {clientVehicles.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">Aucun véhicule associé à ce client.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {clientVehicles.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span>
                      {v.brand} {v.model}
                    </span>
                    <span className="font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {v.registration_number}
                    </span>
                  </div>
                  <div className="mt-2 text-slate-400 space-y-0.5 text-[11px]">
                    <div>Année : {v.year} · Carburant : {v.fuel_type}</div>
                    <div className="tabular-nums">Kilométrage : {v.mileage.toLocaleString('fr-FR')} km</div>
                    <div className="font-mono text-[10px] text-slate-500">VIN : {v.vin}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointment History */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Historique des Rendez-vous ({clientAppointments.length})
            </h4>
            <button
              type="button"
              onClick={() => onBookAppointment(client.id)}
              className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Nouveau Rendez-vous</span>
            </button>
          </div>

          {clientAppointments.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">Aucun rendez-vous passé enregistré.</p>
          ) : (
            <div className="space-y-2">
              {clientAppointments.map((app) => {
                const badge = getAppointmentStatusBadge(app.status);
                return (
                  <div
                    key={app.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-medium text-white">{app.reason}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(app.date)} · Créneau : {app.time_slot}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Repair History */}
        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-2.5">
            <Wrench className="w-4 h-4 text-emerald-400" />
            Historique des Réparations & Interventions ({clientRepairs.length})
          </h4>

          {clientRepairs.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">Aucun ordre de réparation enregistré pour ce client.</p>
          ) : (
            <div className="space-y-2">
              {clientRepairs.map((rep) => {
                const badge = getRepairStatusBadge(rep.status);
                return (
                  <div
                    key={rep.id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{rep.diagnosis || 'Entretien général et révision'}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Technicien : {rep.mechanic_name || 'Affecté'}</span>
                      <span className="font-mono text-amber-400 font-semibold tabular-nums">
                        Total : {formatCurrency(rep.total_amount)}
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
