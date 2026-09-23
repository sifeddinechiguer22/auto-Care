import React, { useState, useEffect } from 'react';
import { Vehicle, Client, FuelType } from '../../types';
import { Modal } from '../common/Modal';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Vehicle, 'id' | 'created_at'>) => Promise<void>;
  vehicle?: Vehicle | null;
  clients: Client[];
  initialClientId?: string;
  isLoading?: boolean;
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vehicle,
  clients,
  initialClientId,
  isLoading = false,
}) => {
  const [clientId, setClientId] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [mileage, setMileage] = useState<number>(0);
  const [fuelType, setFuelType] = useState<FuelType>('GASOLINE');
  const [vin, setVin] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (vehicle) {
      setClientId(vehicle.client_id);
      setRegistrationNumber(vehicle.registration_number);
      setBrand(vehicle.brand);
      setModel(vehicle.model);
      setYear(vehicle.year);
      setMileage(vehicle.mileage);
      setFuelType(vehicle.fuel_type);
      setVin(vehicle.vin);
      setNotes(vehicle.notes || '');
    } else {
      setClientId(initialClientId || (clients[0]?.id || ''));
      setRegistrationNumber('');
      setBrand('');
      setModel('');
      setYear(new Date().getFullYear());
      setMileage(0);
      setFuelType('GASOLINE');
      setVin('');
      setNotes('');
    }
  }, [vehicle, initialClientId, clients, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      client_id: clientId,
      registration_number: registrationNumber.toUpperCase().trim(),
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      mileage: Number(mileage),
      fuel_type: fuelType,
      vin: vin.toUpperCase().trim(),
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={vehicle ? 'Modifier la Fiche Véhicule' : 'Enregistrer un Véhicule'}
      subtitle="Associer le véhicule à un compte client avec ses caractéristiques techniques"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Owner Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Propriétaire Enregistré (Client) <span className="text-amber-400">*</span>
          </label>
          <select
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="" disabled>
              Sélectionner un client...
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name} ({c.phone})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Immatriculation <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="ex. AA-123-BB"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono uppercase focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Numéro VIN (Châssis) <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              placeholder="Numéro VIN 17 caractères ex. VF1..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono uppercase focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Marque <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="ex. Renault, Peugeot, BMW"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Modèle <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="ex. Clio V, 308, Série 3"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Année de Mise en Circulation <span className="text-amber-400">*</span>
            </label>
            <input
              type="number"
              required
              min={1970}
              max={2030}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono tabular-nums focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Kilométrage Compteur (km) <span className="text-amber-400">*</span>
            </label>
            <input
              type="number"
              required
              min={0}
              value={mileage}
              onChange={(e) => setMileage(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono tabular-nums focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Type de Carburant <span className="text-amber-400">*</span>
            </label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value as FuelType)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="GASOLINE">Essence (SP95 / SP98)</option>
              <option value="DIESEL">Diesel</option>
              <option value="HYBRID">Hybride (PHEV / HEV)</option>
              <option value="ELECTRIC">100% Électrique (BEV)</option>
              <option value="LPG">GPL</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Notes Techniques Véhicule (Huile recommandée, dimensions pneus, etc.)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ex. Huile 5W-30 norme RN0720, monte pneumatique 205/55 R16..."
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
            {vehicle ? 'Enregistrer les Modifications' : 'Enregistrer le Véhicule'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
