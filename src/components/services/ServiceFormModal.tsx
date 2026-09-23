import React, { useState, useEffect } from 'react';
import { Service } from '../../types';
import { Modal } from '../common/Modal';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Service, 'id' | 'created_at'>) => Promise<void>;
  service?: Service | null;
  isLoading?: boolean;
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  service,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(100);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(60);
  const [category, setCategory] = useState('General Maintenance');

  useEffect(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description);
      setPrice(service.price);
      setEstimatedMinutes(service.estimated_minutes || 60);
      setCategory(service.category || 'General Maintenance');
    } else {
      setName('');
      setDescription('');
      setPrice(100);
      setEstimatedMinutes(60);
      setCategory('General Maintenance');
    }
  }, [service, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      estimated_minutes: Number(estimatedMinutes),
      category: category.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? 'Modifier la Prestation' : 'Ajouter un Forfait / Prestation'}
      subtitle="Tarification catalogue standard, description technique et temps barémé"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Intitulé du Forfait / Opération <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex. Vidange Huile de Synthèse & Remplacement Filtre"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Catégorie Métier <span className="text-amber-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Entretien & Vidange">Entretien & Vidange</option>
              <option value="Freinage">Freinage & Hydraulique</option>
              <option value="Moteur & Allumage">Moteur & Allumage</option>
              <option value="Diagnostic Électronique">Diagnostic Électronique / Valise</option>
              <option value="Liaison au Sol & Suspension">Liaison au Sol & Suspension</option>
              <option value="Refroidissement">Circuit de Refroidissement</option>
              <option value="Transmission & Embrayage">Transmission & Embrayage</option>
              <option value="Électricité & Batterie">Électricité & Batterie</option>
              <option value="Pneumatiques & Géométrie">Pneumatiques & Géométrie</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Tarif Forfait TTC (€) <span className="text-amber-400">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono tabular-nums focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Temps Barémé Estimé (Minutes)
          </label>
          <input
            type="number"
            min="10"
            step="5"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono tabular-nums focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Description de l'Intervention & Points de Contrôle
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Détail des opérations et contrôles effectués lors de cette intervention..."
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
            {service ? 'Enregistrer les Modifications' : 'Ajouter au Catalogue'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
