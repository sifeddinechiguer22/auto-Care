import React, { useState, useEffect } from 'react';
import { Invoice, Client, Vehicle, Repair, InvoiceItem } from '../../types';
import { Modal } from '../common/Modal';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  clients: Client[];
  vehicles: Vehicle[];
  repairs: Repair[];
  initialRepair?: Repair | null;
  isLoading?: boolean;
}

export const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  clients,
  vehicles,
  repairs,
  initialRepair,
  isLoading = false,
}) => {
  const [clientId, setClientId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [repairId, setRepairId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [taxRate, setTaxRate] = useState<number>(8.0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Auto populate if initialRepair is provided
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dueStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    setIssueDate(todayStr);
    setDueDate(dueStr);

    if (initialRepair) {
      setRepairId(initialRepair.id);
      setClientId(initialRepair.client_id);
      setVehicleId(initialRepair.vehicle_id);

      const generatedItems: InvoiceItem[] = [];

      // Add services
      initialRepair.services.forEach((s) => {
        generatedItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          description: `Labor: ${s.service_name}`,
          quantity: s.quantity,
          unit_price: s.price,
          total: s.quantity * s.price,
        });
      });

      // Add parts
      initialRepair.parts.forEach((p) => {
        generatedItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          description: `Part: ${p.part_name} (${p.part_number})`,
          quantity: p.quantity,
          unit_price: p.unit_price,
          total: p.quantity * p.unit_price,
        });
      });

      // Add labor hours
      if (initialRepair.labor_hours > 0) {
        generatedItems.push({
          id: `item-labor-${Date.now()}`,
          description: `Technician Workshop Labor (${initialRepair.labor_hours} hrs @ $${initialRepair.labor_rate}/hr)`,
          quantity: initialRepair.labor_hours,
          unit_price: initialRepair.labor_rate,
          total: initialRepair.labor_hours * initialRepair.labor_rate,
        });
      }

      setItems(generatedItems);
      setNotes(`Invoice generated from Repair Order #${initialRepair.id}`);
    } else {
      setRepairId('');
      setClientId(clients[0]?.id || '');
      setVehicleId(vehicles[0]?.id || '');
      setItems([
        {
          id: `item-${Date.now()}`,
          description: 'Standard Automotive Diagnostic & Maintenance Service',
          quantity: 1,
          unit_price: 150.0,
          total: 150.0,
        },
      ]);
      setNotes('');
      setPaidAmount(0);
    }
  }, [initialRepair, clients, vehicles, isOpen]);

  const clientVehicles = vehicles.filter((v) => (clientId ? v.client_id === clientId : true));

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      description: 'Workshop Service / Part Item',
      quantity: 1,
      unit_price: 50.0,
      total: 50.0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((itm) => {
        if (itm.id !== id) return itm;
        const updated = { ...itm, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updated.total = Number((updated.quantity * updated.unit_price).toFixed(2));
        }
        return updated;
      })
    );
  };

  const subtotal = items.reduce((acc, curr) => acc + curr.total, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;
  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      repair_id: repairId || undefined,
      client_id: clientId,
      vehicle_id: vehicleId,
      issue_date: issueDate,
      due_date: dueDate,
      items,
      subtotal: Number(subtotal.toFixed(2)),
      tax_rate: Number(taxRate),
      tax_amount: Number(taxAmount.toFixed(2)),
      total_amount: Number(totalAmount.toFixed(2)),
      paid_amount: Number(paidAmount),
      remaining_amount: Number(remainingAmount.toFixed(2)),
      status: remainingAmount === 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'PENDING',
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Créer une Facture Atelier"
      subtitle="Facturation client pièces, prestations et main-d'œuvre avec calcul automatisé de la TVA"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Client / Compte <span className="text-amber-400">*</span>
            </label>
            <select
              required
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                const matching = vehicles.filter((v) => v.client_id === e.target.value);
                if (matching.length > 0) setVehicleId(matching[0].id);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="" disabled>
                Sélectionner un client...
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Véhicule <span className="text-amber-400">*</span>
            </label>
            <select
              required
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="" disabled>
                Sélectionner un véhicule...
              </option>
              {clientVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  [{v.registration_number}] {v.brand} {v.model}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Date d'Émission <span className="text-amber-400">*</span>
            </label>
            <input
              type="date"
              required
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Date d'Échéance <span className="text-amber-400">*</span>
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Taux de TVA (%)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono tabular-nums focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Lignes de Facturation ({items.length})
            </span>
            <button
              type="button"
              onClick={addItem}
              className="px-2.5 py-1 text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une ligne</span>
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-slate-900 border border-slate-850 text-xs"
              >
                <div className="col-span-6">
                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Description de la prestation / pièce"
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-center text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={item.unit_price}
                    onChange={(e) => updateItem(item.id, 'unit_price', Number(e.target.value))}
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-right text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2 flex items-center justify-between pl-2">
                  <span className="font-mono text-amber-400 font-semibold tabular-nums text-xs">
                    {formatCurrency(item.total)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-slate-500 hover:text-rose-400 ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Summary Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Acompte / Règlement Immédiat Reçu (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={totalAmount}
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              placeholder="0.00"
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono tabular-nums focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Le solde restant dû sera automatiquement ajusté sur le statut.
            </span>
          </div>

          <div className="space-y-1.5 text-right font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Sous-total HT :</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>TVA ({taxRate}%) :</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-slate-800">
              <span>Montant Total TTC :</span>
              <span className="text-amber-400">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-xs">
              <span>Reste Dû :</span>
              <span className={remainingAmount > 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          </div>
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
            <span>Émettre la Facture</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
