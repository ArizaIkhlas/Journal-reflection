import React, { useState } from 'react';
import { Plus, Search, BookOpen, Trash2, Tag, MessageSquare, Sparkles, Heart } from 'lucide-react';
import type { JournalEntry, JournalCategory, Mood } from '../types';
import { usePsychoTheme } from '../context/ThemeContext';

interface JournalSidebarProps {
  entries: JournalEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
  onDeleteEntry: (entry: JournalEntry) => void;
  onToggleFavorite?: (entryId: string, isFav: boolean) => void;
  loading?: boolean;
}

const CATEGORIES: Array<JournalCategory | 'Semua'> = [
  'Semua',
  'Pemeriksaan Emosi & Terapi',
  'Pengembangan Diri',
  'Refleksi Sesi & Mindfulness',
  'Restrukturisasi Kognitif (CBT)',
  'Karier & Kerja Mendalam',
  'Brainstorming Ide',
  'Rasa Syukur Harian',
  'Filosofi & Kehidupan',
];

export const JournalSidebar: React.FC<JournalSidebarProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  onNewEntry,
  onDeleteEntry,
  loading = false,
}) => {
  const { theme } = usePsychoTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      (entry.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.tags || []).some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'Semua' ||
      entry.category === selectedCategory ||
      (selectedCategory === 'Pemeriksaan Emosi & Terapi' && (entry.category === 'Emotional Check-in' || entry.category === 'Pemeriksaan Emosi')) ||
      (selectedCategory === 'Pengembangan Diri' && entry.category === 'Personal Growth') ||
      (selectedCategory === 'Karier & Kerja Mendalam' && entry.category === 'Deep Work & Career') ||
      (selectedCategory === 'Brainstorming Ide' && entry.category === 'Idea Brainstorming') ||
      (selectedCategory === 'Rasa Syukur Harian' && entry.category === 'Daily Gratitude') ||
      (selectedCategory === 'Filosofi & Kehidupan' && entry.category === 'Philosophy & Life');

    return matchesSearch && matchesCategory;
  });

  const handleDelete = (e: React.MouseEvent, entry: JournalEntry) => {
    e.stopPropagation();
    onDeleteEntry(entry);
  };

  const getMoodBadgeColor = (mood: Mood) => {
    switch (mood) {
      case 'Inspired':
      case 'Terinspirasi':
      case 'Bersemangat':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/25';
      case 'Calm':
      case 'Tenang':
      case 'Grateful':
      case 'Bersyukur':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25';
      case 'Focused':
      case 'Reflective':
      case 'Fokus':
      case 'Reflektif':
        return 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25';
      case 'Challenged':
      case 'Tertantang':
        return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25';
      case 'Anxious':
      case 'Cemas':
      case 'Kelelahan Mental':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/25';
      default:
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700';
    }
  };

  return (
    <aside
      className={`w-full md:w-80 lg:w-96 flex flex-col h-full border-r transition-colors ${
        theme === 'cognitive_slate'
          ? 'bg-[#0B1118] border-[#1F2D3D] text-[#F1F5F9]'
          : theme === 'sand_therapy'
          ? 'bg-[#FAF6F0] border-[#E8DED3] text-[#291E19]'
          : 'bg-[#F8FAF7] border-[#DCE5DE] text-[#162A20]'
      }`}
    >
      
      {/* Sidebar Header & New Entry CTA */}
      <div
        className={`p-4 border-b space-y-3 ${
          theme === 'cognitive_slate'
            ? 'border-[#1F2D3D] bg-[#0E1620]'
            : theme === 'sand_therapy'
            ? 'border-[#E8DED3] bg-[#F4EDE2]'
            : 'border-[#DCE5DE] bg-[#FFFFFF]'
        }`}
      >
        <button
          id="btn-new-reflection"
          onClick={onNewEntry}
          className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer text-white ${
            theme === 'cognitive_slate'
              ? 'bg-teal-600 hover:bg-teal-500'
              : theme === 'sand_therapy'
              ? 'bg-[#9C533A] hover:bg-[#83442E]'
              : 'bg-[#2D5A46] hover:bg-[#234737]'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Mulai Lembar Refleksi Baru</span>
        </button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-reflections"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari catatan, emosi, wawasan..."
            className={`w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs focus:outline-none transition-colors ${
              theme === 'cognitive_slate'
                ? 'bg-[#15222E] border-[#243547] text-neutral-200 placeholder-neutral-500 focus:border-teal-500'
                : 'bg-[#FFFFFF] border-[#DCE5DE] text-neutral-800 placeholder-neutral-400 focus:border-[#2D5A46]'
            }`}
          />
        </div>

        {/* Category Pill Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === cat
                  ? theme === 'cognitive_slate'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-semibold'
                    : theme === 'sand_therapy'
                    ? 'bg-[#9C533A]/15 text-[#9C533A] border-[#9C533A]/30 font-semibold'
                    : 'bg-[#2D5A46]/15 text-[#2D5A46] border-[#2D5A46]/30 font-semibold'
                  : theme === 'cognitive_slate'
                  ? 'bg-[#15222E] text-neutral-400 border-[#243547] hover:text-white'
                  : 'bg-[#FFFFFF] text-neutral-600 border-[#E2EAE4] hover:text-neutral-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Entry History List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {loading ? (
          <div className="p-8 text-center text-xs opacity-60 space-y-2">
            <div className="inline-block w-5 h-5 border-2 border-[#2D5A46] dark:border-teal-400 border-t-transparent rounded-full animate-spin"></div>
            <p>Memuat lembar refleksi...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-xs opacity-60 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto opacity-40 stroke-1" />
            <p className="font-serif text-sm font-semibold">Belum Ada Catatan Refleksi</p>
            <p className="text-[11px] leading-relaxed">
              {entries.length === 0
                ? 'Klik tombol di atas untuk mulai menulis refleksi atau berdialog dengan pendamping AI.'
                : 'Tidak ada refleksi yang cocok dengan filter pencarian Anda.'}
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isSelected = selectedEntryId === entry.id;
            const formattedDate = new Date(entry.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const messageCount = entry.messages?.length || 0;

            return (
              <div
                key={entry.id}
                id={`sidebar-entry-${entry.id}`}
                onClick={() => onSelectEntry(entry)}
                className={`p-3.5 rounded-xl transition-all text-left cursor-pointer group relative border ${
                  isSelected
                    ? theme === 'cognitive_slate'
                      ? 'bg-[#182635] border-teal-500/50 shadow-xs'
                      : theme === 'sand_therapy'
                      ? 'bg-[#FFF9F2] border-[#9C533A]/50 shadow-xs'
                      : 'bg-[#FFFFFF] border-[#2D5A46]/50 shadow-xs ring-1 ring-[#2D5A46]/20'
                    : theme === 'cognitive_slate'
                    ? 'bg-[#121B24] border-[#1F2D3D] hover:border-neutral-600'
                    : theme === 'sand_therapy'
                    ? 'bg-[#FFFFFF]/70 border-[#E8DED3] hover:border-[#9C533A]/30'
                    : 'bg-[#FFFFFF]/80 border-[#E2EAE4] hover:border-[#2D5A46]/30'
                }`}
              >
                {/* Title & Date */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif font-semibold text-xs truncate flex-1 leading-tight">
                    {entry.title || 'Refleksi Tanpa Judul'}
                  </h3>
                  <span className="text-[10px] opacity-60 shrink-0 font-sans">
                    {formattedDate}
                  </span>
                </div>

                {/* Content Snippet */}
                <p className="text-xs opacity-75 line-clamp-2 mt-1.5 leading-relaxed font-sans">
                  {entry.content || (entry.aiInsight?.summary ? entry.aiInsight.summary : 'Lembar refleksi masih kosong...')}
                </p>

                {/* Metadata Chips & Actions */}
                <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-inherit opacity-90">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getMoodBadgeColor(entry.mood)}`}>
                      {entry.mood}
                    </span>
                    <span className="text-[10px] opacity-60 font-sans truncate max-w-[120px]">
                      {entry.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {messageCount > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-[#2D5A46] dark:text-teal-400 font-medium" title={`${messageCount} dialog konseling`}>
                        <MessageSquare className="w-3 h-3" />
                        <span>{messageCount}</span>
                      </span>
                    )}

                    {entry.aiInsight && (
                      <span className="text-amber-500" title="Sintesis & Rencana Aksi Tersedia">
                        <Sparkles className="w-3 h-3" />
                      </span>
                    )}

                    {/* Delete button */}
                    <button
                      id={`btn-delete-entry-${entry.id}`}
                      type="button"
                      onClick={(e) => handleDelete(e, entry)}
                      className="p-1 text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer opacity-60 group-hover:opacity-100"
                      title="Hapus lembar refleksi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer */}
      <div
        className={`p-3 border-t text-[11px] flex items-center justify-between opacity-60 ${
          theme === 'cognitive_slate'
            ? 'border-[#1F2D3D] bg-[#0E1620]'
            : theme === 'sand_therapy'
            ? 'border-[#E8DED3] bg-[#F4EDE2]'
            : 'border-[#DCE5DE] bg-[#FFFFFF]'
        }`}
      >
        <span className="flex items-center gap-1 font-serif">
          <Heart className="w-3.5 h-3.5 text-[#2D5A46] dark:text-teal-400" />
          Koleksi Privat
        </span>
        <span className="text-[10px] font-mono">Firestore Terenkripsi</span>
      </div>
    </aside>
  );
};

