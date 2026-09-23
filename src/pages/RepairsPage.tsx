import React, { useState } from 'react';
import {
  Repair,
  Vehicle,
  Client,
  User,
  Service,
  Part,
  RepairStatus,
} from '../types';
import {
  Plus,
  Search,
  Wrench,
  Edit2,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  Receipt,
  Car,
} from 'lucide-react';
import { RepairFormModal } from '../components/repairs/RepairFormModal';
import { RepairDetailsModal } from '../components/repairs/RepairDetailsModal';
import { Pagination } from '../components/common/Pagination';
import { formatDate, formatCurrency, getRepairStatusBadge } from '../utils/formatters';

interface RepairsPageProps {
  repairs: Repair[];
  vehicles: Vehicle[];
  clients: Client[];
  mechanics: User[];
  servicesCatalog: Service[];
  partsInventory: Part[];
  onCreateRepair: (data: Omit<Repair, 'id' | 'created_at' | 'vehicle' | 'client'>) => Promise<void>;
  onUpdateRepair: (id: string, data: Partial<Repair>) => Promise<void>;
  onGenerateInvoiceFromRepair: (repair: Repair) => void;
  initialVehicleId?: string;
  selectedRepairToView?: Repair | null;
  onClearSelectedRepair?: () => void;
}

export const RepairsPage: React.FC<RepairsPageProps> = ({
  repairs,
  vehicles,
  clients,
  mechanics,
  servicesCatalog,
  partsInventory,
  onCreateRepair,
  onUpdateRepair,
  onGenerateInvoiceFromRepair,
  initialVehicleId,
  selectedRepairToView,
  onClearSelectedRepair,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRepair, setEditingRepair] = useState<Repair | null>(null);
  const [detailsRepair, setDetailsRepair] = useState<Repair | null>(selectedRepairToView || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync if prop changes
  React.useEffect(() => {
    if (selectedRepairToView) {
      setDetailsRepair(selectedRepairToView);
    }
  }, [selectedRepairToView]);

  const filteredRepairs = repairs.filter((r) => {
    const term = searchTerm.toLowerCase();
    const plate = r.vehicle?.registration_number?.toLowerCase() || '';
    const mech = r.mechanic_name?.toLowerCase() || '';
    const diag = r.diagnosis.toLowerCase();
    const clientName = r.client ? `${r.client.first_name} ${r.client.last_name}`.toLowerCase() : '';

    const matchSearch =
      plate.includes(term) || mech.includes(term) || diag.includes(term) || clientName.includes(term);

    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const paginatedRepairs = filteredRepairs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAdd = () => {
    setEditingRepair(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (repair: Repair) => {
    setEditingRepair(repair);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Repair, 'id' | 'created_at' | 'vehicle' | 'client'>) => {
    setIsSubmitting(true);
    try {
      if (editingRepair) {
        await onUpdateRepair(editingRepair.id, data);
      } else {
        await onCreateRepair(data);
      }
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: RepairStatus) => {
    await onUpdateRepair(id, { status: newStatus });
    if (detailsRepair && detailsRepair.id === id) {
      setDetailsRepair({ ...detailsRepair, status: newStatus });
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Ordres de Réparation & Atelier
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fiches de travail diagnostic, main-d'œuvre, pièces consommées et étapes d'avancement
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Ordre de Réparation</span>
        </button>
      </div>

      {/* Table & Filtering Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher par immatriculation, mécanicien, diagnostic ou client..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Toutes les étapes</option>
              <option value="DIAGNOSIS">1. Diagnostic</option>
              <option value="PARTS_WAIT">2. En attente de pièces</option>
              <option value="IN_PROGRESS">3. En cours de réparation</option>
              <option value="QUALITY_CHECK">4. Contrôle qualité</option>
              <option value="COMPLETED">5. Réparation terminée</option>
              <option value="DELIVERED">6. Véhicule restitué</option>
            </select>
          </div>
        </div>

        {/* Repairs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">N° OR / Date</th>
                <th className="py-3 px-4">Véhicule & Client</th>
                <th className="py-3 px-4">Mécanicien assigné</th>
                <th className="py-3 px-4">Diagnostic & Travaux</th>
                <th className="py-3 px-4">Étape d'avancement</th>
                <th className="py-3 px-4 text-right">Total TTC</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedRepairs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Aucun ordre de réparation ne correspond aux critères.
                  </td>
                </tr>
              ) : (
                paginatedRepairs.map((repair) => {
                  const badge = getRepairStatusBadge(repair.status);

                  return (
                    <tr key={repair.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-white font-semibold">#{repair.id}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(repair.created_at)}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {repair.vehicle ? (
                          <>
                            <div className="font-mono text-amber-400 font-bold">
                              {repair.vehicle.registration_number}
                            </div>
                            <div className="text-[11px] text-slate-300">
                              {repair.vehicle.brand} {repair.vehicle.model}
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                        {repair.client && (
                          <div className="text-[10px] text-slate-500">
                            {repair.client.first_name} {repair.client.last_name}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-200">
                          {repair.mechanic_name || 'Affecté'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Main d'œuvre : {repair.labor_hours} h
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-white truncate">{repair.diagnosis}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{repair.services.length} prestation(s)</span>
                          <span>·</span>
                          <span>{repair.parts.length} pièce(s)</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-semibold text-amber-400 tabular-nums">
                        {formatCurrency(repair.total_amount)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailsRepair(repair)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Suivi du cycle de vie et détails"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(repair)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Modifier l'ordre de réparation"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
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

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredRepairs.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Form Modal */}
      <RepairFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        repair={editingRepair}
        vehicles={vehicles}
        clients={clients}
        mechanics={mechanics}
        servicesCatalog={servicesCatalog}
        partsInventory={partsInventory}
        initialVehicleId={initialVehicleId}
        isLoading={isSubmitting}
      />

      {/* Details Modal */}
      <RepairDetailsModal
        isOpen={!!detailsRepair}
        onClose={() => {
          setDetailsRepair(null);
          if (onClearSelectedRepair) onClearSelectedRepair();
        }}
        repair={detailsRepair}
        onUpdateStatus={handleUpdateStatus}
        onGenerateInvoice={(rep) => {
          setDetailsRepair(null);
          if (onClearSelectedRepair) onClearSelectedRepair();
          onGenerateInvoiceFromRepair(rep);
        }}
      />
    </div>
  );
};
