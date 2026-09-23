import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { Plus, Search, TrendingDown, DollarSign, Calendar, Tag, AlertCircle } from 'lucide-react';
import { ExpenseFormModal } from '../components/expenses/ExpenseFormModal';
import { Pagination } from '../components/common/Pagination';
import { formatDate, formatCurrency, getExpenseCategoryBadge } from '../utils/formatters';

interface ExpensesPageProps {
  expenses: Expense[];
  onCreateExpense: (data: Omit<Expense, 'id' | 'created_at'>) => Promise<void>;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({
  expenses,
  onCreateExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredExpenses = expenses.filter((exp) => {
    const term = searchTerm.toLowerCase();
    const receipt = exp.receipt_number || exp.receipt_ref || '';
    const matchSearch =
      exp.description.toLowerCase().includes(term) ||
      receipt.toLowerCase().includes(term);
    const matchCategory = categoryFilter === 'ALL' || exp.category === categoryFilter;

    return matchSearch && matchCategory;
  });

  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleOpenAdd = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Expense, 'id' | 'created_at'>) => {
    setIsSubmitting(true);
    try {
      await onCreateExpense(data);
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
              Confidentiel Direction · Administrateur
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Dépenses & Charges d'Exploitation</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Frais généraux d'atelier, factures fournisseurs, maintenance outillage et salaires
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Enregistrer une Dépense</span>
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
              placeholder="Rechercher par libellé ou N° de justificatif..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Toutes les catégories</option>
              <option value="PARTS_SUPPLIES">Pièces & Consommables</option>
              <option value="EQUIPMENT">Outillage & Équipements</option>
              <option value="UTILITIES">Énergie & Fluides</option>
              <option value="RENT">Loyer & Local</option>
              <option value="SALARIES">Salaires & Charges</option>
              <option value="INSURANCE">Assurances professionnelles</option>
              <option value="MAINTENANCE">Entretien des Ponts & Machines</option>
              <option value="OTHER">Autres Charges</option>
            </select>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date Comptable</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Description / Fournisseur</th>
                <th className="py-3 px-4">N° Pièce / Justificatif</th>
                <th className="py-3 px-4 text-right">Montant TTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Aucune écriture de charge enregistrée.
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((exp) => {
                  const badge = getExpenseCategoryBadge(exp.category);

                  return (
                    <tr key={exp.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                        {formatDate(exp.date)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-white font-medium max-w-sm">
                        {exp.description}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                        {exp.receipt_number || exp.receipt_ref || '—'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-rose-400 tabular-nums">
                        -{formatCurrency(exp.amount)}
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
          totalItems={filteredExpenses.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Form Modal */}
      <ExpenseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
};
