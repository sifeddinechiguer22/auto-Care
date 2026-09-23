import React from 'react';
import {
  UserCheck,
  Car,
  CalendarCheck,
  Stethoscope,
  Wrench,
  Layers,
  Receipt,
  CreditCard,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface GarageWorkflowTrackerProps {
  onNavigate: (section: string) => void;
  activeStep?: number;
}

export const GarageWorkflowTracker: React.FC<GarageWorkflowTrackerProps> = ({
  onNavigate,
  activeStep,
}) => {
  const steps = [
    { id: 'clients', label: '1. Client', icon: UserCheck, desc: 'Fiche propriétaire' },
    { id: 'vehicles', label: '2. Véhicule', icon: Car, desc: 'Immat & Carte grise' },
    { id: 'appointments', label: '3. Rendez-vous', icon: CalendarCheck, desc: 'Planification créneau' },
    { id: 'repairs', label: '4. Diagnostic', icon: Stethoscope, desc: 'Recherche de pannes' },
    { id: 'repairs', label: '5. Réparation', icon: Wrench, desc: 'Affectation mécanicien' },
    { id: 'parts', label: '6. Pièces & M.O.', icon: Layers, desc: 'Sortie stock & tâches' },
    { id: 'invoices', label: '7. Facturation', icon: Receipt, desc: 'Édition facture client' },
    { id: 'payments', label: '8. Règlement', icon: CreditCard, desc: 'Encaissement & reçu' },
    { id: 'repairs', label: '9. Restitution', icon: CheckCircle2, desc: 'Remise des clés' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Cycle Opérationnel Atelier AutoCare
          </h4>
        </div>
        <span className="text-xs text-slate-400">Processus en 9 étapes</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = activeStep === idx + 1;

          return (
            <button
              key={`${step.id}-${idx}`}
              type="button"
              onClick={() => onNavigate(step.id)}
              className={`flex flex-col items-center text-center p-2.5 rounded-lg border transition-all ${
                isCurrent
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-slate-850/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800'
              }`}
            >
              <div
                className={`p-1.5 rounded-md mb-1.5 ${
                  isCurrent ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-200 line-clamp-1">
                {step.label}
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                {step.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
