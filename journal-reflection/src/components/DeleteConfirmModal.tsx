import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  entryTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  entryTitle,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="modal-delete-confirm-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        id="modal-delete-confirm-content"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#121212] border border-[#2a2a2a] rounded-md shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 text-rose-400">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-sm">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Hapus Catatan Refleksi
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                Tindakan ini tidak dapat dibatalkan
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="p-1 hover:bg-[#1f1f1f] text-neutral-400 hover:text-white rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 bg-[#0a0a0a] border border-[#222] rounded-sm space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
            Judul Refleksi:
          </span>
          <p className="text-xs font-semibold text-neutral-200 line-clamp-2">
            "{entryTitle || 'Refleksi Tanpa Judul'}"
          </p>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Refleksi ini beserta seluruh riwayat percakapan AI Gemini dan ringkasan eksekutifnya akan dihapus permanen dari Cloud Firestore Anda.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#1f1f1f]">
          <button
            type="button"
            id="btn-cancel-delete"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-3.5 py-1.5 bg-[#1a1a1a] hover:bg-[#262626] text-neutral-300 border border-[#2e2e2e] rounded-sm text-xs font-mono transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            id="btn-confirm-delete"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-sm text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Menghapus...' : 'Hapus Sekarang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
