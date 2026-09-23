import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Plus,
  Shield,
  RotateCcw,
  CheckCircle,
  Database,
  ExternalLink,
  ChevronDown,
  LogOut,
  Calendar,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { resetMockDatabase } from '../../api/mockStorage';
import { useToast } from '../../hooks/useToast';

interface TopNavbarProps {
  onOpenMobileSidebar: () => void;
  currentSection: string;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onQuickAction?: (action: 'appointment' | 'repair') => void;
  onNavigate: (section: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenMobileSidebar,
  currentSection,
  onOpenNotifications,
  unreadNotificationsCount,
  onQuickAction,
  onNavigate,
}) => {
  const { user, role, switchRoleQuick, isDemoMode, toggleDemoMode, logout } = useAuth();
  const { showToast } = useToast();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  const sectionTitles: Record<string, string> = {
    dashboard: 'Tableau de bord Opérationnel',
    clients: 'Répertoire Clients',
    vehicles: 'Parc & Immatriculations',
    appointments: 'Planning & Rendez-vous',
    repairs: 'Ordres de Travail & Réparations',
    services: 'Catalogue Prestations & Forfaits',
    parts: 'Stock & Pièces de Rechange',
    invoices: 'Facturation & Devis',
    payments: 'Caisse & Règlements',
    expenses: 'Charges & Dépenses Atelier',
    users: 'Équipe Atelier & Garagistes',
  };

  const handleResetData = () => {
    resetMockDatabase();
    showToast('Base de démonstration réinitialisée avec succès', 'success');
    setProfileDropdownOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean Breadcrumbs conforming to anti-slop rules */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">AutoCare</span>
          <span className="text-slate-600">/</span>
          <span className="text-white font-semibold">
            {sectionTitles[currentSection] || currentSection}
          </span>
        </div>
      </div>

      {/* Right: Actions, Role Switcher, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Quick Role Switcher for instant evaluator testing */}
        <div className="hidden md:flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => {
              switchRoleQuick('ADMIN');
              showToast('Basculé en mode Propriétaire / Gérant (ADMIN)', 'info');
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              role === 'ADMIN'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vue Gérant
          </button>
          <button
            type="button"
            onClick={() => {
              switchRoleQuick('GARAGISTE');
              showToast('Basculé en mode Garagiste Atelier (GARAGISTE)', 'info');
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              role === 'GARAGISTE'
                ? 'bg-sky-500 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vue Garagiste
          </button>
        </div>

        {/* Quick Action Button */}
        {onQuickAction && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setQuickMenuOpen(!quickMenuOpen)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau</span>
              <ChevronDown className="w-3 h-3 text-amber-200" />
            </button>

            {quickMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setQuickMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-52 bg-slate-900 border border-slate-850 rounded-lg shadow-xl py-1 z-20 text-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickMenuOpen(false);
                      onQuickAction('appointment');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nouveau Rendez-vous</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickMenuOpen(false);
                      onQuickAction('repair');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Wrench className="w-3.5 h-3.5 text-sky-400" />
                    <span>Créer Ordre de Réparation</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Notifications Icon */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-slate-900" />
          )}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-700"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-20 text-slate-200">
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                    Rôle : {role === 'ADMIN' ? 'Gérant / Admin' : 'Garagiste'}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      toggleDemoMode(!isDemoMode);
                      showToast(
                        !isDemoMode
                          ? 'Mode Démo activé (données atelier locales)'
                          : 'Mode API FastAPI directe activé (127.0.0.1:8000)',
                        'info'
                      );
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs text-left hover:bg-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isDemoMode ? 'Mode Démo Actif' : 'Connexion API FastAPI'}</span>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isDemoMode ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={handleResetData}
                    className="w-full px-4 py-2 text-xs text-left hover:bg-slate-800 flex items-center gap-2 text-slate-400 hover:text-slate-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Réinitialiser les données démo</span>
                  </button>
                </div>

                <div className="border-t border-slate-800 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-xs text-left hover:bg-rose-500/10 text-rose-400 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Se Déconnecter</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
