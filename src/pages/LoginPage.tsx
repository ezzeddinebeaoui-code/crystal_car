import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Loader2, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      if (email.toLowerCase().includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setErrorMsg(res.error || 'Identifiants invalides.');
    }
  };

  const fillDemoAccount = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setEmail('admin@crystalrentcar.com');
      setPassword('AdminCrystal2026!Secure');
    } else {
      setEmail('client@crystalrentcar.com');
      setPassword('ClientCrystal2026!');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-[#131722] border border-white/10 p-8 space-y-6 shadow-2xl">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#aa8421] p-[1px] mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-[#0b0d11] rounded-[15px] flex items-center justify-center">
              <span className="font-serif-luxury text-2xl font-bold gold-gradient-text">C</span>
            </div>
          </div>
          <h1 className="font-serif-luxury text-2xl font-bold text-white">Connexion Espace Client</h1>
          <p className="text-xs text-gray-400">
            Accédez à vos réservations et vos avantages Crystal Rent Car
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
              Adresse Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@exemple.com"
              className="w-full px-4 py-3 rounded-xl bg-[#0b0d11] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-[#0b0d11] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c49e29] to-[#997715] text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-lg shadow-[#d4af37]/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Se Connecter</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Logins for Testing */}
        <div className="pt-4 border-t border-white/5 space-y-2.5">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center">
            Comptes de test pré-configurés :
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemoAccount('customer')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Client Démo</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#d4af37] transition flex items-center justify-center gap-1.5 font-bold"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Démo</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          Vous n'avez pas encore de compte ?{' '}
          <Link to="/register" className="text-[#d4af37] hover:underline font-semibold">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
};
