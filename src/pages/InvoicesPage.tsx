import React, { useState } from 'react';
import { Invoice, Client, Vehicle, Repair } from '../types';
import {
  Plus,
  Search,
  Receipt,
  Printer,
  CreditCard,
  Eye,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { InvoiceFormModal } from '../components/invoices/InvoiceFormModal';
import { InvoicePrintModal } from '../components/invoices/InvoicePrintModal';
import { Pagination } from '../components/common/Pagination';
import { formatDate, formatCurrency, getInvoiceStatusBadge } from '../utils/formatters';

interface InvoicesPageProps {
  invoices: Invoice[];
  clients: Client[];
  vehicles: Vehicle[];
  repairs: Repair[];
  onCreateInvoice: (data: any) => Promise<void>;
  onRecordPaymentForInvoice: (invoiceId: string) => void;
  initialRepairToInvoice?: Repair | null;
  onClearInitialRepair?: () => void;
}

export const InvoicesPage: React.FC<InvoicesPageProps> = ({
  invoices,
  clients,
  vehicles,
  repairs,
  onCreateInvoice,
  onRecordPaymentForInvoice,
  initialRepairToInvoice,
  onClearInitialRepair,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If prompted to create an invoice from a repair order
  React.useEffect(() => {
    if (initialRepairToInvoice) {
      setIsFormOpen(true);
    }
  }, [initialRepairToInvoice]);

  const filteredInvoices = invoices.filter((inv) => {
    const term = searchTerm.toLowerCase();
    const invNum = inv.invoice_number.toLowerCase();
    const clientName = inv.client ? `${inv.client.first_name} ${inv.client.last_name}`.toLowerCase() : '';
    const plate = inv.vehicle?.registration_number?.toLowerCase() || '';

    const matchSearch = invNum.includes(term) || clientName.includes(term) || plate.includes(term);
    const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAdd = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onCreateInvoice(data);
      setIsFormOpen(false);
      if (onClearInitialRepair) onClearInitialRepair();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Facturation & Règlements</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Factures clients, ventilation pièces et main-d'œuvre, encaissements et soldes dus
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une Facture Atelier</span>
        </button>
      </div>

      {/* Toolbar */}
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
              placeholder="Rechercher par N° facture, client ou immatriculation..."
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
              <option value="ALL">Tous les statuts de paiement</option>
              <option value="PAID">Payée (Soldée)</option>
              <option value="PARTIAL">Partielle (Acompte versé)</option>
              <option value="PENDING">En attente (Impayée)</option>
              <option value="CANCELLED">Annulée</option>
            </select>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">N° Facture</th>
                <th className="py-3 px-4">Client & Véhicule</th>
                <th className="py-3 px-4">Date d'Émission</th>
                <th className="py-3 px-4">Échéance</th>
                <th className="py-3 px-4 text-right">Montant Total</th>
                <th className="py-3 px-4 text-right">Encaissé</th>
                <th className="py-3 px-4 text-right">Reste Dû</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Aucune facture ne correspond aux critères.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => {
                  const badge = getInvoiceStatusBadge(inv.status ?? 'PENDING');

                  return (
                    <tr key={inv.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-white font-bold">
                          #{inv.invoice_number}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-200">
                          {inv.client ? `${inv.client.first_name} ${inv.client.last_name}` : 'Client'}
                        </div>
                        {inv.vehicle && (
                          <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                            [{inv.vehicle.registration_number}] {inv.vehicle.brand} {inv.vehicle.model}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                        {formatDate(inv.issue_date)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                        {formatDate(inv.due_date)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-white tabular-nums">
                        {formatCurrency(inv.total_amount)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-emerald-400 tabular-nums">
                        {formatCurrency(inv.paid_amount)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-semibold tabular-nums">
                        <span className={inv.remaining_amount > 0 ? 'text-rose-400' : 'text-slate-500'}>
                          {formatCurrency(inv.remaining_amount)}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.remaining_amount > 0 && (
                            <button
                              type="button"
                              onClick={() => onRecordPaymentForInvoice(inv.id)}
                              className="px-2 py-1 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors flex items-center gap-1"
                              title="Enregistrer un encaissement"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Encaisser</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setPrintInvoice(inv)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Imprimer / Visualiser la facture"
                          >
                            <Printer className="w-3.5 h-3.5 text-amber-400" />
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
          totalItems={filteredInvoices.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Invoice Form Modal */}
      <InvoiceFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          if (onClearInitialRepair) onClearInitialRepair();
        }}
        onSubmit={handleFormSubmit}
        clients={clients}
        vehicles={vehicles}
        repairs={repairs}
        initialRepair={initialRepairToInvoice}
        isLoading={isSubmitting}
      />

      {/* Invoice Print / Sheet Modal */}
      <InvoicePrintModal
        isOpen={!!printInvoice}
        onClose={() => setPrintInvoice(null)}
        invoice={printInvoice}
      />
    </div>
  );
};
