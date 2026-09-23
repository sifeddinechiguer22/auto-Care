import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory } from '../../types';
import { Modal } from '../common/Modal';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Expense, 'id' | 'created_at'>) => Promise<void>;
  isLoading?: boolean;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [category, setCategory] = useState<ExpenseCategory>('PARTS_SUPPLIES');
  const [amount, setAmount] = useState<number>(100);
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
    setAmount(100);
    setDescription('');
    setReceiptNumber('');
    setCategory('PARTS_SUPPLIES');
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      category,
      amount: Number(amount),
      date,
      description: description.trim(),
      receipt_ref: receiptNumber.trim() || undefined,
      receipt_number: receiptNumber.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enregistrer une Charge d'Exploitation"
      subtitle="Suivi des frais généraux, réapprovisionnement pièces, factures d'énergie et outillage"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Catégorie de Dépense <span className="text-amber-400">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="PARTS_SUPPLIES">Pièces & Consommables d'Atelier</option>
            <option value="EQUIPMENT">Outillage, Ponts Élévateurs & Valises Diagnostic</option>
            <option value="UTILITIES">Électricité, Eau & Air Comprimé</option>
            <option value="RENT">Loyer du Local d'Atelier</option>
            <option value="SALARIES">Rémunérations & Salaires Mécaniciens</option>
            <option value="INSURANCE">Assurance Garage & Responsabilité Civile</option>
            <option value="MAINTENANCE">Maintenance des Ponts & Compresseur</option>
            <option value="OTHER">Frais Divers & Administratifs</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Montant TTC (€) <span className="text-amber-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono tabular-nums focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Date Comptable <span className="text-amber-400">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            N° Facture Fournisseur / Ticket
          </label>
          <input
            type="text"
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value)}
            placeholder="ex. FACT-FOURN-9882"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Description & Objet de la Dépense <span className="text-amber-400">*</span>
          </label>
          <textarea
            required
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ex. Huile hydraulique pour pont élévateur & fût 208L 5W-30 synthèse..."
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
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            )}
            <span>Enregistrer la Dépense</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
