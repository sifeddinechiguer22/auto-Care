import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Wrench, Shield, KeyRound, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import heroWorkshopImg from '../assets/images/autocare_hero_workshop_1790162954360.jpg';
import ownerAvatar from '../assets/images/autocare_owner_avatar_1790162967608.jpg';
import mechanicAvatar from '../assets/images/autocare_mechanic_avatar_1790162978810.jpg';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('admin@autocare.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await login(email, password);
      showToast(`Bienvenue, ${res.user.name} ! Connecté en tant que ${res.role === 'ADMIN' ? 'Gérant' : 'Garagiste'}`, 'success');
    } catch (err: any) {
      setError(err?.message || 'Identifiants invalides. Veuillez vérifier votre adresse email et mot de passe.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectDemoAccount = (role: 'ADMIN' | 'GARAGISTE') => {
    if (role === 'ADMIN') {
      setEmail('admin@autocare.com');
      setPassword('password');
    } else {
      setEmail('sam@autocare.com');
      setPassword('password');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
      {/* Left Visual Column */}
      <div className="relative md:w-1/2 lg:w-3/5 min-h-[300px] md:min-h-screen flex flex-col justify-between p-8 sm:p-12 overflow-hidden bg-slate-900">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroWorkshopImg}
            alt="AutoCare Garage Workshop"
            className="w-full h-full object-cover opacity-35 filter brightness-75 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950 md:block hidden" />
        </div>

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-lg font-black">
            <Wrench className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">
              AutoCare Garage
            </h1>
            <p className="text-xs text-amber-400 font-medium tracking-wide mt-1">
              Système de Gestion d'Atelier Automobile
            </p>
          </div>
        </div>

        {/* Bottom Hero Description */}
        <div className="relative z-10 max-w-lg mt-12 md:mt-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-900/90 border border-slate-700/60 text-xs font-mono text-amber-300 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Architecture Atelier Unique · Prêt pour Backend FastAPI</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            L'excellence technique au service de votre atelier mécanique.
          </h2>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Gérez l'ensemble des clients, véhicules, plannings de rendez-vous, ordres de réparation,
            stocks de pièces détachées et facturation dans un système unifié et fluide.
          </p>

          <div className="mt-6 flex items-center gap-6 pt-6 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
            <div>
              <span className="text-white font-bold block text-base tabular-nums">9 Étapes</span>
              <span>Cycle Réparation</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-white font-bold block text-base tabular-nums">Contrôle Rôles</span>
              <span>Gérant & Garagiste</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-white font-bold block text-base tabular-nums">Stock Pièces</span>
              <span>Alertes en direct</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Form Column */}
      <div className="md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 sm:p-12 z-10 bg-slate-950">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Authentification Atelier</h3>
            <p className="text-xs text-slate-400 mt-1">
              Connectez-vous avec vos identifiants professionnels pour accéder au tableau de bord.
            </p>
          </div>

          {/* Quick Demo Role Selector Pills */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Connexion Rapide Démo (Sélectionnez un rôle) :
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => selectDemoAccount('ADMIN')}
                className={`p-2 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                  email === 'admin@autocare.com'
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <img
                  src={ownerAvatar}
                  alt="Marcus Vance"
                  className="w-7 h-7 rounded-full object-cover border border-amber-500/40 shrink-0"
                />
                <div className="truncate">
                  <div className="text-xs font-semibold truncate leading-tight">Marcus Vance</div>
                  <div className="text-[10px] text-amber-400 font-mono">Gérant (ADMIN)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => selectDemoAccount('GARAGISTE')}
                className={`p-2 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                  email === 'sam@autocare.com'
                    ? 'border-sky-500 bg-sky-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <img
                  src={mechanicAvatar}
                  alt="Sam Dupont"
                  className="w-7 h-7 rounded-full object-cover border border-sky-500/40 shrink-0"
                />
                <div className="truncate">
                  <div className="text-xs font-semibold truncate leading-tight">Sam Dupont</div>
                  <div className="text-[10px] text-sky-400 font-mono">Mécanicien (GARAGISTE)</div>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Adresse Email Professionnelle
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@autocare.com"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Mot de passe
                </label>
                <span className="text-[10px] text-slate-500">FastAPI backend prêt</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Accéder à l'Atelier</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-900 text-center text-xs text-slate-500">
            AutoCare Garage v2.4 · Gestion d'Atelier Unique
          </div>
        </div>
      </div>
    </div>
  );
};
