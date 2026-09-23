import React, { useState } from 'react';
import { Client, Vehicle, Appointment, Repair } from '../types';
import { Plus, Search, User, Phone, Mail, MapPin, Edit2, Trash2, Eye, Car } from 'lucide-react';
import { ClientFormModal } from '../components/clients/ClientFormModal';
import { ClientDetailsModal } from '../components/clients/ClientDetailsModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Pagination } from '../components/common/Pagination';
import { formatDate } from '../utils/formatters';

interface ClientsPageProps {
  clients: Client[];
  vehicles: Vehicle[];
  appointments: Appointment[];
  repairs: Repair[];
  onCreateClient: (data: Omit<Client, 'id' | 'created_at'>) => Promise<void>;
  onUpdateClient: (id: string, data: Partial<Client>) => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;
  onAddVehicleForClient: (clientId: string) => void;
  onBookAppointmentForClient: (clientId: string) => void;
}

export const ClientsPage: React.FC<ClientsPageProps> = ({
  clients,
  vehicles,
  appointments,
  repairs,
  onCreateClient,
  onUpdateClient,
  onDeleteClient,
  onAddVehicleForClient,
  onBookAppointmentForClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [detailsClient, setDetailsClient] = useState<Client | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredClients = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
    return (
      fullName.includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term) ||
      c.address.toLowerCase().includes(term)
    );
  });

  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAdd = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Client, 'id' | 'created_at'>) => {
    setIsSubmitting(true);
    try {
      if (editingClient) {
        await onUpdateClient(editingClient.id, data);
      } else {
        await onCreateClient(data);
      }
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClientId) return;
    setIsSubmitting(true);
    try {
      await onDeleteClient(deletingClientId);
      setDeletingClientId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Répertoire des Clients</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Propriétaires de véhicules et flottes professionnelles de l'Atelier AutoCare
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* Search and Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {/* Search Toolbar */}
        <div className="p-4 border-b border-slate-800">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher par nom, email, téléphone ou adresse..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Clients Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Nom du Client</th>
                <th className="py-3 px-4">Coordonnées</th>
                <th className="py-3 px-4">Adresse</th>
                <th className="py-3 px-4 text-center">Véhicules</th>
                <th className="py-3 px-4">Client depuis</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Aucun client trouvé. Enregistrez une première fiche client.
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => {
                  const clientVehiclesCount = vehicles.filter(
                    (v) => v.client_id === client.id
                  ).length;

                  return (
                    <tr key={client.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-white">
                          {client.first_name} {client.last_name}
                        </div>
                        {client.notes && (
                          <div className="text-[10px] text-slate-400 max-w-xs truncate mt-0.5">
                            {client.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-300 font-medium">{client.email}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{client.phone}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                        {client.address || '—'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 font-mono text-[11px]">
                          <Car className="w-3 h-3" />
                          <span>{clientVehiclesCount}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {formatDate(client.created_at)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailsClient(client)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Voir la fiche client"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(client)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Modifier le client"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingClientId(client.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Supprimer le client"
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
          totalItems={filteredClients.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Form Modal */}
      <ClientFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        client={editingClient}
        isLoading={isSubmitting}
      />

      {/* Details Modal */}
      <ClientDetailsModal
        isOpen={!!detailsClient}
        onClose={() => setDetailsClient(null)}
        client={detailsClient}
        vehicles={vehicles}
        appointments={appointments}
        repairs={repairs}
        onAddVehicle={(cId) => {
          setDetailsClient(null);
          onAddVehicleForClient(cId);
        }}
        onBookAppointment={(cId) => {
          setDetailsClient(null);
          onBookAppointmentForClient(cId);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingClientId}
        onClose={() => setDeletingClientId(null)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la fiche client"
        message="Êtes-vous sûr de vouloir supprimer ce client ? Les véhicules, rendez-vous et historiques de réparations associés resteront archivés."
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        isDanger
        isLoading={isSubmitting}
      />
    </div>
  );
};
