import React, { useState } from 'react';
import { Payment, Invoice } from '../types';
import { Plus, Search, CreditCard, DollarSign, ArrowDownLeft, Receipt } from 'lucide-react';
import { PaymentFormModal } from '../components/payments/PaymentFormModal';
import { Pagination } from '../components/common/Pagination';
import { formatDate, formatCurrency, getPaymentMethodBadge } from '../utils/formatters';

interface PaymentsPageProps {
  payments: Payment[];
  invoices: Invoice[];
  onCreatePayment: (data: Omit<Payment, 'id' | 'created_at'>) => Promise<void>;
  initialInvoiceIdForPayment?: string;
  onClearInitialInvoiceId?: () => void;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({
  payments,
  invoices,
  onCreatePayment,
  initialInvoiceIdForPayment,
  onClearInitialInvoiceId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialInvoiceIdForPayment) {
      setIsFormOpen(true);
    }
  }, [initialInvoiceIdForPayment]);

  const filteredPayments = payments.filter((pay) => {
    const term = searchTerm.toLowerCase();
    const inv = invoices.find((i) => i.id === pay.invoice_id);
    const invNum = inv?.invoice_number.toLowerCase() || '';
    const ref = pay.reference?.toLowerCase() || '';

    const matchSearch = invNum.includes(term) || ref.includes(term);
    const matchMethod = methodFilter === 'ALL' || pay.payment_method === methodFilter;

    return matchSearch && matchMethod;
  });

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalCollected = payments.reduce((acc, curr) => acc + curr.amount, 0);

  const handleOpenAdd = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Payment, 'id' | 'created_at'>) => {
    setIsSubmitting(true);
    try {
      await onCreatePayment(data);
      setIsFormOpen(false);
      if (onClearInitialInvoiceId) onClearInitialInvoiceId();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Encaissements & Règlements</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Historique des paiements clients, transactions TPE, encaissements espèces et virements
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Enregistrer un Paiement</span>
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
              placeholder="Rechercher par référence, ticket ou facture..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Tous les modes de règlement</option>
              <option value="CARD">Carte Bancaire (TPE)</option>
              <option value="CASH">Espèces</option>
              <option value="BANK_TRANSFER">Virement Bancaire</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">ID Paiement / Date</th>
                <th className="py-3 px-4">Facture Associée</th>
                <th className="py-3 px-4">Mode de Règlement</th>
                <th className="py-3 px-4">Réf. Transaction / Reçu</th>
                <th className="py-3 px-4">Observations</th>
                <th className="py-3 px-4 text-right">Montant Encaissé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Aucun encaissement trouvé.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((pay) => {
                  const inv = invoices.find((i) => i.id === pay.invoice_id);
                  const badge = getPaymentMethodBadge(pay.payment_method);

                  return (
                    <tr key={pay.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-white font-semibold">#{pay.id}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(pay.date || pay.payment_date)}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {inv ? (
                          <>
                            <span className="font-mono text-amber-400 font-semibold">
                              #{inv.invoice_number}
                            </span>
                            <div className="text-[11px] text-slate-400">
                              {inv.client ? `${inv.client.first_name} ${inv.client.last_name}` : 'Client'}
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-500 font-mono">#{pay.invoice_id}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300">
                        {pay.reference || '—'}
                      </td>

                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                        {pay.notes || '—'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-emerald-400 tabular-nums text-sm">
                        +{formatCurrency(pay.amount)}
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
          totalItems={filteredPayments.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Form Modal */}
      <PaymentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          if (onClearInitialInvoiceId) onClearInitialInvoiceId();
        }}
        onSubmit={handleFormSubmit}
        invoices={invoices}
        initialInvoiceId={initialInvoiceIdForPayment}
        isLoading={isSubmitting}
      />
    </div>
  );
};
