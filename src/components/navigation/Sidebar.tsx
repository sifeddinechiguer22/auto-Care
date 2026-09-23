import React from 'react';
import {
  LayoutDashboard,
  Users,
  Car,
  Calendar,
  Wrench,
  Sparkles,
  Package,
  Receipt,
  CreditCard,
  TrendingDown,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Shield,
  X,
} from 'lucide-react';
import { Role } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  currentSection: string;
  onNavigate: (section: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  metricsCounts?: {
    todayAppointments?: number;
    lowStock?: number;
    activeRepairs?: number;
    unpaidInvoices?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  metricsCounts,
}) => {
  const { user, role, logout } = useAuth();

  // Navigation definition based on role
  const navItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'GARAGISTE'],
    },
    {
      id: 'clients',
      label: 'Clients & Comptes',
      icon: Users,
      roles: ['ADMIN', 'GARAGISTE'],
    },
    {
      id: 'vehicles',
      label: 'Parc Véhicules',
      icon: Car,
      roles: ['ADMIN', 'GARAGISTE'],
    },
    {
      id: 'appointments',
      label: 'Rendez-vous',
      icon: Calendar,
      badge: metricsCounts?.todayAppointments ? `${metricsCounts.todayAppointments} auj.` : undefined,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      roles: ['ADMIN', 'GARAGISTE'],
    },
    {
      id: 'repairs',
      label: 'Réparations & Ordres',
      icon: Wrench,
      badge: metricsCounts?.activeRepairs ? `${metricsCounts.activeRepairs} en cours` : undefined,
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      roles: ['ADMIN', 'GARAGISTE'],
    },
    {
      id: 'services',
      label: 'Catalogue Prestations',
      icon: Sparkles,
      roles: ['ADMIN', 'GARAGISTE'],
    },
    {
      id: 'parts',
      label: 'Pièces & Stock',
      icon: Package,
      badge: metricsCounts?.lowStock ? `${metricsCounts.lowStock} bas` : undefined,
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      roles: ['ADMIN'],
    },
    {
      id: 'invoices',
      label: 'Facturation & Devis',
      icon: Receipt,
      badge: metricsCounts?.unpaidInvoices ? `${metricsCounts.unpaidInvoices} dues` : undefined,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      roles: ['ADMIN', 'GARAGISTE'],
    },
    {
      id: 'payments',
      label: 'Règlements & Caisse',
      icon: CreditCard,
      roles: ['ADMIN', 'GARAGISTE'],
    },
    {
      id: 'expenses',
      label: 'Charges & Dépenses',
      icon: TrendingDown,
      roles: ['ADMIN'], // Strictly Admin
    },
    {
      id: 'users',
      label: 'Équipe & Garagistes',
      icon: ShieldCheck,
      roles: ['ADMIN'], // Strictly Admin
    },
  ];

  const allowedNavItems = navItems.filter((item) =>
    role ? item.roles.includes(role) : false
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 shadow-md font-black tracking-tight">
              <Wrench className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight leading-tight block">
                AutoCare
              </span>
              <span className="text-[11px] font-medium text-amber-400/90 tracking-wide uppercase block">
                Garage System
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Indicator Banner */}
        <div className="px-4 pt-4 pb-2">
          <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield
                className={`w-3.5 h-3.5 ${
                  role === 'ADMIN' ? 'text-amber-400' : 'text-sky-400'
                }`}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {role === 'ADMIN' ? 'Gérant / Admin' : 'Garagiste'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Atelier Unique
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border font-mono tabular-nums shrink-0 ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Sign Out */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-850">
            <div className="flex items-center gap-2.5 min-w-0">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
              )}
              <div className="truncate">
                <span className="text-xs font-medium text-white block truncate">
                  {user?.name || 'Garage Staff'}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {user?.email}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
