import React, { useState } from 'react';
import {
  X,
  UserPlus,
  LogIn,
  Mail,
  KeyRound,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { registerWithEmail, loginWithEmail } from '../lib/firebase';
import { usePsychoTheme } from '../context/ThemeContext';

interface EmailAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'register' | 'login';
}

export const EmailAuthModal: React.FC<EmailAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
}) => {
  const { theme } = usePsychoTheme();
  const [authMode, setAuthMode] = useState<'register' | 'login'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Mohon lengkapi alamat email dan kata sandi Anda.');
      return;
    }

    if (authMode === 'register') {
      if (password.length < 6) {
        setError('Kata sandi harus terdiri dari minimal 6 karakter.');
        return;
      }
      if (!displayName.trim()) {
        setError('Mohon masukkan nama atau panggilan Anda.');
        return;
      }
    }

    setLoading(true);
    try {
      if (authMode === 'register') {
        await registerWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      setError(err.message || 'Proses autentikasi gagal. Silakan periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 relative transition-all ${
          theme === 'cognitive_slate'
            ? 'bg-[#121B24] border-[#1F2D3D] text-[#F1F5F9]'
            : theme === 'sand_therapy'
            ? 'bg-[#FFFFFF] border-[#E8DED3] text-[#291E19]'
            : 'bg-[#FFFFFF] border-[#DCE5DE] text-[#162A20]'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 opacity-60 hover:opacity-100 rounded-lg hover:bg-neutral-500/10 transition-colors cursor-pointer"
          title="Tutup dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 mb-5 pr-8">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                theme === 'cognitive_slate'
                  ? 'bg-teal-500/20 text-teal-300'
                  : theme === 'sand_therapy'
                  ? 'bg-[#9C533A]/15 text-[#9C533A]'
                  : 'bg-[#2D5A46]/15 text-[#2D5A46]'
              }`}
            >
              {authMode === 'register' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            </div>
            <h2 className="text-lg font-bold font-serif">
              {authMode === 'register' ? 'Daftar Akun Refleksi Baru' : 'Masuk dengan Email'}
            </h2>
          </div>
          <p className="text-xs opacity-75 font-sans">
            {authMode === 'register'
              ? 'Daftarkan email Anda untuk ruang refleksi dan bimbingan psikologis privat.'
              : 'Gunakan akun email dan kata sandi yang telah Anda daftarkan.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          className={`flex p-1 rounded-xl border mb-4 ${
            theme === 'cognitive_slate'
              ? 'bg-[#0E1620] border-[#1F2D3D]'
              : 'bg-[#F4F7F5] border-[#E0E8E2]'
          }`}
        >
          <button
            type="button"
            id="modal-tab-register"
            onClick={() => {
              setAuthMode('register');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'register'
                ? theme === 'cognitive_slate'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : theme === 'sand_therapy'
                  ? 'bg-[#9C533A] text-white shadow-xs'
                  : 'bg-[#2D5A46] text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Akun</span>
          </button>
          <button
            type="button"
            id="modal-tab-login"
            onClick={() => {
              setAuthMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'login'
                ? theme === 'cognitive_slate'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : theme === 'sand_therapy'
                  ? 'bg-[#9C533A] text-white shadow-xs'
                  : 'bg-[#2D5A46] text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk Email</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'register' && (
            <div className="space-y-1">
              <label className="block text-xs font-medium opacity-80">
                Nama Lengkap / Nama Panggilan
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-neutral-400 absolute left-3" />
                <input
                  id="modal-input-name"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="cth. Anisa Rahma"
                  className={`w-full border rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none transition-colors ${
                    theme === 'cognitive_slate'
                      ? 'bg-[#0E1620] border-[#243547] text-white focus:border-teal-500'
                      : 'bg-[#FBFDFB] border-[#DCE5DE] text-neutral-900 focus:border-[#2D5A46]'
                  }`}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-medium opacity-80">
              Alamat Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3" />
              <input
                id="modal-input-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className={`w-full border rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none transition-colors ${
                  theme === 'cognitive_slate'
                    ? 'bg-[#0E1620] border-[#243547] text-white focus:border-teal-500'
                    : 'bg-[#FBFDFB] border-[#DCE5DE] text-neutral-900 focus:border-[#2D5A46]'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium opacity-80">
              Kata Sandi {authMode === 'register' && <span className="opacity-70 text-[11px]">(min. 6 karakter)</span>}
            </label>
            <div className="relative flex items-center">
              <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3" />
              <input
                id="modal-input-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full border rounded-xl py-2 pl-9 pr-9 text-xs focus:outline-none transition-colors ${
                  theme === 'cognitive_slate'
                    ? 'bg-[#0E1620] border-[#243547] text-white focus:border-teal-500'
                    : 'bg-[#FBFDFB] border-[#DCE5DE] text-neutral-900 focus:border-[#2D5A46]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="btn-modal-submit-auth"
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-md mt-4 ${
              theme === 'cognitive_slate'
                ? 'bg-teal-600 hover:bg-teal-500'
                : theme === 'sand_therapy'
                ? 'bg-[#9C533A] hover:bg-[#854530]'
                : 'bg-[#2D5A46] hover:bg-[#234937]'
            }`}
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : authMode === 'register' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Daftar Akun Baru</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk dengan Email</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-inherit flex items-center justify-center gap-1.5 text-[11px] opacity-70">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Data terenkripsi dan terlindungi di Cloud Firestore</span>
        </div>
      </div>
    </div>
  );
};
