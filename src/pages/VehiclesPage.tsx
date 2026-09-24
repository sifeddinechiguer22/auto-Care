import React, { useState } from 'react';
import { Vehicle, Client, Repair, Appointment, FuelType } from '../types';
import { Plus, Search, Car, Edit2, Trash2, Eye, Gauge, Fuel, Hash, Wrench } from 'lucide-react';
import { VehicleFormModal } from '../components/vehicles/VehicleFormModal';
import { VehicleDetailsModal } from '../components/vehicles/VehicleDetailsModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Pagination } from '../components/common/Pagination';

interface VehiclesPageProps {
  vehicles: Vehicle[];
  clients: Client[];
  repairs: Repair[];
  appointments: Appointment[];
  onCreateVehicle: (data: Omit<Vehicle, 'id' | 'created_at'>) => Promise<void>;
  onUpdateVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
  onCreateRepairForVehicle: (vehicleId: string) => void;
  onBookAppointmentForVehicle: (vehicleId: string) => void;
}

export const VehiclesPage: React.FC<VehiclesPageProps> = ({
  vehicles,
  clients,
  repairs,
  appointments,
  onCreateVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onCreateRepairForVehicle,
  onBookAppointmentForVehicle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fuelFilter, setFuelFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [detailsVehicle, setDetailsVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicleId, setDeletingVehicleId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredVehicles = vehicles.filter((v) => {
    const term = searchTerm.toLowerCase();
    const registration = (v.registration_number ?? '').toLowerCase();
    const vin = (v.vin ?? '').toLowerCase();
    const owner = (v.owner_name ?? '').toLowerCase();
    const matchSearch =
      registration.includes(term) ||
      v.brand.toLowerCase().includes(term) ||
      v.model.toLowerCase().includes(term) ||
      vin.includes(term) ||
      owner.includes(term);

    const matchFuel = fuelFilter === 'ALL' || v.fuel_type === fuelFilter;

    return matchSearch && matchFuel;
  });

  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Vehicle, 'id' | 'created_at'>) => {
    setIsSubmitting(true);
    try {
      if (editingVehicle) {
        await onUpdateVehicle(editingVehicle.id, data);
      } else {
        await onCreateVehicle(data);
      }
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVehicleId) return;
    setIsSubmitting(true);
    try {
      await onDeleteVehicle(deletingVehicleId);
      setDeletingVehicleId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Parc Véhicules & Immatriculations</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Véhicules enregistrés, suivi kilométrique, motorisations et numéros de châssis (VIN)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Enregistrer un Véhicule</span>
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
              placeholder="Rechercher par immatriculation, marque, modèle, VIN ou propriétaire..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={fuelFilter}
              onChange={(e) => {
                setFuelFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Tous les carburants</option>
              <option value="GASOLINE">Essence</option>
              <option value="DIESEL">Diesel</option>
              <option value="HYBRID">Hybride</option>
              <option value="ELECTRIC">Électrique</option>
              <option value="LPG">GPL</option>
            </select>
          </div>
        </div>

        {/* Vehicles Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Immatriculation</th>
                <th className="py-3 px-4">Marque & Modèle</th>
                <th className="py-3 px-4">Propriétaire</th>
                <th className="py-3 px-4">Motorisation</th>
                <th className="py-3 px-4">Kilométrage</th>
                <th className="py-3 px-4">Numéro VIN</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Aucun véhicule correspondant aux critères.
                  </td>
                </tr>
              ) : (
                paginatedVehicles.map((vehicle) => {
                  const owner = clients.find((c) => c.id === vehicle.client_id);

                  return (
                    <tr key={vehicle.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-xs">
                          {vehicle.registration_number || '—'}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-white">
                          {vehicle.brand} {vehicle.model}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Année : {vehicle.year}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-200 font-medium">
                          {owner ? `${owner.first_name} ${owner.last_name}` : vehicle.owner_name || '—'}
                        </div>
                        {owner && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{owner.phone}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]">
                          {vehicle.fuel_type}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono tabular-nums text-slate-300">
                        {vehicle.mileage.toLocaleString('fr-FR')} km
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                        {vehicle.vin || '—'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailsVehicle(vehicle)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Fiche Véhicule"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(vehicle)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Modifier le véhicule"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingVehicleId(vehicle.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Supprimer le véhicule"
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

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredVehicles.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Form Modal */}
      <VehicleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        vehicle={editingVehicle}
        clients={clients}
        isLoading={isSubmitting}
      />

      {/* Details Modal */}
      <VehicleDetailsModal
        isOpen={!!detailsVehicle}
        onClose={() => setDetailsVehicle(null)}
        vehicle={detailsVehicle}
        client={clients.find((c) => c.id === detailsVehicle?.client_id)}
        repairs={repairs}
        appointments={appointments}
        onCreateRepair={(vId) => {
          setDetailsVehicle(null);
          onCreateRepairForVehicle(vId);
        }}
        onBookAppointment={(vId) => {
          setDetailsVehicle(null);
          onBookAppointmentForVehicle(vId);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingVehicleId}
        onClose={() => setDeletingVehicleId(null)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la fiche véhicule"
        message="Êtes-vous sûr de vouloir supprimer ce véhicule du registre ? L'historique des réparations sera conservé dans les archives."
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        isDanger
        isLoading={isSubmitting}
      />
    </div>
  );
};
