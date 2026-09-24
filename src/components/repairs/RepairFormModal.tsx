import React, { useState, useEffect } from 'react';
import {
  Repair,
  Vehicle,
  Client,
  User,
  Service,
  Part,
  RepairStatus,
  RepairServiceItem,
  RepairPartItem,
} from '../../types';
import { Modal } from '../common/Modal';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface RepairFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Repair, 'id' | 'created_at' | 'vehicle' | 'client'>) => Promise<void>;
  repair?: Repair | null;
  vehicles: Vehicle[];
  clients: Client[];
  mechanics: User[];
  servicesCatalog: Service[];
  partsInventory: Part[];
  initialVehicleId?: string;
  initialAppointmentId?: string;
  isLoading?: boolean;
}

export const RepairFormModal: React.FC<RepairFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  repair,
  vehicles,
  clients,
  mechanics,
  servicesCatalog,
  partsInventory,
  initialVehicleId,
  initialAppointmentId,
  isLoading = false,
}) => {
  const [vehicleId, setVehicleId] = useState('');
  const [clientId, setClientId] = useState('');
  const [mechanicId, setMechanicId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [status, setStatus] = useState<RepairStatus>('DIAGNOSIS');
  const [services, setServices] = useState<RepairServiceItem[]>([]);
  const [parts, setParts] = useState<RepairPartItem[]>([]);
  const [laborHours, setLaborHours] = useState<number>(1.5);
  const [laborRate, setLaborRate] = useState<number>(90);
  const [notes, setNotes] = useState('');

  // Auto set client when vehicle is selected
  const handleVehicleChange = (vId: string) => {
    setVehicleId(vId);
    const targetVeh = vehicles.find((v) => v.id === vId);
    if (targetVeh) {
      setClientId(targetVeh.client_id);
    }
  };

  useEffect(() => {
    if (repair) {
      setVehicleId(repair.vehicle_id);
      setClientId(repair.client_id);
      setMechanicId(repair.mechanic_id);
      setDiagnosis(repair.diagnosis);
      setStatus(repair.status);
      setServices(repair.services || []);
      setParts(repair.parts || []);
      setLaborHours(repair.labor_hours || 1.5);
      setLaborRate(repair.labor_rate || 90);
      setNotes(repair.notes || '');
      return;
    }

    if (!isOpen) return;

    const defaultVeh = initialVehicleId || vehicles[0]?.id || '';
    setVehicleId(defaultVeh);
    const targetVeh = vehicles.find((v) => v.id === defaultVeh);
    setClientId(targetVeh?.client_id || clients[0]?.id || '');
    setMechanicId((current) => {
      if (current && mechanics.some((m) => m.id === current)) {
        return current;
      }
      return mechanics[0]?.id || '';
    });
    setDiagnosis('');
    setStatus('DIAGNOSIS');
    setServices([]);
    setParts([]);
    setLaborHours(1.5);
    setLaborRate(90);
    setNotes('');
  }, [repair, initialVehicleId, vehicles, clients, mechanics, isOpen]);

  // Add Service from Catalog
  const handleAddService = (serviceId: string) => {
    const srv = servicesCatalog.find((s) => s.id === serviceId);
    if (!srv) return;
    const newItem: RepairServiceItem = {
      id: `rsi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      service_id: srv.id,
      service_name: srv.name,
      price: srv.price,
      quantity: 1,
    };
    setServices([...services, newItem]);
  };

  // Add Part from Stock
  const handleAddPart = (partId: string) => {
    const prt = partsInventory.find((p) => p.id === partId);
    if (!prt) return;
    const newItem: RepairPartItem = {
      id: `rpi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      part_id: prt.id,
      part_name: prt.name,
      part_number: prt.part_number,
      unit_price: prt.selling_price,
      quantity: 1,
    };
    setParts([...parts, newItem]);
  };

  const removeService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const removePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  // Calculations
  const servicesTotal = services.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const partsTotal = parts.reduce((acc, curr) => acc + curr.unit_price * curr.quantity, 0);
  const laborTotal = laborHours * laborRate;
  const grandTotal = servicesTotal + partsTotal + laborTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignedMech = mechanics.find((m) => m.id === mechanicId);

    await onSubmit({
      appointment_id: repair?.appointment_id || initialAppointmentId,
      vehicle_id: vehicleId,
      client_id: clientId,
      mechanic_id: mechanicId,
      mechanic_name: assignedMech?.name || 'Assigned Mechanic',
      diagnosis: diagnosis.trim(),
      status,
      services,
      parts,
      labor_hours: Number(laborHours),
      labor_rate: Number(laborRate),
      total_amount: Number(grandTotal.toFixed(2)),
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={repair ? "Modifier l'Ordre de Réparation" : "Créer un Ordre de Réparation"}
      subtitle="Diagnostic technique approfondi, assignation mécanicien, pièces et suivi main-d'œuvre"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Vehicle & Mechanic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Véhicule Pris en Charge <span className="text-amber-400">*</span>
            </label>
            <select
              required
              value={vehicleId}
              onChange={(e) => handleVehicleChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="" disabled>
                Sélectionner un véhicule...
              </option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  [{v.registration_number}] {v.brand} {v.model} ({v.owner_name || 'Client'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Mécanicien Assigné <span className="text-amber-400">*</span>
            </label>
            <select
              required
              value={mechanicId}
              onChange={(e) => setMechanicId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="" disabled>
                Affecter un mécanicien...
              </option>
              {mechanics.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role === 'ADMIN' ? 'Chef d\'atelier' : 'Mécanicien'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Diagnosis & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Diagnostic Technique & Rapport d'Intervention <span className="text-amber-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="ex. Lecture défaut OBD code P0302; bobine d'allumage cylindre 2 HS; plaquettes avant usées à 2mm."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Statut de l'Ordre de Réparation
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RepairStatus)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="DIAGNOSIS">1. Diagnostic</option>
              <option value="PARTS_WAIT">2. En attente de pièces</option>
              <option value="IN_PROGRESS">3. En cours sur pont</option>
              <option value="QUALITY_CHECK">4. Contrôle qualité (Essai route)</option>
              <option value="COMPLETED">5. Terminé (Prêt pour restitution)</option>
              <option value="DELIVERED">6. Véhicule restitué au client</option>
            </select>
          </div>
        </div>

        {/* Services & Operations */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Prestations et Forfaits ({services.length})
            </span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddService(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="text-xs px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-md text-amber-400 focus:outline-none"
            >
              <option value="" disabled>
                + Ajouter une prestation du catalogue
              </option>
              {servicesCatalog.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatCurrency(s.price)})
                </option>
              ))}
            </select>
          </div>

          {services.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-1">Aucune prestation ajoutée pour le moment.</p>
          ) : (
            <div className="space-y-1.5">
              {services.map((srv, idx) => (
                <div
                  key={srv.id || idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850 text-xs"
                >
                  <span className="text-white font-medium">{srv.service_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-amber-400 tabular-nums">
                      {formatCurrency(srv.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeService(srv.id)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Parts & Replacement Components */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Pièces Détachées Allouées ({parts.length})
            </span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddPart(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="text-xs px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-md text-sky-400 focus:outline-none"
            >
              <option value="" disabled>
                + Allouer une pièce du stock
              </option>
              {partsInventory.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.part_number}] ({formatCurrency(p.selling_price)})
                </option>
              ))}
            </select>
          </div>

          {parts.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-1">Aucune pièce facturée pour le moment.</p>
          ) : (
            <div className="space-y-1.5">
              {parts.map((prt, idx) => (
                <div
                  key={prt.id || idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850 text-xs"
                >
                  <div>
                    <span className="text-white font-medium">{prt.part_name}</span>
                    <span className="text-[10px] font-mono text-slate-400 ml-2">
                      ({prt.part_number})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Qté :</span>
                      <input
                        type="number"
                        min={1}
                        value={prt.quantity}
                        onChange={(e) => {
                          const val = Math.max(1, Number(e.target.value));
                          setParts(
                            parts.map((p) => (p.id === prt.id ? { ...p, quantity: val } : p))
                          );
                        }}
                        className="w-12 px-1 py-0.5 bg-slate-950 border border-slate-800 rounded text-center text-white font-mono"
                      />
                    </div>
                    <span className="font-mono text-sky-400 tabular-nums w-16 text-right">
                      {formatCurrency(prt.unit_price * prt.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePart(prt.id)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Labor Calculation & Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Heures de Main-d'Œuvre</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={laborHours}
              onChange={(e) => setLaborHours(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono tabular-nums focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Taux Horaire (€ / heure)</label>
            <input
              type="number"
              step="5"
              min="0"
              value={laborRate}
              onChange={(e) => setLaborRate(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono tabular-nums focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-col justify-center sm:items-end pt-2 sm:pt-0">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider">
              Total Estimé
            </span>
            <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">
              {formatCurrency(grandTotal)}
            </span>
          </div>
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
            {repair ? "Mettre à Jour l'Ordre" : "Valider l'Ordre de Réparation"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
