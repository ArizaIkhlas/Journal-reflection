import React, { useState } from 'react';
import {
  Sparkles,
  LogOut,
  Shield,
  Palette,
  Wind,
  Heart,
  ChevronDown,
} from 'lucide-react';
import type { UserProfile } from '../types';
import { logout } from '../lib/firebase';
import { usePsychoTheme } from '../context/ThemeContext';
import { ThemeSelectorModal } from './ThemeSelectorModal';
import { MindfulGroundingModal } from './MindfulGroundingModal';

interface DashboardNavbarProps {
  user: UserProfile;
  entryCount: number;
  onOpenSecurityModal: () => void;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  user,
  entryCount,
  onOpenSecurityModal,
}) => {
  const { theme, currentOption } = usePsychoTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showGroundingModal, setShowGroundingModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      <header
        className={`px-4 sm:px-6 py-3 sticky top-0 z-30 border-b transition-colors ${
          theme === 'cognitive_slate'
            ? 'bg-[#0E1620] border-[#1F2D3D] text-[#F1F5F9]'
            : theme === 'sand_therapy'
            ? 'bg-[#FAF6F0] border-[#E8DED3] text-[#291E19]'
            : 'bg-[#FFFFFF] border-[#DCE5DE] text-[#162A20]'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Brand & Counseling Workspace Title */}
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-serif font-bold text-sm shadow-xs ${
                theme === 'cognitive_slate'
                  ? 'bg-teal-600 text-white'
                  : theme === 'sand_therapy'
                  ? 'bg-[#9C533A] text-white'
                  : 'bg-[#2D5A46] text-white'
              }`}
            >
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight font-serif">
                  Klinik Refleksi & Terapi Pikiran
                </h1>
                <span
                  className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-medium ${
                    theme === 'cognitive_slate'
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                      : theme === 'sand_therapy'
                      ? 'bg-[#9C533A]/10 text-[#9C533A] border border-[#9C533A]/20'
                      : 'bg-[#2D5A46]/10 text-[#2D5A46] border border-[#2D5A46]/20'
                  }`}
                >
                  Pendamping Psikologis AI
                </span>
              </div>
              <div
                className={`flex items-center gap-2 text-[11px] font-sans ${
                  theme === 'cognitive_slate' ? 'text-neutral-400' : 'text-neutral-500'
                }`}
              >
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Ruang Privat Terisolasi
                </span>
                <span className="text-neutral-400">•</span>
                <span>{entryCount} Lembar Refleksi</span>
              </div>
            </div>
          </div>

          {/* Controls: Theme Selector, Grounding Tool, Security & User Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Grounding Exercise Trigger */}
            <button
              id="btn-open-grounding-modal"
              type="button"
              onClick={() => setShowGroundingModal(true)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                theme === 'cognitive_slate'
                  ? 'bg-[#15222E] border-[#243547] text-teal-300 hover:bg-[#1C2C3D]'
                  : theme === 'sand_therapy'
                  ? 'bg-[#F4EDE2] border-[#E5DACD] text-[#8C4B34] hover:bg-[#ECE3D6]'
                  : 'bg-[#F2F8F4] border-[#D6E4DA] text-[#2D5A46] hover:bg-[#E5EFE8]'
              }`}
              title="Latihan Napas Kotak & Teknik Grounding 5-4-3-2-1"
            >
              <Wind className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Regulasi Emosi</span>
            </button>

            {/* Theme Selector Trigger */}
            <button
              id="btn-open-theme-selector"
              type="button"
              onClick={() => setShowThemeModal(true)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                theme === 'cognitive_slate'
                  ? 'bg-[#15222E] border-[#243547] text-neutral-200 hover:border-teal-500/50'
                  : theme === 'sand_therapy'
                  ? 'bg-[#FFFFFF] border-[#E8DED3] text-[#291E19] hover:border-[#9C533A]/50'
                  : 'bg-[#FFFFFF] border-[#DCE5DE] text-[#162A20] hover:border-[#2D5A46]/50'
              }`}
              title="Ganti Tema UI Psikologi (3 Pilihan)"
            >
              <Palette className="w-3.5 h-3.5 text-[#2D5A46] dark:text-teal-400" />
              <span className="hidden sm:inline">{currentOption.name}</span>
              <span className="text-[10px] opacity-70 px-1 py-0.2 rounded bg-neutral-200/50 dark:bg-neutral-700/50">
                {currentOption.badge}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Security Inspector */}
            <button
              id="btn-open-security-inspector"
              onClick={onOpenSecurityModal}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-sans flex items-center gap-1.5 border transition-colors cursor-pointer ${
                theme === 'cognitive_slate'
                  ? 'bg-[#15222E] border-[#243547] text-neutral-300 hover:text-white'
                  : 'bg-[#FFFFFF] border-[#DCE5DE] text-neutral-600 hover:text-neutral-900'
              }`}
              title="Periksa Keamanan Firestore & Isolasi Ruang Pribadi"
            >
              <Shield className="w-3.5 h-3.5 opacity-70" />
              <span className="hidden lg:inline">Keamanan Data</span>
            </button>

            {/* User Profile Pill */}
            <div
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${
                theme === 'cognitive_slate'
                  ? 'bg-[#121B24] border-[#1F2D3D]'
                  : 'bg-[#F9FBF9] border-[#E2EAE4]'
              }`}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Pengguna'}
                  className="w-5 h-5 rounded-full object-cover border border-neutral-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    theme === 'cognitive_slate'
                      ? 'bg-teal-500/20 text-teal-300'
                      : 'bg-[#2D5A46]/20 text-[#2D5A46]'
                  }`}
                >
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden xl:block text-left">
                <div className="text-xs font-medium truncate max-w-[110px]">
                  {user.displayName || 'Klien Refleksi'}
                </div>
                <div className="text-[9px] text-neutral-400 truncate max-w-[110px]">
                  {user.isAnonymous ? 'Sesi Mandiri' : user.email || user.uid.substring(0, 6)}
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              id="btn-sign-out"
              onClick={handleLogout}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs flex items-center gap-1.5 border transition-colors cursor-pointer ${
                theme === 'cognitive_slate'
                  ? 'border-[#243547] bg-[#15222E] text-neutral-400 hover:text-rose-300 hover:border-rose-900/50'
                  : 'border-[#DCE5DE] bg-white text-neutral-500 hover:text-rose-600 hover:border-rose-300'
              }`}
              title="Keluar dari sesi"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>

          </div>
        </div>
      </header>

      {/* Modals */}
      <ThemeSelectorModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />

      <MindfulGroundingModal
        isOpen={showGroundingModal}
        onClose={() => setShowGroundingModal(false)}
      />
    </>
  );
};

