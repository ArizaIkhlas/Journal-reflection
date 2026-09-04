import React, { useState, useEffect } from 'react';
import { Sparkles, X, Wind, Heart, Smile, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import { usePsychoTheme } from '../context/ThemeContext';

interface MindfulGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MindfulGroundingModal: React.FC<MindfulGroundingModalProps> = ({ isOpen, onClose }) => {
  const { theme } = usePsychoTheme();
  const [exercise, setExercise] = useState<'breathing' | 'grounding'>('breathing');
  
  // Breathing state
  const [phase, setPhase] = useState<'Tarik Napas (Inhale)' | 'Tahan (Hold)' | 'Hembuskan (Exhale)' | 'Istirahat (Rest)'>('Tarik Napas (Inhale)');
  const [countdown, setCountdown] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(true);

  useEffect(() => {
    if (!isOpen || !isBreathingActive || exercise !== 'breathing') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (phase === 'Tarik Napas (Inhale)') {
            setPhase('Tahan (Hold)');
            return 4;
          } else if (phase === 'Tahan (Hold)') {
            setPhase('Hembuskan (Exhale)');
            return 4;
          } else if (phase === 'Hembuskan (Exhale)') {
            setPhase('Istirahat (Rest)');
            return 2;
          } else {
            setPhase('Tarik Napas (Inhale)');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isBreathingActive, phase, exercise]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden transition-colors ${
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
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold font-serif">
                Regulasi Emosi & Grounding Klinis
              </h3>
              <p
                className={`text-xs ${
                  theme === 'cognitive_slate' ? 'text-neutral-400' : 'text-neutral-500'
                }`}
              >
                Latihan somatik untuk menurunkan ketegangan sistem saraf
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

        {/* Tab Selector */}
        <div className="flex border-b border-inherit px-5 pt-3 gap-3">
          <button
            type="button"
            onClick={() => setExercise('breathing')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              exercise === 'breathing'
                ? theme === 'cognitive_slate'
                  ? 'border-teal-400 text-teal-400'
                  : theme === 'sand_therapy'
                  ? 'border-[#9C533A] text-[#9C533A]'
                  : 'border-[#2D5A46] text-[#2D5A46]'
                : 'border-transparent text-neutral-400 hover:text-neutral-600'
            }`}
          >
            Latihan Napas Kotak (Box Breathing 4x4)
          </button>
          <button
            type="button"
            onClick={() => setExercise('grounding')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              exercise === 'grounding'
                ? theme === 'cognitive_slate'
                  ? 'border-teal-400 text-teal-400'
                  : theme === 'sand_therapy'
                  ? 'border-[#9C533A] text-[#9C533A]'
                  : 'border-[#2D5A46] text-[#2D5A46]'
                : 'border-transparent text-neutral-400 hover:text-neutral-600'
            }`}
          >
            Teknik Grounding 5-4-3-2-1
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {exercise === 'breathing' ? (
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              {/* Animated Pulsing Ring */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                    phase === 'Tarik Napas (Inhale)'
                      ? 'scale-110 opacity-70 bg-emerald-500/20'
                      : phase === 'Tahan (Hold)'
                      ? 'scale-105 opacity-50 bg-blue-500/20'
                      : phase === 'Hembuskan (Exhale)'
                      ? 'scale-90 opacity-30 bg-amber-500/20'
                      : 'scale-85 opacity-20 bg-neutral-500/20'
                  }`}
                />
                <div
                  className={`w-36 h-36 rounded-full border-2 flex flex-col items-center justify-center shadow-lg transition-all duration-700 ${
                    theme === 'cognitive_slate'
                      ? 'bg-[#182431] border-teal-500/40 text-teal-300'
                      : theme === 'sand_therapy'
                      ? 'bg-[#FAF4EC] border-[#9C533A]/40 text-[#9C533A]'
                      : 'bg-[#F2F8F4] border-[#2D5A46]/40 text-[#2D5A46]'
                  }`}
                >
                  <span className="text-3xl font-bold font-mono">{countdown}</span>
                  <span className="text-xs font-serif mt-1 px-2 font-medium">
                    {phase}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 max-w-sm">
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Tarik napas perlahan melalui hidung (4 detik), tahan napas dengan rileks (4 detik), hembuskan perlahan melalui bibir (4 detik).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsBreathingActive(!isBreathingActive)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                  isBreathingActive
                    ? 'border-neutral-300 bg-transparent text-neutral-500 hover:text-neutral-700'
                    : 'bg-[#2D5A46] text-white border-transparent'
                }`}
              >
                {isBreathingActive ? 'Jeda Latihan' : 'Mulai Kembali'}
              </button>
            </div>
          ) : (
            <div className="space-y-3.5 text-xs leading-relaxed">
              <p
                className={`p-3 rounded-lg border ${
                  theme === 'cognitive_slate'
                    ? 'bg-[#0E161F] border-[#1F2D3D] text-neutral-300'
                    : 'bg-[#F4F8F5] border-[#E4ECE6] text-neutral-700'
                }`}
              >
                Teknik 5-4-3-2-1 membantu mengarahkan kesadaran kembali ke saat ini ketika pikiran sedang cemas atau berputar-putar (*rumination*):
              </p>

              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    5
                  </span>
                  <span><strong>Lihat 5 benda</strong> di sekitar Anda (warna, bentuk, atau teksturnya).</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    4
                  </span>
                  <span><strong>Rasakan 4 sentuhan fisik</strong> (kaki menyentuh lantai, baju di kulit, atau meja).</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span><strong>Dengarkan 3 suara</strong> di sekitar Anda (angin, ketikan, atau desau ruangan).</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-500/15 text-purple-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span><strong>Kenali 2 aroma</strong> yang dapat Anda cium saat ini.</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-500/15 text-rose-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span><strong>Sadari 1 rasa</strong> di lidah Anda atau ucapkan 1 hal positif untuk diri sendiri.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t text-xs flex items-center justify-end ${
            theme === 'cognitive_slate'
              ? 'border-[#1F2D3D] bg-[#0E161F]'
              : theme === 'sand_therapy'
              ? 'border-[#E8DED3] bg-[#F4EDE2]'
              : 'border-[#E6EEE8] bg-[#F4F8F5]'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer ${
              theme === 'cognitive_slate'
                ? 'bg-teal-600 hover:bg-teal-500'
                : theme === 'sand_therapy'
                ? 'bg-[#9C533A] hover:bg-[#83442E]'
                : 'bg-[#2D5A46] hover:bg-[#234737]'
            }`}
          >
            Selesai & Lanjutkan Refleksi
          </button>
        </div>
      </div>
    </div>
  );
};
