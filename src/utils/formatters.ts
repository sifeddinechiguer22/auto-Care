import { AppointmentStatus, RepairStatus, InvoiceStatus, PaymentMethod, ExpenseCategory } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatTime(timeStr: string | undefined | null): string {
  if (!timeStr) return '—';
  return timeStr;
}

export function formatMileage(km: number | undefined | null): string {
  if (km == null) return '0 km';
  return `${new Intl.NumberFormat('fr-FR').format(km)} km`;
}

export function getAppointmentStatusBadge(status: AppointmentStatus): {
  label: string;
  className: string;
  dotColor: string;
} {
  switch (status) {
    case 'PENDING':
      return {
        label: 'En attente',
        className: 'text-amber-400 bg-amber-500/10 border border-amber-500/20',
        dotColor: 'bg-amber-400',
      };
    case 'CONFIRMED':
      return {
        label: 'Confirmé',
        className: 'text-sky-400 bg-sky-500/10 border border-sky-500/20',
        dotColor: 'bg-sky-400',
      };
    case 'IN_PROGRESS':
      return {
        label: 'En atelier',
        className: 'text-blue-400 bg-blue-500/10 border border-blue-500/20',
        dotColor: 'bg-blue-400',
      };
    case 'COMPLETED':
      return {
        label: 'Terminé',
        className: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
        dotColor: 'bg-emerald-400',
      };
    case 'CANCELLED':
      return {
        label: 'Annulé',
        className: 'text-slate-400 bg-slate-500/10 border border-slate-500/20',
        dotColor: 'bg-slate-400',
      };
  }
}

export function getRepairStatusBadge(status: RepairStatus): {
  label: string;
  className: string;
  step: number;
} {
  switch (status) {
    case 'DIAGNOSIS':
      return {
        label: '1. Diagnostic',
        className: 'text-amber-400 bg-amber-500/10 border border-amber-500/20',
        step: 1,
      };
    case 'PARTS_WAIT':
      return {
        label: '2. Attente pièces',
        className: 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20',
        step: 2,
      };
    case 'IN_PROGRESS':
      return {
        label: '3. En réparation',
        className: 'text-blue-400 bg-blue-500/10 border border-blue-500/20',
        step: 3,
      };
    case 'QUALITY_CHECK':
      return {
        label: '4. Contrôle qualité',
        className: 'text-purple-400 bg-purple-500/10 border border-purple-500/20',
        step: 4,
      };
    case 'COMPLETED':
      return {
        label: '5. Prêt pour retrait',
        className: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
        step: 5,
      };
    case 'DELIVERED':
      return {
        label: '6. Véhicule livré',
        className: 'text-slate-300 bg-slate-700/50 border border-slate-600/30',
        step: 6,
      };
  }
}

export function getInvoiceStatusBadge(status: InvoiceStatus | string | null | undefined): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'PAID':
      return {
        label: 'Payée',
        className: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
      };
    case 'UNPAID':
    case 'PENDING':
      return {
        label: 'En attente',
        className: 'text-amber-400 bg-amber-500/10 border border-amber-500/20',
      };
    case 'PARTIALLY_PAID':
    case 'PARTIAL':
      return {
        label: 'Partiellement payée',
        className: 'text-sky-400 bg-sky-500/10 border border-sky-500/20',
      };
    case 'OVERDUE':
      return {
        label: 'En retard',
        className: 'text-rose-400 bg-rose-500/10 border border-rose-500/20',
      };
    case 'CANCELLED':
      return {
        label: 'Annulée',
        className: 'text-slate-400 bg-slate-500/10 border border-slate-500/20',
      };
    default:
      return {
        label: 'En attente',
        className: 'text-amber-400 bg-amber-500/10 border border-amber-500/20',
      };
  }
}

export function getPaymentMethodBadge(method: PaymentMethod): {
  label: string;
  className: string;
} {
  switch (method) {
    case 'CARD':
    case 'CREDIT_CARD':
      return {
        label: 'Carte Bancaire (TPE)',
        className: 'text-blue-400 bg-blue-500/10 border border-blue-500/20',
      };
    case 'CASH':
      return {
        label: 'Espèces (Caisse)',
        className: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
      };
    case 'BANK_TRANSFER':
      return {
        label: 'Virement Bancaire',
        className: 'text-purple-400 bg-purple-500/10 border border-purple-500/20',
      };
    default:
      return {
        label: 'Autre',
        className: 'text-slate-400 bg-slate-500/10 border border-slate-500/20',
      };
  }
}

export function getExpenseCategoryBadge(category: ExpenseCategory): {
  label: string;
  className: string;
} {
  switch (category) {
    case 'PARTS_SUPPLIES':
      return {
        label: 'Pièces & Consommables',
        className: 'text-amber-400 bg-amber-500/10 border border-amber-500/20',
      };
    case 'EQUIPMENT':
      return {
        label: 'Outillage & Machines',
        className: 'text-sky-400 bg-sky-500/10 border border-sky-500/20',
      };
    case 'UTILITIES':
      return {
        label: 'Énergie & Fluides',
        className: 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20',
      };
    case 'RENT':
      return {
        label: 'Loyer Atelier',
        className: 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20',
      };
    case 'SALARIES':
      return {
        label: 'Salaires & Paie',
        className: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
      };
    case 'INSURANCE':
      return {
        label: 'Assurances Pro',
        className: 'text-purple-400 bg-purple-500/10 border border-purple-500/20',
      };
    case 'MAINTENANCE':
      return {
        label: 'Maintenance Ponts/Compresseurs',
        className: 'text-orange-400 bg-orange-500/10 border border-orange-500/20',
      };
    case 'OTHER':
      return {
        label: 'Divers & Frais Généraux',
        className: 'text-slate-400 bg-slate-500/10 border border-slate-500/20',
      };
  }
}

