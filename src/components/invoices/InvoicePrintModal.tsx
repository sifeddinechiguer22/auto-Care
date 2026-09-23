import React from 'react';
import { Invoice } from '../../types';
import { Modal } from '../common/Modal';
import { Printer, Download, Wrench, CheckCircle } from 'lucide-react';
import { formatDate, formatCurrency, getInvoiceStatusBadge } from '../../utils/formatters';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const statusBadge = getInvoiceStatusBadge(invoice.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Facture #${invoice.invoice_number}`}
      subtitle="Facture détaillée pour prestations d'atelier et pièces détachées"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Print Bar */}
        <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded text-xs font-semibold ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
            <span className="text-xs text-slate-400">
              Solde restant dû : {formatCurrency(invoice.remaining_amount)}
            </span>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimer la Facture</span>
          </button>
        </div>

        {/* Printable Document Sheet (Clean, high-contrast, professional typography) */}
        <div className="bg-white text-slate-900 p-8 rounded-xl shadow-lg border border-slate-200 print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                <Wrench className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-950">Garage AutoCare</h1>
                <p className="text-xs text-slate-500">Diagnostic, Entretien Mécanique & Réparations Toutes Marques</p>
                <p className="text-xs text-slate-500">100 Avenue de l'Automobile · Tél : +33 1 42 68 55 00</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                FACTURE
              </div>
              <div className="text-xs font-mono font-bold text-amber-600 mt-0.5">
                #{invoice.invoice_number}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Date : {formatDate(invoice.issue_date)}
              </div>
              <div className="text-xs text-slate-500">
                Échéance : {formatDate(invoice.due_date)}
              </div>
            </div>
          </div>

          {/* Bill to & Vehicle Info */}
          <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Facturé à :
              </span>
              <div className="text-sm font-bold text-slate-900">
                {invoice.client ? `${invoice.client.first_name} ${invoice.client.last_name}` : 'Client'}
              </div>
              <div className="text-slate-600">{invoice.client?.email}</div>
              <div className="text-slate-600">{invoice.client?.phone}</div>
              <div className="text-slate-600">{invoice.client?.address}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Véhicule concerné :
              </span>
              <div className="text-sm font-bold text-slate-900">
                {invoice.vehicle ? `${invoice.vehicle.brand} ${invoice.vehicle.model} (${invoice.vehicle.year})` : 'Véhicule'}
              </div>
              <div className="font-mono font-semibold text-amber-700">
                Immat : {invoice.vehicle?.registration_number}
              </div>
              <div className="text-slate-600 font-mono text-[11px]">
                N° Série (VIN) : {invoice.vehicle?.vin}
              </div>
              <div className="text-slate-600">
                Kilométrage : {invoice.vehicle?.mileage.toLocaleString('fr-FR')} km
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-slate-800 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2 px-1">Désignation</th>
                  <th className="py-2 px-3 text-center">Qté / H</th>
                  <th className="py-2 px-3 text-right">Prix Unitaire</th>
                  <th className="py-2 px-1 text-right">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-2.5 px-1 font-medium text-slate-800">{item.description}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="py-2.5 px-1 text-right font-mono font-semibold text-slate-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-2 border-t border-slate-200">
            <div className="w-64 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total HT :</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>TVA ({invoice.tax_rate}%) :</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-300">
                <span>Total TTC :</span>
                <span>{formatCurrency(invoice.total_amount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Réglé :</span>
                <span className="text-emerald-700">-{formatCurrency(invoice.paid_amount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-200">
                <span>Reste Dû :</span>
                <span className={invoice.remaining_amount > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                  {formatCurrency(invoice.remaining_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Terms & Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-700">Conditions de Règlement</p>
              <p>Paiement exigible à restitution du véhicule. Cartes bancaires, Virement ou Espèces acceptés.</p>
            </div>
            <div className="text-right italic">Merci de votre confiance en Garage AutoCare !</div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
};
