import React, { useState, useEffect } from 'react';
import { Payment, Invoice, PaymentMethod } from '../../types';
import { Modal } from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Payment, 'id' | 'created_at'>) => Promise<void>;
  invoices: Invoice[];
  initialInvoiceId?: string;
  isLoading?: boolean;
}

export const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  invoices,
  initialInvoiceId,
  isLoading = false,
}) => {
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [paymentDate, setPaymentDate] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // Unpaid or partially paid invoices
  const eligibleInvoices = invoices.filter((i) => i.remaining_amount > 0 || i.id === initialInvoiceId);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setPaymentDate(today);

    const targetInvId = initialInvoiceId || eligibleInvoices[0]?.id || '';
    setInvoiceId(targetInvId);

    const inv = invoices.find((i) => i.id === targetInvId);
    if (inv) {
      setAmount(inv.remaining_amount);
    } else {
      setAmount(0);
    }
    setReference('');
    setNotes('');
  }, [initialInvoiceId, invoices, isOpen]);

  const handleInvoiceChange = (invId: string) => {
    setInvoiceId(invId);
    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      setAmount(inv.remaining_amount);
    }
  };

  const selectedInvoice = invoices.find((i) => i.id === invoiceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      invoice_id: invoiceId,
      amount: Number(amount),
      payment_method: paymentMethod,
      date: paymentDate,
      payment_date: paymentDate,
      reference: reference.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enregistrer un Règlement Client"
      subtitle="Affecter une transaction d'encaissement à une facture d'atelier"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Facture Concernée <span className="text-amber-400">*</span>
          </label>
          <select
            required
            value={invoiceId}
            onChange={(e) => handleInvoiceChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
          >
            <option value="" disabled>
              Sélectionner la facture...
            </option>
            {eligibleInvoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                #{inv.invoice_number} · Reste Dû : {formatCurrency(inv.remaining_amount)} (
                {inv.client ? `${inv.client.first_name} ${inv.client.last_name}` : 'Client'})
              </option>
            ))}
          </select>

          {selectedInvoice && (
            <div className="mt-2 p-2.5 rounded bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
              <span className="text-slate-400">Total Facture : {formatCurrency(selectedInvoice.total_amount)}</span>
              <span className="font-semibold text-amber-400">
                Solde Restant Dû : {formatCurrency(selectedInvoice.remaining_amount)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Montant du Versement (€) <span className="text-amber-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={selectedInvoice ? selectedInvoice.remaining_amount : undefined}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono tabular-nums focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Mode de Règlement <span className="text-amber-400">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="CARD">Carte Bancaire (TPE)</option>
              <option value="CASH">Espèces / Caisse</option>
              <option value="BANK_TRANSFER">Virement Bancaire</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Date d'Encaissement <span className="text-amber-400">*</span>
            </label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Réf. Transaction / Ticket TPE
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="ex. TPE-9812 / CHQ-4401"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Notes & Observations Caisse
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Autorisation terminal reçue..."
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
            <span>Valider le Règlement</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
