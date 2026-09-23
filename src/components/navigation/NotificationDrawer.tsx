import React from 'react';
import { X, AlertTriangle, Calendar, Receipt, Wrench, CheckCircle } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'stock' | 'appointment' | 'invoice' | 'repair';
  read: boolean;
  linkSection: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onNavigate: (section: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onNavigate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-slate-900 border-l border-slate-800 h-full p-5 shadow-2xl flex flex-col z-10 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">Notifications Atelier</h3>
            <p className="text-xs text-slate-400 mt-0.5">Alertes opérationnelles et statut en temps réel</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Aucune nouvelle notification atelier.
            </div>
          ) : (
            notifications.map((n) => {
              let Icon = Calendar;
              let iconColor = 'text-sky-400 bg-sky-500/10 border-sky-500/20';

              if (n.type === 'stock') {
                Icon = AlertTriangle;
                iconColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
              } else if (n.type === 'invoice') {
                Icon = Receipt;
                iconColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
              } else if (n.type === 'repair') {
                Icon = Wrench;
                iconColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
              }

              return (
                <div
                  key={n.id}
                  onClick={() => {
                    onMarkAsRead(n.id);
                    onNavigate(n.linkSection);
                    onClose();
                  }}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    n.read
                      ? 'bg-slate-900/60 border-slate-800/80 opacity-70'
                      : 'bg-slate-850 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-md border shrink-0 ${iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white truncate">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
