import React from 'react';
import { X, ShieldCheck, Lock, Database, CheckCircle2, Copy } from 'lucide-react';
import type { UserProfile } from '../types';

interface SecurityInspectorModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityInspectorModal: React.FC<SecurityInspectorModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const rulesContent = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Jalur terisolasi per pengguna: hanya UID terautentikasi yang memiliki akses
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-sm max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-blue-600/10 border border-blue-600/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Inspektor Isolasi Data Firestore
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                Arsitektur Keamanan Terikat Hak Milik (Owner-Bound)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 hover:bg-[#1a1a1a] rounded-sm text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Auth Identity & Path Details */}
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-[#141414] border border-[#262626] rounded-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">
                UID Pengguna Terautentikasi
              </span>
              <span className="px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[9px] font-bold">
                TOKEN AUTH TERVERIFIKASI
              </span>
            </div>
            <div className="font-mono text-neutral-200 bg-[#0a0a0a] p-2 rounded-sm border border-[#1f1f1f] select-all break-all">
              {user.uid}
            </div>
          </div>

          <div className="p-3 bg-[#141414] border border-[#262626] rounded-sm space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">
              Jalur Data Firestore Terisolasi
            </span>
            <div className="font-mono text-blue-300 bg-[#0a0a0a] p-2 rounded-sm border border-[#1f1f1f] select-all break-all">
              /users/{user.uid}/entries/*
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Semua refleksi jurnal, respons dialog AI, ringkasan, dan tag disimpan ketat di sub-koleksi ini. Akses dari UID lain diblokir langsung oleh aturan keamanan Firestore di tingkat basis data.
            </p>
          </div>

          {/* Active Security Rules Preview */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">
              Aturan Keamanan Aktif yang Diterapkan (firestore.rules)
            </span>
            <pre className="bg-[#0a0a0a] border border-[#222] p-3 rounded-sm text-[11px] font-mono text-neutral-300 overflow-x-auto">
              {rulesContent}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-[#222] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-sm text-xs font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Tutup Inspektor
          </button>
        </div>

      </div>
    </div>
  );
};
