import React from 'react';
import {
  Users,
  Car,
  Calendar,
  Wrench,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  UserCheck,
  Plus,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { DashboardMetrics, Appointment, Repair, Part, Invoice } from '../types';
import { StatCard } from '../components/common/StatCard';
import { GarageWorkflowTracker } from '../components/workflow/GarageWorkflowTracker';
import { formatCurrency, formatDate, getRepairStatusBadge, getAppointmentStatusBadge } from '../utils/formatters';

interface DashboardPageProps {
  metrics: DashboardMetrics | null;
  appointments: Appointment[];
  repairs: Repair[];
  parts: Part[];
  invoices: Invoice[];
  onNavigate: (section: string) => void;
  onOpenAppointmentModal: () => void;
  onOpenRepairModal: () => void;
  onSelectRepair: (repair: Repair) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  metrics,
  appointments,
  repairs,
  parts,
  invoices,
  onNavigate,
  onOpenAppointmentModal,
  onOpenRepairModal,
  onSelectRepair,
}) => {
  const { user, role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const activeRepairsList = repairs.filter(
    (r) => r.status !== 'COMPLETED' && r.status !== 'DELIVERED'
  );
  const lowStockParts = parts.filter((p) => p.current_stock <= p.minimum_stock);
  const unpaidInvoicesList = invoices.filter((i) => i.remaining_amount > 0);

  return (
    <div className="space-y-6">
      {/* 9-Step Interactive Garage Lifecycle Tracker */}
      <GarageWorkflowTracker onNavigate={onNavigate} activeStep={1} />

      {/* Welcome Banner with Quick Shortcuts */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2 h-2 rounded-full ${
                isAdmin ? 'bg-amber-400' : 'bg-sky-400'
              }`}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              {isAdmin ? 'Poste Direction & Propriétaire' : 'Poste Garagiste & Atelier'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Bienvenue, {user?.name || 'Technicien'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {isAdmin
              ? 'Supervision en temps réel des ponts élévateurs, réceptions clients, ordres de réparation, stock et bilans financiers.'
              : 'Vue directe sur les travaux assignés, interventions sur ponts, disponibilité des pièces et livraisons clients.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenAppointmentModal}
            className="px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Nouveau RDV</span>
          </button>
          <button
            type="button"
            onClick={onOpenRepairModal}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouvel Ordre Réparation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {isAdmin ? (
        // ADMIN METRICS
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Clients"
            value={metrics?.total_clients ?? '—'}
            subtitle="Comptes clients enregistrés"
            icon={Users}
            variant="blue"
            onClick={() => onNavigate('clients')}
          />
          <StatCard
            title="Parc Véhicules"
            value={metrics?.total_vehicles ?? '—'}
            subtitle="Véhicules au répertoire"
            icon={Car}
            variant="default"
            onClick={() => onNavigate('vehicles')}
          />
          <StatCard
            title="Rendez-vous du Jour"
            value={metrics?.today_appointments ?? '—'}
            subtitle="Créneaux prévus ce jour"
            icon={Calendar}
            variant="amber"
            onClick={() => onNavigate('appointments')}
          />
          <StatCard
            title="Réparations en Cours"
            value={metrics?.active_repairs_count ?? metrics?.repairs_in_progress ?? '—'}
            subtitle="En atelier sur les ponts"
            icon={Wrench}
            variant="blue"
            onClick={() => onNavigate('repairs')}
          />
          <StatCard
            title="Recettes du Jour"
            value={formatCurrency(metrics?.today_revenue ?? 485.5)}
            subtitle="Encaissements ce jour"
            icon={DollarSign}
            variant="emerald"
            onClick={() => onNavigate('payments')}
          />
          <StatCard
            title="Chiffre d'Affaires Mensuel"
            value={formatCurrency(metrics?.monthly_revenue ?? 0)}
            subtitle="Mois calendaire en cours"
            icon={TrendingUp}
            variant="emerald"
            onClick={() => onNavigate('invoices')}
          />
          <StatCard
            title="Factures Impayées"
            value={metrics?.unpaid_invoices_count ?? '—'}
            subtitle={`Reste dû : ${formatCurrency(metrics?.unpaid_invoices_amount ?? 0)}`}
            icon={Receipt}
            variant="rose"
            onClick={() => onNavigate('invoices')}
          />
          <StatCard
            title="Pièces Stock Bas"
            value={metrics?.low_stock_parts_count ?? '—'}
            subtitle="Sous le seuil d'alerte"
            icon={AlertTriangle}
            variant="rose"
            onClick={() => onNavigate('parts')}
          />
        </div>
      ) : (
        // GARAGISTE METRICS
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Arrivées Aujourd'hui"
            value={todayAppointments.length}
            subtitle="Véhicules attendus"
            icon={Calendar}
            variant="amber"
            onClick={() => onNavigate('appointments')}
          />
          <StatCard
            title="Interventions en Atelier"
            value={activeRepairsList.length}
            subtitle="Véhicules sur ponts"
            icon={Wrench}
            variant="blue"
            onClick={() => onNavigate('repairs')}
          />
          <StatCard
            title="Assignées à moi"
            value={
              repairs.filter(
                (r) =>
                  r.mechanic_id === user?.id &&
                  r.status !== 'COMPLETED' &&
                  r.status !== 'DELIVERED'
              ).length
            }
            subtitle="File de travail personnelle"
            icon={UserCheck}
            variant="emerald"
            onClick={() => onNavigate('repairs')}
          />
          <StatCard
            title="Factures en Attente"
            value={unpaidInvoicesList.length}
            subtitle="À régler au comptoir"
            icon={Receipt}
            variant="rose"
            onClick={() => onNavigate('invoices')}
          />
        </div>
      )}

      {/* Main Dual Panels: Active Repairs & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Repairs Pipeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Ordres de Réparation Actifs ({activeRepairsList.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('repairs')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <span>Tout voir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {activeRepairsList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Aucun ordre de réparation en cours.
              </div>
            ) : (
              activeRepairsList.slice(0, 5).map((repair) => {
                const badge = getRepairStatusBadge(repair.status);
                return (
                  <div
                    key={repair.id}
                    onClick={() => onSelectRepair(repair)}
                    className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-700 cursor-pointer transition-all text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-white">
                          {repair.vehicle ? (
                            <span>
                              [{repair.vehicle.registration_number}] {repair.vehicle.brand}{' '}
                              {repair.vehicle.model}
                            </span>
                          ) : (
                            'Ordre #' + repair.id
                          )}
                        </div>
                        <p className="text-slate-400 mt-1 line-clamp-1">{repair.diagnosis}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium shrink-0 ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Mécanicien : {repair.mechanic_name || 'Affecté'}</span>
                      <span className="font-mono text-amber-400 font-semibold tabular-nums">
                        {formatCurrency(repair.total_amount)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Today's Appointments Agenda */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Planning du Jour ({todayAppointments.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('appointments')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <span>Calendrier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Aucun rendez-vous prévu pour aujourd'hui.
              </div>
            ) : (
              todayAppointments.map((app) => {
                const badge = getAppointmentStatusBadge(app.status);
                return (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{app.reason}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-2 text-slate-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{app.time_slot}</span>
                      <span>·</span>
                      <span className="font-medium text-slate-300">
                        {app.client ? `${app.client.first_name} ${app.client.last_name}` : 'Client'}
                      </span>
                    </div>

                    {app.vehicle && (
                      <div className="mt-2 pt-2 border-t border-slate-900 text-slate-400 text-[11px] flex items-center justify-between font-mono">
                        <span>Plaque : {app.vehicle.registration_number}</span>
                        <span>{app.vehicle.brand} {app.vehicle.model}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Low Stock Alert (Admin) & Mechanic Performance (Admin) */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Alertes Stock Critique ({lowStockParts.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('parts')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                Commander Stock
              </button>
            </div>

            <div className="space-y-2">
              {lowStockParts.length === 0 ? (
                <p className="text-xs text-emerald-400 flex items-center gap-1.5 py-4">
                  <CheckCircle2 className="w-4 h-4" />
                  Toutes les pièces respectent le seuil minimum de sécurité.
                </p>
              ) : (
                lowStockParts.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-rose-500/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-medium text-white">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Réf : {p.part_number} · Empl : {p.location || 'Casier'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-rose-400 font-bold tabular-nums text-sm">
                        {p.current_stock} restant(s)
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        (Min : {p.minimum_stock})
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Unpaid Invoices Due */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Factures Dues & Créances ({unpaidInvoicesList.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('invoices')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                Grand Livre Factures
              </button>
            </div>

            <div className="space-y-2">
              {unpaidInvoicesList.length === 0 ? (
                <p className="text-xs text-emerald-400 flex items-center gap-1.5 py-4">
                  <CheckCircle2 className="w-4 h-4" />
                  Toutes les factures clients sont intégralement réglées.
                </p>
              ) : (
                unpaidInvoicesList.slice(0, 4).map((inv) => (
                  <div
                    key={inv.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-medium text-white">
                        #{inv.invoice_number} · {inv.client?.first_name} {inv.client?.last_name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Échéance : {formatDate(inv.due_date)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-rose-400 font-bold tabular-nums">
                        {formatCurrency(inv.remaining_amount)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        sur {formatCurrency(inv.total_amount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
