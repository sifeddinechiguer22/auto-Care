import React, { useState } from 'react';
import { User, getUserDisplayName } from '../types';
import { Plus, Search, ShieldCheck, Shield, Phone, Mail, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { UserFormModal } from '../components/users/UserFormModal';
import { formatDate } from '../utils/formatters';

interface UsersPageProps {
  users: User[];
  onCreateUser: (data: Omit<User, 'id' | 'created_at'>) => Promise<void>;
  onUpdateUser: (id: string, data: Partial<User>) => Promise<void>;
}

export const UsersPage: React.FC<UsersPageProps> = ({
  users,
  onCreateUser,
  onUpdateUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    const fullName = getUserDisplayName(u).toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = (u.phone || '').toLowerCase();

    return fullName.includes(term) || email.includes(term) || phone.includes(term);
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Omit<User, 'id' | 'created_at'>) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await onUpdateUser(editingUser.id, data);
      } else {
        await onCreateUser(data);
      }
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    await onUpdateUser(user.id, { is_active: !user.is_active });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
              Réservé Direction · Sécurité des Accès
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Équipe & Utilisateurs du Garage</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Comptes des mécaniciens et employés, droits d'accès et habilitations atelier
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Collaborateur</span>
        </button>
      </div>

      {/* Users Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={getUserDisplayName(user)}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400">
                      {getUserDisplayName(user).charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">{getUserDisplayName(user)}</h4>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold uppercase px-2 py-0.2 rounded border mt-0.5 ${
                        user.role === 'ADMIN'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      <span>{user.role === 'ADMIN' ? 'GÉRANT / ADMIN' : 'GARAGISTE / MÉCANICIEN'}</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleActive(user)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                    user.is_active
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                  }`}
                  title="Changer le statut du compte"
                >
                  {user.is_active ? 'Actif' : 'Suspendu'}
                </button>
              </div>

              <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-850">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="text-[11px] text-slate-500 font-mono pt-1">
                  Inscrit le : {formatDate(user.created_at)}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">ID Atelier : {user.id}</span>
              <button
                type="button"
                onClick={() => handleOpenEdit(user)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px]"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Modifier Accès</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        user={editingUser}
        isLoading={isSubmitting}
      />
    </div>
  );
};
