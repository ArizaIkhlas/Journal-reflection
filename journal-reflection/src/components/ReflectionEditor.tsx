import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  Check,
  Bot,
  Lightbulb,
  FileText,
  Tag,
  Plus,
  X,
  Clock,
  Compass,
  Heart,
  Trash2,
  HelpCircle,
  Brain,
} from 'lucide-react';
import type { JournalEntry, JournalCategory, Mood, ReflectionInsight } from '../types';
import { usePsychoTheme } from '../context/ThemeContext';

interface ReflectionEditorProps {
  entry: JournalEntry;
  onUpdate: (updates: Partial<JournalEntry>) => Promise<void>;
  onTriggerReflection: (actionType: 'reflect' | 'summarize' | 'brainstorm') => void;
  onDelete?: () => void;
  isAiProcessing?: boolean;
}

const MOODS: Mood[] = [
  'Tenang',
  'Reflektif',
  'Bersyukur',
  'Terinspirasi',
  'Fokus',
  'Tertantang',
  'Cemas',
  'Kelelahan Mental',
];

const CATEGORIES: JournalCategory[] = [
  'Pemeriksaan Emosi & Terapi',
  'Pengembangan Diri',
  'Refleksi Sesi & Mindfulness',
  'Restrukturisasi Kognitif (CBT)',
  'Karier & Kerja Mendalam',
  'Brainstorming Ide',
  'Rasa Syukur Harian',
  'Filosofi & Kehidupan',
];

export const ReflectionEditor: React.FC<ReflectionEditorProps> = ({
  entry,
  onUpdate,
  onTriggerReflection,
  onDelete,
  isAiProcessing = false,
}) => {
  const { theme } = usePsychoTheme();
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [category, setCategory] = useState<JournalCategory>(entry.category);
  const [mood, setMood] = useState<Mood>(entry.mood);
  const [tags, setTags] = useState<string[]>(entry.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when active entry changes
  useEffect(() => {
    setTitle(entry.title);
    setContent(entry.content);
    setCategory(entry.category);
    setMood(entry.mood);
    setTags(entry.tags || []);
  }, [entry.id]);

  const handleManualSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await onUpdate({
        title,
        content,
        category,
        mood,
        tags,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      const updated = [...tags, trimmed];
      setTags(updated);
      setNewTagInput('');
      onUpdate({ tags: updated });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    onUpdate({ tags: updated });
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-y-auto transition-colors ${
        theme === 'cognitive_slate'
          ? 'bg-[#0E1620] text-[#F1F5F9]'
          : theme === 'sand_therapy'
          ? 'bg-[#FAF6F0] text-[#291E19]'
          : 'bg-[#F8FAF7] text-[#162A20]'
      }`}
    >
      
      {/* Editor Top Bar */}
      <div
        className={`p-4 sm:p-5 border-b space-y-4 transition-colors ${
          theme === 'cognitive_slate'
            ? 'bg-[#121B24] border-[#1F2D3D]'
            : theme === 'sand_therapy'
            ? 'bg-[#FFFFFF] border-[#E8DED3]'
            : 'bg-[#FFFFFF] border-[#DCE5DE]'
        }`}
      >
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Title Input */}
          <input
            id="input-reflection-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => onUpdate({ title })}
            placeholder="Tuliskan judul atau tema refleksi hari ini..."
            className="text-xl sm:text-2xl font-bold font-serif bg-transparent border-b border-transparent hover:border-inherit focus:border-current focus:outline-none transition-colors py-1 flex-1 leading-tight"
          />

          {/* Save & Delete Status / Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {savedSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Tersimpan di Firestore</span>
              </span>
            )}

            <button
              id="btn-save-reflection"
              onClick={handleManualSave}
              disabled={isSaving}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer disabled:opacity-50 ${
                theme === 'cognitive_slate'
                  ? 'bg-[#182635] border-[#243547] text-teal-300 hover:bg-[#1F3144]'
                  : theme === 'sand_therapy'
                  ? 'bg-[#F4EDE2] border-[#E5DACD] text-[#8C4B34] hover:bg-[#ECE3D6]'
                  : 'bg-[#F2F8F4] border-[#D6E4DA] text-[#2D5A46] hover:bg-[#E5EFE8]'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Lembar'}</span>
            </button>

            {onDelete && (
              <button
                id="btn-delete-reflection-editor"
                type="button"
                onClick={onDelete}
                title="Hapus lembar refleksi ini"
                className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            )}
          </div>
        </div>

        {/* Metadata Selectors: Category, Mood, Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          
          {/* Category Selector */}
          <div className="space-y-1">
            <label className="text-xs font-serif font-medium opacity-70">
              Fokus Refleksi & Terapi
            </label>
            <select
              id="select-reflection-category"
              value={category}
              onChange={(e) => {
                const newCat = e.target.value as JournalCategory;
                setCategory(newCat);
                onUpdate({ category: newCat });
              }}
              className={`w-full border text-xs rounded-lg py-1.5 px-2.5 focus:outline-none transition-colors ${
                theme === 'cognitive_slate'
                  ? 'bg-[#0E1620] border-[#243547] text-white focus:border-teal-500'
                  : 'bg-[#FBFDFB] border-[#DCE5DE] text-neutral-800 focus:border-[#2D5A46]'
              }`}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Mood Selector */}
          <div className="space-y-1">
            <label className="text-xs font-serif font-medium opacity-70">
              Kondisi Emosi Saat Ini
            </label>
            <select
              id="select-reflection-mood"
              value={mood}
              onChange={(e) => {
                const newMood = e.target.value as Mood;
                setMood(newMood);
                onUpdate({ mood: newMood });
              }}
              className={`w-full border text-xs rounded-lg py-1.5 px-2.5 focus:outline-none transition-colors ${
                theme === 'cognitive_slate'
                  ? 'bg-[#0E1620] border-[#243547] text-white focus:border-teal-500'
                  : 'bg-[#FBFDFB] border-[#DCE5DE] text-neutral-800 focus:border-[#2D5A46]'
              }`}
            >
              {MOODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Creator */}
          <div className="space-y-1 sm:col-span-2 md:col-span-1">
            <label className="text-xs font-serif font-medium opacity-70">
              Kata Kunci Refleksi (#)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="input-new-tag"
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="cth. mindfulness"
                className={`w-full border rounded-lg py-1.5 px-2.5 text-xs focus:outline-none transition-colors ${
                  theme === 'cognitive_slate'
                    ? 'bg-[#0E1620] border-[#243547] text-white focus:border-teal-500'
                    : 'bg-[#FBFDFB] border-[#DCE5DE] text-neutral-800 focus:border-[#2D5A46]'
                }`}
              />
              <button
                id="btn-add-tag"
                onClick={handleAddTag}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  theme === 'cognitive_slate'
                    ? 'bg-[#182635] border-[#243547] text-teal-300 hover:bg-[#1F3144]'
                    : 'bg-[#F2F8F4] border-[#D6E4DA] text-[#2D5A46] hover:bg-[#E5EFE8]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tag Pill List */}
        {tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-sans border ${
                  theme === 'cognitive_slate'
                    ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                    : theme === 'sand_therapy'
                    ? 'bg-[#9C533A]/10 text-[#9C533A] border-[#9C533A]/25'
                    : 'bg-[#2D5A46]/10 text-[#2D5A46] border-[#2D5A46]/25'
                }`}
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="opacity-70 hover:opacity-100 hover:text-rose-500 ml-0.5 cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* AI Psychologist Quick Actions Bar */}
      <div
        className={`px-4 sm:px-5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 transition-colors ${
          theme === 'cognitive_slate'
            ? 'bg-[#101822] border-[#1F2D3D]'
            : theme === 'sand_therapy'
            ? 'bg-[#F7EFE4] border-[#E8DED3]'
            : 'bg-[#F2F7F4] border-[#DCE5DE]'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-serif font-semibold">
          <Brain className="w-4 h-4 text-[#2D5A46] dark:text-teal-400" />
          <span>Panduan Psikolog AI (Gemini 3.7 Flash):</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-ai-reflect"
            onClick={() => onTriggerReflection('reflect')}
            disabled={isAiProcessing}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer disabled:opacity-50 ${
              theme === 'cognitive_slate'
                ? 'bg-teal-500/15 border-teal-500/30 text-teal-300 hover:bg-teal-500/25'
                : 'bg-white border-[#D6E4DA] text-[#2D5A46] hover:bg-[#E5EFE8]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#2D5A46] dark:text-teal-400" />
            <span>Pertanyaan Refleksi Sokrates</span>
          </button>

          <button
            id="btn-ai-brainstorm"
            onClick={() => onTriggerReflection('brainstorm')}
            disabled={isAiProcessing}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer disabled:opacity-50 ${
              theme === 'cognitive_slate'
                ? 'bg-[#15222E] border-[#243547] text-neutral-300 hover:bg-[#1C2C3D]'
                : 'bg-white border-[#E2EAE4] text-neutral-700 hover:bg-[#FAF8F5]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Uji Distorsi Kognitif (CBT)</span>
          </button>

          <button
            id="btn-ai-summarize"
            onClick={() => onTriggerReflection('summarize')}
            disabled={isAiProcessing || !content.trim()}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer disabled:opacity-50 ${
              theme === 'cognitive_slate'
                ? 'bg-[#15222E] border-[#243547] text-neutral-300 hover:bg-[#1C2C3D]'
                : 'bg-white border-[#E2EAE4] text-neutral-700 hover:bg-[#FAF8F5]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sintesis Sesi & Rencana Aksi</span>
          </button>
        </div>
      </div>

      {/* Main Journal Content Canvas */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col min-h-[300px]">
        <textarea
          id="textarea-journal-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={() => onUpdate({ content })}
          placeholder="Tuliskan pikiran, perasaan yang sedang dirasakan, situasi yang sedang dihadapi, atau wawasan pribadi... Apa yang terjadi hari ini? Pikiran otomatis apa yang muncul? Bagian tubuh mana yang merasakan ketegangan?"
          className="w-full flex-1 min-h-[260px] bg-transparent resize-none focus:outline-none text-base sm:text-lg leading-relaxed font-sans placeholder-neutral-400/70"
        />

        {/* Stats & Word Counter */}
        <div className="flex items-center justify-between text-xs opacity-65 pt-3 border-t border-inherit font-sans">
          <div className="flex items-center gap-3">
            <span>{wordCount} kata</span>
            <span>•</span>
            <span>{charCount} karakter</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Terakhir disimpan {new Date(entry.updatedAt).toLocaleTimeString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Structured AI Insight Display Card (If generated) */}
      {entry.aiInsight && (
        <div
          className={`m-4 sm:m-6 p-5 rounded-xl border space-y-4 shadow-sm ${
            theme === 'cognitive_slate'
              ? 'bg-[#121B24] border-[#1F2D3D]'
              : theme === 'sand_therapy'
              ? 'bg-[#FFFFFF] border-[#E8DED3]'
              : 'bg-[#FFFFFF] border-[#DCE5DE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2D5A46] dark:text-teal-400" />
              <h4 className="text-sm font-bold font-serif">
                Sintesis Klinis & Ringkasan Sesi Refleksi
              </h4>
            </div>
            <span className="text-[11px] opacity-60 font-sans">
              Analisis Psikolog Gemini 3.7 Flash
            </span>
          </div>

          <p
            className={`text-xs sm:text-sm leading-relaxed italic p-3.5 rounded-lg border ${
              theme === 'cognitive_slate'
                ? 'bg-[#0E1620] border-[#1F2D3D] text-neutral-200'
                : 'bg-[#F8FAF7] border-[#E2EAE4] text-neutral-800'
            }`}
          >
            "{entry.aiInsight.summary}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            {/* Key Takeaways */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#2D5A46] dark:text-teal-400 block font-serif">
                Pola Emosi & Wawasan Utama:
              </span>
              <ul className="space-y-1.5 opacity-90">
                {entry.aiInsight.keyTakeaways?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#2D5A46] dark:text-teal-400 font-bold">•</span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Items */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block font-serif">
                Langkah Regulasi & Tindakan Realistis:
              </span>
              <ul className="space-y-1.5 opacity-90">
                {entry.aiInsight.actionItems?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

