import React from 'react';
import { Repair, RepairStatus } from '../../types';
import { Modal } from '../common/Modal';
import {
  Wrench,
  User,
  Car,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Receipt,
  ArrowRight,
} from 'lucide-react';
import {
  formatDate,
  formatCurrency,
  getRepairStatusBadge,
} from '../../utils/formatters';

interface RepairDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  repair: Repair | null;
  onUpdateStatus: (id: string, newStatus: RepairStatus) => void;
  onGenerateInvoice: (repair: Repair) => void;
}

export const RepairDetailsModal: React.FC<RepairDetailsModalProps> = ({
  isOpen,
  onClose,
  repair,
  onUpdateStatus,
  onGenerateInvoice,
}) => {
  if (!repair) return null;

  const currentBadge = getRepairStatusBadge(repair.status);

  const statusOrder: RepairStatus[] = [
    'DIAGNOSIS',
    'PARTS_WAIT',
    'IN_PROGRESS',
    'QUALITY_CHECK',
    'COMPLETED',
    'DELIVERED',
  ];

  const currentIndex = statusOrder.indexOf(repair.status);
  const nextStatus = currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ordre de Réparation #${repair.id}`}
      subtitle={`Créé le ${formatDate(repair.created_at)} · Mécanicien : ${repair.mechanic_name || 'Affecté'}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Status Stepper Tracker */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cycle de Vie de l'Intervention
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${currentBadge.className}`}>
              {currentBadge.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {statusOrder.map((st, idx) => {
              const info = getRepairStatusBadge(st);
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => onUpdateStatus(repair.id, st)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-semibold'
                      : isPast
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <div className="text-[10px] font-mono">0{idx + 1}</div>
                  <div className="text-xs truncate mt-0.5">{info.label.split(' ')[0]}</div>
                </button>
              );
            })}
          </div>

          {nextStatus && (
            <div className="mt-3 pt-3 border-t border-slate-900 flex justify-end">
              <button
                type="button"
                onClick={() => onUpdateStatus(repair.id, nextStatus)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Passer à l'étape {getRepairStatusBadge(nextStatus).label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          )}
        </div>

        {/* Diagnosis & Overview */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
          <div>
            <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
              Diagnostic Technique & Constat d'Atelier
            </span>
            <p className="text-slate-200 text-sm leading-relaxed">{repair.diagnosis}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-900">
            <div>
              <span className="text-slate-400 block">Véhicule</span>
              <span className="text-white font-medium">
                {repair.vehicle
                  ? `[${repair.vehicle.registration_number}] ${repair.vehicle.brand} ${repair.vehicle.model}`
                  : 'ID Véhicule : ' + repair.vehicle_id}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Propriétaire Client</span>
              <span className="text-white font-medium">
                {repair.client
                  ? `${repair.client.first_name} ${repair.client.last_name}`
                  : 'Client'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Mécanicien Assigné</span>
              <span className="text-white font-medium">{repair.mechanic_name || 'Technicien'}</span>
            </div>
          </div>
        </div>

        {/* Breakdown of Services & Parts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Services */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Prestations & Forfaits Main-d'Œuvre
            </h5>
            {repair.services.length === 0 ? (
              <p className="text-slate-500 italic py-2">Aucune prestation enregistrée.</p>
            ) : (
              <div className="space-y-1.5">
                {repair.services.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-slate-300 py-0.5">
                    <span>{s.service_name}</span>
                    <span className="font-mono tabular-nums text-white">
                      {formatCurrency(s.price)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Parts */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Pièces Détachées Remplacées
            </h5>
            {repair.parts.length === 0 ? (
              <p className="text-slate-500 italic py-2">Aucune pièce consommée.</p>
            ) : (
              <div className="space-y-1.5">
                {repair.parts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-slate-300 py-0.5">
                    <div>
                      <span>{p.part_name}</span>
                      <span className="text-[10px] text-slate-500 ml-1.5 font-mono">
                        x{p.quantity}
                      </span>
                    </div>
                    <span className="font-mono tabular-nums text-white">
                      {formatCurrency(p.unit_price * p.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Labor Hours & Grand Total Banner */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 space-y-0.5">
            <div>
              Temps Main-d'Œuvre : <span className="text-white font-mono">{repair.labor_hours} h</span> à{' '}
              <span className="text-white font-mono">{formatCurrency(repair.labor_rate)}/h</span>
            </div>
            <div>Statut actuel : <span className="text-slate-300">{currentBadge.label}</span></div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Total Réparation TTC
            </span>
            <span className="text-xl font-bold text-amber-400 font-mono tabular-nums">
              {formatCurrency(repair.total_amount)}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onGenerateInvoice(repair);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Générer la Facture Client</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
