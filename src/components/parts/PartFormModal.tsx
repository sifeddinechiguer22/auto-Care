import React, { useState, useEffect } from 'react';
import { Part } from '../../types';
import { Modal } from '../common/Modal';

interface PartFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Part, 'id' | 'created_at'>) => Promise<void>;
  part?: Part | null;
  isLoading?: boolean;
}

export const PartFormModal: React.FC<PartFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  part,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [category, setCategory] = useState('Filters');
  const [currentStock, setCurrentStock] = useState<number>(10);
  const [minimumStock, setMinimumStock] = useState<number>(5);
  const [purchasePrice, setPurchasePrice] = useState<number>(15);
  const [sellingPrice, setSellingPrice] = useState<number>(30);
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (part) {
      setName(part.name);
      setPartNumber(part.part_number);
      setCategory(part.category);
      setCurrentStock(part.current_stock);
      setMinimumStock(part.minimum_stock);
      setPurchasePrice(part.purchase_price);
      setSellingPrice(part.selling_price);
      setLocation(part.location || '');
    } else {
      setName('');
      setPartNumber('');
      setCategory('Filters');
      setCurrentStock(10);
      setMinimumStock(5);
      setPurchasePrice(15);
      setSellingPrice(30);
      setLocation('');
    }
  }, [part, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: name.trim(),
      part_number: partNumber.toUpperCase().trim(),
      category: category.trim(),
      current_stock: Number(currentStock),
      minimum_stock: Number(minimumStock),
      purchase_price: Number(purchasePrice),
      selling_price: Number(sellingPrice),
      location: location.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={part ? 'Modifier la Pièce Détachée' : 'Ajouter une Pièce au Stock Atelier'}
      subtitle="Suivi des niveaux de stock, alertes seuil minimum, prix d'achat et de revente"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Désignation de la Pièce <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex. Filtre à huile vissant Bosch Premium"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Référence Pièce / SKU Fabricant <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              placeholder="ex. BOS-OF-3320"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono uppercase focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Catégorie <span className="text-amber-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Filters">Filtres (Huile, Air, Habitacle)</option>
              <option value="Brakes">Freinage (Plaquettes, Disques)</option>
              <option value="Fluids">Huiles & Liquides techniques</option>
              <option value="Ignition">Allumage & Bougies</option>
              <option value="Belts">Courroies & Durites</option>
              <option value="Suspension">Suspension & Silentblocs</option>
              <option value="Electrical">Batteries & Alternateurs</option>
              <option value="Hardware">Visserie & Joints</option>
              <option value="Tires">Pneumatiques & Valves</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Quantité Actuelle en Stock <span className="text-amber-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={currentStock}
              onChange={(e) => setCurrentStock(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono tabular-nums focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Seuil Minimum d'Alerte <span className="text-amber-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={minimumStock}
              onChange={(e) => setMinimumStock(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono tabular-nums focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Déclenche une alerte quand le stock est inférieur ou égal à ce seuil.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Prix d'Achat HT (€) <span className="text-amber-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono tabular-nums focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Prix de Vente Client (€) <span className="text-amber-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono tabular-nums focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Emplacement Casier / Rayonnage Atelier
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="ex. Pont 2 - Rayon B1, Armoire Chimique C"
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
            {part ? 'Enregistrer la Pièce' : 'Ajouter au Stock'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
