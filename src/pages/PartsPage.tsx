import React, { useState } from 'react';
import { Part } from '../types';
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  Edit2,
  Trash2,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { PartFormModal } from '../components/parts/PartFormModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { formatCurrency } from '../utils/formatters';

interface PartsPageProps {
  parts: Part[];
  onCreatePart: (data: Omit<Part, 'id' | 'created_at'>) => Promise<void>;
  onUpdatePart: (id: string, data: Partial<Part>) => Promise<void>;
  onDeletePart: (id: string) => Promise<void>;
}

export const PartsPage: React.FC<PartsPageProps> = ({
  parts,
  onCreatePart,
  onUpdatePart,
  onDeletePart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [deletingPartId, setDeletingPartId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['ALL', ...Array.from(new Set(parts.map((p) => p.category)))];
  const lowStockParts = parts.filter((p) => p.current_stock <= p.minimum_stock);

  const filteredParts = parts.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(term) ||
      p.part_number.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      (p.location && p.location.toLowerCase().includes(term));

    const matchCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchLow = !lowStockOnly || p.current_stock <= p.minimum_stock;

    return matchSearch && matchCategory && matchLow;
  });

  const handleOpenAdd = () => {
    setEditingPart(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (part: Part) => {
    setEditingPart(part);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Part, 'id' | 'created_at'>) => {
    setIsSubmitting(true);
    try {
      if (editingPart) {
        await onUpdatePart(editingPart.id, data);
      } else {
        await onCreatePart(data);
      }
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStockAdjust = async (part: Part, delta: number) => {
    const newStock = Math.max(0, part.current_stock + delta);
    await onUpdatePart(part.id, { current_stock: newStock });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPartId) return;
    setIsSubmitting(true);
    try {
      await onDeletePart(deletingPartId);
      setDeletingPartId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Pièces Détachées & Stock Magasin
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Références pièces, niveaux de stock, seuils d'alerte et emplacements en casier
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une Pièce au Stock</span>
        </button>
      </div>

      {/* Low Stock Alert Banner if any */}
      {lowStockParts.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-rose-300">
                Alerte Stock Critique ({lowStockParts.length} référence(s) sous le seuil de sécurité)
              </h4>
              <p className="text-[11px] text-rose-300/80 mt-0.5">
                Réapprovisionnement fournisseur recommandé sans délai pour éviter tout blocage d'atelier.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shrink-0 transition-colors"
          >
            {lowStockOnly ? 'Afficher tout le stock' : 'Filtrer stocks bas uniquement'}
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom de pièce, référence, catégorie ou casier..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'Toutes les catégories' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Parts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Pièce / Réf OEM</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Casier Stockage</th>
                <th className="py-3 px-4 text-center">Niveau de Stock</th>
                <th className="py-3 px-4 text-right">Prix d'Achat</th>
                <th className="py-3 px-4 text-right">Prix de Vente</th>
                <th className="py-3 px-4 text-right">Marge Brute</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Aucune pièce détachée ne correspond aux critères.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const isLow = part.current_stock <= part.minimum_stock;
                  const margin = part.selling_price - part.purchase_price;
                  const marginPct =
                    part.purchase_price > 0 ? (margin / part.purchase_price) * 100 : 0;

                  return (
                    <tr key={part.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-white">{part.name}</div>
                        <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                          {part.part_number}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                          {part.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {part.location || 'Magasin Central'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuickStockAdjust(part, -1)}
                            className="w-5 h-5 rounded bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
                            title="Diminuer le stock"
                          >
                            -
                          </button>
                          <span
                            className={`font-mono font-bold text-xs tabular-nums px-2 py-0.5 rounded ${
                              isLow
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-slate-950 text-white border border-slate-800'
                            }`}
                          >
                            {part.current_stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickStockAdjust(part, 1)}
                            className="w-5 h-5 rounded bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
                            title="Augmenter le stock"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Min : {part.minimum_stock}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-slate-400 tabular-nums">
                        {formatCurrency(part.purchase_price)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-semibold text-white tabular-nums">
                        {formatCurrency(part.selling_price)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono tabular-nums text-emerald-400 text-[11px]">
                        +{formatCurrency(margin)} ({marginPct.toFixed(0)}%)
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(part)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Modifier la pièce"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingPartId(part.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Supprimer la pièce"
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
      </div>

      {/* Form Modal */}
      <PartFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        part={editingPart}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingPartId}
        onClose={() => setDeletingPartId(null)}
        onConfirm={handleDeleteConfirm}
        title="Retirer la pièce de l'inventaire"
        message="Êtes-vous certain de vouloir supprimer cette pièce du stock ? Les ordres de réparation ayant déjà consommé cette pièce resteront intacts."
        confirmText="Supprimer la Pièce"
        isDanger
        isLoading={isSubmitting}
      />
    </div>
  );
};
