import React, { useState } from 'react';
import { Service } from '../types';
import { Plus, Search, Sparkles, Clock, Edit2, Trash2, Tag } from 'lucide-react';
import { ServiceFormModal } from '../components/services/ServiceFormModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { formatCurrency } from '../utils/formatters';

interface ServicesPageProps {
  services: Service[];
  onCreateService: (data: Omit<Service, 'id' | 'created_at'>) => Promise<void>;
  onUpdateService: (id: string, data: Partial<Service>) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  services,
  onCreateService,
  onUpdateService,
  onDeleteService,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(services.map((s) => s.category || 'General')))];

  const filteredServices = services.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(term) ||
      s.description.toLowerCase().includes(term) ||
      (s.category && s.category.toLowerCase().includes(term));

    const matchCategory =
      categoryFilter === 'ALL' || (s.category || 'General') === categoryFilter;

    return matchSearch && matchCategory;
  });

  const handleOpenAdd = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Service, 'id' | 'created_at'>) => {
    setIsSubmitting(true);
    try {
      if (editingService) {
        await onUpdateService(editingService.id, data);
      } else {
        await onCreateService(data);
      }
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingServiceId) return;
    setIsSubmitting(true);
    try {
      await onDeleteService(deletingServiceId);
      setDeletingServiceId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Catalogue des Forfaits & Prestations Atelier</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tarification de la main-d'œuvre, opérations d'entretien standard et durées d'immobilisation
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une Prestation</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une prestation, description ou catégorie..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'Toutes les opérations' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {service.category || 'Général'}
                </span>
                <span className="font-mono text-base font-bold text-white tabular-nums">
                  {formatCurrency(service.price)}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-white mb-1.5">{service.name}</h4>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {service.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>{service.estimated_minutes || 60} min d'atelier</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(service)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Modifier la prestation"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingServiceId(service.id)}
                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Supprimer la prestation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      <ServiceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        service={editingService}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingServiceId}
        onClose={() => setDeletingServiceId(null)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la Prestation"
        message="Êtes-vous certain de vouloir supprimer cette prestation du catalogue de l'atelier ?"
        confirmText="Supprimer la Prestation"
        isDanger
        isLoading={isSubmitting}
      />
    </div>
  );
};
