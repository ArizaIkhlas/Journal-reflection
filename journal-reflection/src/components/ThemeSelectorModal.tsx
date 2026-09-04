import React from 'react';
import { Sparkles, Check, X, Palette, HeartHandshake, Moon, Sun, Leaf } from 'lucide-react';
import { usePsychoTheme, THEME_OPTIONS } from '../context/ThemeContext';
import type { PsychoTheme } from '../types';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = usePsychoTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-xl border shadow-2xl overflow-hidden transition-colors ${
          theme === 'cognitive_slate'
            ? 'bg-[#121B24] border-[#223344] text-[#F1F5F9]'
            : theme === 'sand_therapy'
            ? 'bg-[#FAF6F0] border-[#E8DED3] text-[#291E19]'
            : 'bg-[#FFFFFF] border-[#DCE5DE] text-[#162A20]'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            theme === 'cognitive_slate'
              ? 'border-[#1F2D3D] bg-[#0E161F]'
              : theme === 'sand_therapy'
              ? 'border-[#E8DED3] bg-[#F4EDE2]'
              : 'border-[#E6EEE8] bg-[#F4F8F5]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                theme === 'cognitive_slate'
                  ? 'bg-teal-500/20 text-teal-400'
                  : theme === 'sand_therapy'
                  ? 'bg-[#9C533A]/15 text-[#9C533A]'
                  : 'bg-[#2D5A46]/15 text-[#2D5A46]'
              }`}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold font-serif">
                Pilih Nuansa Terapi & Ruang Refleksi
              </h3>
              <p
                className={`text-xs ${
                  theme === 'cognitive_slate'
                    ? 'text-neutral-400'
                    : 'text-neutral-500'
                }`}
              >
                Pilih suasana visual psikolog yang paling menenangkan pikiran Anda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === 'cognitive_slate'
                ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
                : 'hover:bg-neutral-200/70 text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="p-5 space-y-3.5">
          {THEME_OPTIONS.map((opt) => {
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                id={`btn-select-theme-${opt.id}`}
                onClick={() => {
                  setTheme(opt.id);
                }}
                className={`w-full p-4 rounded-xl border text-left flex items-start gap-4 transition-all cursor-pointer relative ${
                  isSelected
                    ? opt.id === 'cognitive_slate'
                      ? 'bg-[#182533] border-teal-500 shadow-md ring-2 ring-teal-500/20'
                      : opt.id === 'sand_therapy'
                      ? 'bg-[#FFF9F2] border-[#9C533A] shadow-md ring-2 ring-[#9C533A]/20'
                      : 'bg-[#F2F7F4] border-[#2D5A46] shadow-md ring-2 ring-[#2D5A46]/20'
                    : opt.id === 'cognitive_slate'
                    ? 'bg-[#0F1720] border-[#1F2D3D] hover:border-neutral-600'
                    : opt.id === 'sand_therapy'
                    ? 'bg-[#F4EEE5] border-[#E8DED3] hover:border-neutral-400'
                    : 'bg-[#FAFCFA] border-[#E2EAE4] hover:border-[#2D5A46]/40'
                }`}
              >
                {/* Visual Palette Orb */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-xs border"
                  style={{
                    backgroundColor: opt.bgColor,
                    borderColor: opt.primaryColor,
                    color: opt.primaryColor,
                  }}
                >
                  {opt.id === 'sage_botanical' && <Leaf className="w-5 h-5" />}
                  {opt.id === 'cognitive_slate' && <Moon className="w-5 h-5" />}
                  {opt.id === 'sand_therapy' && <Sun className="w-5 h-5" />}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                        opt.id === 'cognitive_slate'
                          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                          : opt.id === 'sand_therapy'
                          ? 'bg-[#9C533A]/10 text-[#9C533A] border border-[#9C533A]/20'
                          : 'bg-[#2D5A46]/10 text-[#2D5A46] border border-[#2D5A46]/20'
                      }`}
                    >
                      {opt.badge}
                    </span>
                    <h4 className="text-sm font-bold font-serif">{opt.name}</h4>
                  </div>
                  <p
                    className={`text-xs mt-1 leading-snug ${
                      theme === 'cognitive_slate' ? 'text-neutral-300' : 'text-neutral-600'
                    }`}
                  >
                    {opt.tagline}
                  </p>

                  {/* Character notes */}
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-neutral-400 font-sans">
                    {opt.id === 'sage_botanical' && (
                      <span>🌿 Sentuhan botanis, tenang untuk dekompresi mental & stres</span>
                    )}
                    {opt.id === 'cognitive_slate' && (
                      <span>🌌 Mode malam terapeutik untuk refleksi mendalam & shadow-work</span>
                    )}
                    {opt.id === 'sand_therapy' && (
                      <span>☕ Nuansa linen hangat, empatik & humanistik tanpa penghakiman</span>
                    )}
                  </div>
                </div>

                {/* Checkmark indicator */}
                {isSelected && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: opt.primaryColor,
                      color: opt.id === 'cognitive_slate' ? '#0B1118' : '#FFFFFF',
                    }}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t text-xs flex items-center justify-between ${
            theme === 'cognitive_slate'
              ? 'border-[#1F2D3D] bg-[#0E161F] text-neutral-400'
              : theme === 'sand_therapy'
              ? 'border-[#E8DED3] bg-[#F4EDE2] text-neutral-600'
              : 'border-[#E6EEE8] bg-[#F4F8F5] text-neutral-600'
          }`}
        >
          <div className="flex items-center gap-1.5 font-sans">
            <HeartHandshake className="w-4 h-4 text-[#2D5A46]" />
            <span>Pilihan tema disimpan otomatis di peramban Anda.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              theme === 'cognitive_slate'
                ? 'bg-teal-600 hover:bg-teal-500 text-white'
                : theme === 'sand_therapy'
                ? 'bg-[#9C533A] hover:bg-[#83442E] text-white'
                : 'bg-[#2D5A46] hover:bg-[#234737] text-white'
            }`}
          >
            Terapkan Tema
          </button>
        </div>
      </div>
    </div>
  );
};
