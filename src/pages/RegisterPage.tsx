import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const res = await register(name, email, password, phone);
    setIsLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.error || 'Erreur lors de l’inscription.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-[#131722] border border-white/10 p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#aa8421] p-[1px] mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-[#0b0d11] rounded-[15px] flex items-center justify-center">
              <span className="font-serif-luxury text-2xl font-bold gold-gradient-text">C</span>
            </div>
          </div>
          <h1 className="font-serif-luxury text-2xl font-bold text-white">Créer Votre Compte</h1>
          <p className="text-xs text-gray-400">
            Rejoignez Crystal Rent Car pour réserver plus vite et suivre vos locations
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
              <User className="w-3.5 h-3.5 text-[#d4af37]" />
              Nom et Prénom *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mohamed Ben Salem"
              className="w-full px-4 py-3 rounded-xl bg-[#0b0d11] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
              Adresse Email *
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
              <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
              Téléphone / WhatsApp
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+216 98 123 456"
              className="w-full px-4 py-3 rounded-xl bg-[#0b0d11] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
              Mot de passe (min 6 caractères) *
            </label>
            <input
              type="password"
              required
              minLength={6}
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
                <UserPlus className="w-4 h-4" />
                <span>Créer mon compte</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Vous avez déjà un compte ?{' '}
          <Link to="/login" className="text-[#d4af37] hover:underline font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};
