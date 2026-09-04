import React, { useState } from 'react';
import {
  Heart,
  Shield,
  Bot,
  Lock,
  Palette,
  Wind,
  Smile,
  Sparkles,
  ChevronDown,
  UserPlus,
  LogIn,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import {
  loginWithGoogle,
  loginAsDemoUser,
} from '../lib/firebase';
import { usePsychoTheme } from '../context/ThemeContext';
import { ThemeSelectorModal } from './ThemeSelectorModal';
import { MindfulGroundingModal } from './MindfulGroundingModal';
import { EmailAuthModal } from './EmailAuthModal';

interface AuthLandingProps {
  onAuthSuccess?: () => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = () => {
  const { theme, currentOption } = usePsychoTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showGroundingModal, setShowGroundingModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalMode, setEmailModalMode] = useState<'register' | 'login'>('register');

  // Loading & error states
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setLoadingGoogle(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Masuk dengan Google gagal. Anda dapat menggunakan Coba Tanpa Login atau menu Daftar di navbar.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleDemoLogin = async () => {
    setAuthError(null);
    setLoadingDemo(true);
    try {
      await loginAsDemoUser();
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Masuk Sesi Mandiri gagal.');
    } finally {
      setLoadingDemo(false);
    }
  };

  const openRegisterModal = () => {
    setEmailModalMode('register');
    setShowEmailModal(true);
  };

  const openLoginEmailModal = () => {
    setEmailModalMode('login');
    setShowEmailModal(true);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors ${
        theme === 'cognitive_slate'
          ? 'bg-[#0B1118] text-[#F1F5F9]'
          : theme === 'sand_therapy'
          ? 'bg-[#FAF6F0] text-[#291E19]'
          : 'bg-[#F8FAF7] text-[#162A20]'
      }`}
    >
      {/* Top Navigation Bar with Register Menu */}
      <header
        className={`px-4 sm:px-6 py-3.5 border-b transition-colors ${
          theme === 'cognitive_slate'
            ? 'bg-[#0E1620]/90 border-[#1F2D3D]'
            : theme === 'sand_therapy'
            ? 'bg-[#FAF6F0]/90 border-[#E8DED3]'
            : 'bg-[#FFFFFF]/90 border-[#DCE5DE]'
        } backdrop-blur sticky top-0 z-20`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                theme === 'cognitive_slate'
                  ? 'bg-teal-600 text-white'
                  : theme === 'sand_therapy'
                  ? 'bg-[#9C533A] text-white'
                  : 'bg-[#2D5A46] text-white'
              }`}
            >
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base tracking-tight font-serif block leading-snug">
                Klinik Refleksi & Terapi Pikiran
              </span>
              <span className="text-[11px] opacity-70 font-sans hidden sm:block">
                Ruang Konseling & Eksplorasi Diri Terpandu AI
              </span>
            </div>
          </div>

          {/* Navigation Actions: Register Menu, Breath Exercise, and Theme */}
          <div className="flex items-center gap-2">
            {/* REGISTER MENU BUTTON IN NAVBAR */}
            <button
              type="button"
              id="btn-nav-register"
              onClick={openRegisterModal}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-all shadow-xs cursor-pointer ${
                theme === 'cognitive_slate'
                  ? 'bg-teal-600 hover:bg-teal-500'
                  : theme === 'sand_therapy'
                  ? 'bg-[#9C533A] hover:bg-[#854530]'
                  : 'bg-[#2D5A46] hover:bg-[#234937]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun</span>
            </button>

            {/* Grounding Exercise Trigger */}
            <button
              type="button"
              id="btn-nav-grounding"
              onClick={() => setShowGroundingModal(true)}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                theme === 'cognitive_slate'
                  ? 'bg-[#15222E] border-[#243547] text-teal-300 hover:bg-[#1C2C3D]'
                  : theme === 'sand_therapy'
                  ? 'bg-[#F4EDE2] border-[#E5DACD] text-[#8C4B34]'
                  : 'bg-[#F2F8F4] border-[#D6E4DA] text-[#2D5A46]'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Latihan Napas</span>
            </button>

            {/* Theme Selector Trigger */}
            <button
              type="button"
              id="btn-landing-theme-switcher"
              onClick={() => setShowThemeModal(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                theme === 'cognitive_slate'
                  ? 'bg-[#15222E] border-[#243547] text-neutral-200 hover:border-teal-500'
                  : theme === 'sand_therapy'
                  ? 'bg-[#FFFFFF] border-[#E8DED3] text-[#291E19] hover:border-[#9C533A]'
                  : 'bg-[#FFFFFF] border-[#DCE5DE] text-[#162A20] hover:border-[#2D5A46]'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[#2D5A46] dark:text-teal-400" />
              <span className="hidden sm:inline">{currentOption.name}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Focused Authentication Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold ${
                theme === 'cognitive_slate'
                  ? 'bg-teal-500/10 border border-teal-500/30 text-teal-300'
                  : theme === 'sand_therapy'
                  ? 'bg-[#9C533A]/10 border border-[#9C533A]/25 text-[#9C533A]'
                  : 'bg-[#2D5A46]/10 border border-[#2D5A46]/25 text-[#2D5A46]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Kerahasiaan Klinis & Data Terisolasi 100% Privat</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight font-serif">
              Ruang hening untuk merefleksikan pikiran, mengurai emosi, dan menemukan kejernihan.
            </h1>

            <p className="text-sm sm:text-base leading-relaxed opacity-80 font-sans">
              Didukung oleh kerangka psikologi kognitif (CBT), teknik pertanyaan Sokrates, dan kecerdasan AI Gemini 3.6 Flash. Setiap lembar refleksi dan sesi dialog psikologis tersimpan aman secara privat.
            </p>

            {/* 3 Pillars of Psychological Support */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div
                className={`p-4 rounded-xl border space-y-1.5 transition-colors ${
                  theme === 'cognitive_slate'
                    ? 'bg-[#121B24] border-[#1F2D3D]'
                    : theme === 'sand_therapy'
                    ? 'bg-[#FAF6F0] border-[#E8DED3]'
                    : 'bg-[#FFFFFF] border-[#E2EAE4]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold font-serif text-[#2D5A46] dark:text-teal-400">
                  <Shield className="w-4 h-4" />
                  <span>Ruang Aman</span>
                </div>
                <p className="text-xs opacity-75 leading-relaxed">
                  Data Firestore terisolasi per pengguna secara ketat dan terenkripsi.
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border space-y-1.5 transition-colors ${
                  theme === 'cognitive_slate'
                    ? 'bg-[#121B24] border-[#1F2D3D]'
                    : theme === 'sand_therapy'
                    ? 'bg-[#FAF6F0] border-[#E8DED3]'
                    : 'bg-[#FFFFFF] border-[#E2EAE4]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold font-serif text-[#2D5A46] dark:text-teal-400">
                  <Bot className="w-4 h-4" />
                  <span>Konselor AI CBT</span>
                </div>
                <p className="text-xs opacity-75 leading-relaxed">
                  Dialog empati multi-turn, pengurai distorsi kognitif, dan ringkasan klinis.
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border space-y-1.5 transition-colors ${
                  theme === 'cognitive_slate'
                    ? 'bg-[#121B24] border-[#1F2D3D]'
                    : theme === 'sand_therapy'
                    ? 'bg-[#FAF6F0] border-[#E8DED3]'
                    : 'bg-[#FFFFFF] border-[#E2EAE4]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold font-serif text-[#2D5A46] dark:text-teal-400">
                  <Palette className="w-4 h-4" />
                  <span>3 Tema Terapeutik</span>
                </div>
                <p className="text-xs opacity-75 leading-relaxed">
                  Botanical Sage, Cognitive Slate, dan Warm Sand Therapy yang menenangkan.
                </p>
              </div>
            </div>
          </div>

          {/* Right Main Focus Auth Card: Only Google & Try Without Login */}
          <div className="lg:col-span-5">
            <div
              className={`rounded-2xl border p-6 sm:p-8 shadow-xl relative overflow-hidden transition-colors ${
                theme === 'cognitive_slate'
                  ? 'bg-[#121B24] border-[#1F2D3D]'
                  : theme === 'sand_therapy'
                  ? 'bg-[#FFFFFF] border-[#E8DED3]'
                  : 'bg-[#FFFFFF] border-[#DCE5DE]'
              }`}
            >
              <div className="space-y-5 relative">
                
                <div className="space-y-1.5 text-center sm:text-left">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium mb-1 ${
                      theme === 'cognitive_slate'
                        ? 'bg-teal-500/15 text-teal-300'
                        : theme === 'sand_therapy'
                        ? 'bg-[#9C533A]/10 text-[#9C533A]'
                        : 'bg-[#2D5A46]/10 text-[#2D5A46]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Akses Cepat & Instan</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif">
                    Mulai Sesi Refleksi Anda
                  </h2>
                  <p className="text-xs sm:text-sm opacity-75 leading-relaxed font-sans">
                    Pilih masuk dengan Google untuk menyimpan secara otomatis, atau coba langsung tanpa login.
                  </p>
                </div>

                {authError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{authError}</span>
                  </div>
                )}

                {/* Primary Action 1: Google Login */}
                <div className="space-y-3 pt-1">
                  <button
                    id="btn-sign-in-google"
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loadingGoogle || loadingDemo}
                    className="w-full py-3.5 px-4 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 hover:border-neutral-400 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-sm hover:shadow-md cursor-pointer group"
                  >
                    {loadingGoogle ? (
                      <span className="inline-block w-4 h-4 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Login dengan Google</span>
                  </button>

                  <div className="relative flex items-center justify-center my-2">
                    <div className="border-t border-inherit w-full opacity-30"></div>
                    <span
                      className={`px-3 text-[11px] font-sans opacity-60 ${
                        theme === 'cognitive_slate' ? 'bg-[#121B24]' : 'bg-[#FFFFFF]'
                      }`}
                    >
                      atau
                    </span>
                  </div>

                  {/* Primary Action 2: Coba Tanpa Login */}
                  <button
                    id="btn-sign-in-demo"
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={loadingGoogle || loadingDemo}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 border transition-all disabled:opacity-50 cursor-pointer shadow-xs hover:shadow-md ${
                      theme === 'cognitive_slate'
                        ? 'bg-[#182533] hover:bg-[#1E2E40] border-[#243547] text-teal-300'
                        : theme === 'sand_therapy'
                        ? 'bg-[#F4EDE2] hover:bg-[#EBE2D5] border-[#E2D6C7] text-[#8C4B34]'
                        : 'bg-[#F2F8F4] hover:bg-[#E5EFE8] border-[#D6E4DA] text-[#2D5A46]'
                    }`}
                  >
                    {loadingDemo ? (
                      <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <Smile className="w-4 h-4" />
                    )}
                    <span>Coba Tanpa Login (Sesi Mandiri)</span>
                  </button>
                </div>

                {/* Subtext info about Email Register in Navbar */}
                <div className="pt-3 border-t border-inherit text-center space-y-2">
                  <p className="text-xs opacity-75">
                    Ingin mendaftar atau masuk dengan email?
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={openRegisterModal}
                      className="text-xs font-semibold text-[#2D5A46] dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Daftar Akun Baru</span>
                    </button>
                    <span className="opacity-40">•</span>
                    <button
                      type="button"
                      onClick={openLoginEmailModal}
                      className="text-xs font-semibold opacity-80 hover:opacity-100 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Masuk Email</span>
                    </button>
                  </div>
                </div>

                {/* Security Guarantee Note */}
                <div className="pt-2 border-t border-inherit opacity-70 space-y-1.5 font-sans">
                  <div className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Keamanan Firestore: data tersimpan privat per pengguna</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Kunci API Gemini diamankan di sisi server</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer
        className={`border-t px-6 py-4 text-center text-xs opacity-70 transition-colors ${
          theme === 'cognitive_slate'
            ? 'bg-[#0E1620] border-[#1F2D3D]'
            : theme === 'sand_therapy'
            ? 'bg-[#FAF6F0] border-[#E8DED3]'
            : 'bg-[#FFFFFF] border-[#DCE5DE]'
        }`}
      >
        Klinik Refleksi & Terapi Pikiran • Didukung Firebase Auth, Firestore, dan Arsitektur AI Gemini 3.6 Flash
      </footer>

      {/* Modals */}
      <EmailAuthModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        initialMode={emailModalMode}
      />

      <ThemeSelectorModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />

      <MindfulGroundingModal
        isOpen={showGroundingModal}
        onClose={() => setShowGroundingModal(false)}
      />
    </div>
  );
};

