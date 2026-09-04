import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Brain, Heart, ShieldCheck, Trash2, AlertCircle, X, Check } from 'lucide-react';
import Markdown from 'react-markdown';
import type { ChatMessage } from '../types';
import { usePsychoTheme } from '../context/ThemeContext';

interface MultiTurnConversationProps {
  messages: ChatMessage[];
  onSendMessage: (promptText: string) => Promise<void>;
  onClearChat?: () => Promise<void> | void;
  isLoading: boolean;
  entryTitle: string;
}

const SUGGESTED_PROMPTS = [
  'Aku lagi sering ngerasa cemas dan overthinking, gimana menurutmu?',
  'Bantu aku cari sudut pandang lain (reframing) dari apa yang lagi aku alamin dong.',
  'Aku ngerasa capek banget secara mental dan burnout belakangan ini.',
  'Bisa bantu bedah apa yang bikin aku suka ragu sama kemampuanku sendiri?',
];

export const MultiTurnConversation: React.FC<MultiTurnConversationProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  entryTitle,
}) => {
  const { theme } = usePsychoTheme();
  const [inputText, setInputText] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText('');
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectSuggestion = (prompt: string) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  const handleExecuteClear = async () => {
    if (!onClearChat || isClearing) return;
    setIsClearing(true);
    try {
      await onClearChat();
      setShowClearConfirm(false);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div
      className={`w-full lg:w-[420px] xl:w-[460px] flex flex-col h-full border-t lg:border-t-0 lg:border-l transition-colors relative ${
        theme === 'cognitive_slate'
          ? 'bg-[#0B1118] border-[#1F2D3D] text-[#F1F5F9]'
          : theme === 'sand_therapy'
          ? 'bg-[#FAF6F0] border-[#E8DED3] text-[#291E19]'
          : 'bg-[#F8FAF7] border-[#DCE5DE] text-[#162A20]'
      }`}
    >
      
      {/* Chat Header */}
      <div
        className={`p-3.5 border-b flex items-center justify-between transition-colors ${
          theme === 'cognitive_slate'
            ? 'bg-[#0E1620] border-[#1F2D3D]'
            : theme === 'sand_therapy'
            ? 'bg-[#FFFFFF] border-[#E8DED3]'
            : 'bg-[#FFFFFF] border-[#DCE5DE]'
        }`}
      >
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
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-serif">
              Konselor Refleksi (Gemini AI)
            </h3>
            <p className="text-[10px] opacity-65 font-sans">
              Pendekatan Adaptif, Hangat & Kasual
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Clear Chat Button */}
          {onClearChat && messages.length > 0 && (
            <button
              id="btn-clear-chat"
              onClick={() => setShowClearConfirm(true)}
              disabled={isLoading || isClearing}
              className={`p-1.5 rounded-lg border text-[11px] transition-all flex items-center gap-1 font-sans cursor-pointer ${
                theme === 'cognitive_slate'
                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
              }`}
              title="Bersihkan riwayat percakapan pada lembar ini"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">Hapus Chat</span>
            </button>
          )}

          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-sans ${
              theme === 'cognitive_slate'
                ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            Sesi Privat
          </span>
        </div>
      </div>

      {/* Clear Chat Inline Confirmation Box */}
      {showClearConfirm && (
        <div
          className={`p-3 border-b flex items-center justify-between text-xs transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
            theme === 'cognitive_slate'
              ? 'bg-[#181E26] border-red-500/30 text-neutral-200'
              : 'bg-red-50/90 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-[11px] font-medium leading-tight">
              Hapus seluruh riwayat percakapan lembar ini?
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="btn-cancel-clear-chat"
              onClick={() => setShowClearConfirm(false)}
              disabled={isClearing}
              className="px-2.5 py-1 rounded-md text-[11px] font-sans border bg-white/50 hover:bg-white text-neutral-700 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-confirm-clear-chat"
              onClick={handleExecuteClear}
              disabled={isClearing}
              className="px-2.5 py-1 rounded-md text-[11px] font-sans bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isClearing ? (
                <span>Menghapus...</span>
              ) : (
                <>
                  <Trash2 className="w-3 h-3" />
                  <span>Ya, Hapus</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center ${
                theme === 'cognitive_slate'
                  ? 'bg-teal-500/15 text-teal-300'
                  : theme === 'sand_therapy'
                  ? 'bg-[#9C533A]/10 text-[#9C533A]'
                  : 'bg-[#2D5A46]/10 text-[#2D5A46]'
              }`}
            >
              <Heart className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold font-serif">
                Ruang Obrolan: "{entryTitle || 'Sesi Hari Ini'}"
              </p>
              <p className="text-xs opacity-70 leading-relaxed max-w-xs font-sans">
                Konselormu siap mendengarkan dengan hangat, memvalidasi perasaanmu, dan bantu cari sudut pandang baru dengan santai.
              </p>
            </div>

            {/* Quick Prompt Starters */}
            <div className="w-full space-y-1.5 pt-2 text-left">
              <span className="text-[11px] font-serif font-medium opacity-60 block text-center">
                Pilih Pemantik Diskusi Psikologis:
              </span>
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(prompt)}
                  disabled={isLoading}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer disabled:opacity-50 font-sans ${
                    theme === 'cognitive_slate'
                      ? 'bg-[#121B24] hover:bg-[#182635] border-[#1F2D3D] text-neutral-200 hover:text-white'
                      : theme === 'sand_therapy'
                      ? 'bg-[#FFFFFF] hover:bg-[#F4EDE2] border-[#E8DED3] text-[#4A3B32]'
                      : 'bg-[#FFFFFF] hover:bg-[#F2F8F4] border-[#DCE5DE] text-neutral-800'
                  }`}
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col space-y-1.5 ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] opacity-60 px-1 font-sans">
                {msg.role === 'user' ? (
                  <>
                    <span>Anda</span>
                    <User className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-[#2D5A46] dark:text-teal-400" />
                    <span className="font-serif">Konselor AI</span>
                  </>
                )}
                <span>•</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[92%] border shadow-xs ${
                  msg.role === 'user'
                    ? theme === 'cognitive_slate'
                      ? 'bg-teal-600 text-white border-teal-500'
                      : theme === 'sand_therapy'
                      ? 'bg-[#9C533A] text-white border-[#87442E]'
                      : 'bg-[#2D5A46] text-white border-[#234737]'
                    : theme === 'cognitive_slate'
                    ? 'bg-[#121B24] border-[#1F2D3D] text-[#E2E8F0]'
                    : theme === 'sand_therapy'
                    ? 'bg-[#FFFFFF] border-[#E8DED3] text-[#291E19]'
                    : 'bg-[#FFFFFF] border-[#DCE5DE] text-[#162A20]'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                ) : (
                  <div className="markdown-body font-sans text-xs sm:text-sm space-y-2 leading-relaxed">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex flex-col items-start space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] opacity-60 px-1 font-sans">
              <Bot className="w-3 h-3 text-[#2D5A46] dark:text-teal-400 animate-spin" />
              <span>Menelaah pemikiran Anda dengan penuh empati...</span>
            </div>
            <div
              className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
                theme === 'cognitive_slate'
                  ? 'bg-[#121B24] border-[#1F2D3D] text-neutral-300'
                  : 'bg-white border-[#DCE5DE] text-neutral-700'
              }`}
            >
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-[#2D5A46] dark:bg-teal-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-[#2D5A46] dark:bg-teal-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-[#2D5A46] dark:bg-teal-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[11px] font-sans">Merumuskan respons reflektif</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Box */}
      <div
        className={`p-3.5 border-t space-y-2 transition-colors ${
          theme === 'cognitive_slate'
            ? 'bg-[#0E1620] border-[#1F2D3D]'
            : theme === 'sand_therapy'
            ? 'bg-[#FFFFFF] border-[#E8DED3]'
            : 'bg-[#FFFFFF] border-[#DCE5DE]'
        }`}
      >
        <div className="relative">
          <textarea
            id="textarea-chat-prompt"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ceritakan apa yang lagi kamu rasakan atau tanyakan apa pun dengan santai..."
            rows={2}
            className={`w-full border rounded-xl p-3 pr-10 text-xs sm:text-sm focus:outline-none resize-none transition-colors ${
              theme === 'cognitive_slate'
                ? 'bg-[#15222E] border-[#243547] text-white placeholder-neutral-500 focus:border-teal-500'
                : 'bg-[#FAFDFB] border-[#DCE5DE] text-neutral-800 placeholder-neutral-400 focus:border-[#2D5A46]'
            }`}
          />

          <button
            id="btn-send-chat-message"
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={`absolute right-2.5 bottom-3.5 p-2 rounded-lg text-white transition-all disabled:opacity-30 cursor-pointer ${
              theme === 'cognitive_slate'
                ? 'bg-teal-600 hover:bg-teal-500'
                : theme === 'sand_therapy'
                ? 'bg-[#9C533A] hover:bg-[#85442E]'
                : 'bg-[#2D5A46] hover:bg-[#234737]'
            }`}
            title="Kirim (Enter)"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] opacity-60 px-1 font-sans">
          <span>Shift+Enter untuk baris baru</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#2D5A46] dark:text-teal-400" />
            Privasi Terjaga
          </span>
        </div>
      </div>

    </div>
  );
};

