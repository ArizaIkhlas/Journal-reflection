import React, { useState, useEffect } from 'react';
import { AuthLanding } from './components/AuthLanding';
import { DashboardNavbar } from './components/DashboardNavbar';
import { JournalSidebar } from './components/JournalSidebar';
import { ReflectionEditor } from './components/ReflectionEditor';
import { MultiTurnConversation } from './components/MultiTurnConversation';
import { SecurityInspectorModal } from './components/SecurityInspectorModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { usePsychoTheme } from './context/ThemeContext';
import {
  subscribeToAuthState,
  subscribeUserEntries,
  saveJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  appendMessageToEntry,
} from './lib/firebase';
import type { UserProfile, JournalEntry, ChatMessage, ReflectionInsight } from './types';
import { AlertCircle, CheckCircle2, Sparkles, BookOpen, Heart, Feather } from 'lucide-react';

export default function App() {
  const { theme } = usePsychoTheme();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [entryPendingDelete, setEntryPendingDelete] = useState<JournalEntry | null>(null);
  const [isDeletingEntry, setIsDeletingEntry] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Subscribe to Firebase Auth State
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuthState((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Subscribe to user-isolated Firestore entries when user is authenticated
  useEffect(() => {
    if (!user) {
      setEntries([]);
      setSelectedEntryId(null);
      return;
    }

    setEntriesLoading(true);
    const unsubscribeEntries = subscribeUserEntries(
      user.uid,
      (fetchedEntries) => {
        setEntries(fetchedEntries);
        setEntriesLoading(false);

        // If no entry selected or selected entry was deleted, select first available or initialize new
        setSelectedEntryId((prevId) => {
          if (prevId && fetchedEntries.some((e) => e.id === prevId)) {
            return prevId;
          }
          return fetchedEntries.length > 0 ? fetchedEntries[0].id : null;
        });
      },
      (err) => {
        console.error('Entries subscription error:', err);
        setEntriesLoading(false);
        showToast('error', 'Gagal menyinkronkan dengan Firestore. Periksa koneksi dan aturan keamanan.');
      }
    );

    return () => unsubscribeEntries();
  }, [user?.uid]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 3. Current active entry
  const activeEntry = entries.find((e) => e.id === selectedEntryId) || null;

  // 4. Create New Reflection in Firestore
  const handleCreateNewEntry = async () => {
    if (!user) return;
    try {
      const newEntryId = await saveJournalEntry(user.uid, {
        title: 'Lembar Refleksi Sesi Baru',
        content: '',
        category: 'Pemeriksaan Emosi & Terapi',
        mood: 'Tenang',
        tags: ['mindfulness'],
        messages: [],
      });
      setSelectedEntryId(newEntryId);
      showToast('success', 'Lembar refleksi baru berhasil dibuka.');
    } catch (err: any) {
      console.error('Error creating entry:', err);
      showToast('error', err.message || 'Gagal membuat catatan refleksi.');
    }
  };

  // 5. Update Active Entry in Firestore
  const handleUpdateActiveEntry = async (updates: Partial<JournalEntry>) => {
    if (!user || !selectedEntryId) return;
    try {
      await updateJournalEntry(user.uid, selectedEntryId, updates);
    } catch (err: any) {
      console.error('Error updating entry:', err);
      showToast('error', err.message || 'Gagal memperbarui catatan refleksi.');
    }
  };

  // 6. Delete Entry Handlers with Modal Confirmation
  const handleRequestDelete = (entry: JournalEntry) => {
    setEntryPendingDelete(entry);
  };

  const handleConfirmDelete = async () => {
    if (!user || !entryPendingDelete) return;
    setIsDeletingEntry(true);
    const deletingId = entryPendingDelete.id;
    try {
      await deleteJournalEntry(user.uid, deletingId);
      setEntryPendingDelete(null);
      showToast('success', 'Lembar refleksi berhasil dihapus.');

      // Gracefully switch to remaining entry or null
      setSelectedEntryId((prevId) => {
        if (prevId === deletingId) {
          const remaining = entries.filter((e) => e.id !== deletingId);
          return remaining.length > 0 ? remaining[0].id : null;
        }
        return prevId;
      });
    } catch (err: any) {
      console.error('Error deleting entry:', err);
      showToast('error', err.message || 'Gagal menghapus catatan refleksi.');
    } finally {
      setIsDeletingEntry(false);
    }
  };

  // 7. Send Multi-Turn Message to Gemini 3.6 Flash
  const handleSendMessage = async (promptText: string) => {
    if (!user) return;

    // Ensure we have an active entry
    let targetEntry = activeEntry;
    let targetId = selectedEntryId;

    if (!targetEntry || !targetId) {
      targetId = await saveJournalEntry(user.uid, {
        title: promptText.slice(0, 30) + '...',
        content: '',
        category: 'Pemeriksaan Emosi & Terapi',
        mood: 'Tenang',
      });
      setSelectedEntryId(targetId);
      targetEntry = {
        id: targetId,
        userId: user.uid,
        title: promptText.slice(0, 30) + '...',
        content: '',
        category: 'Pemeriksaan Emosi & Terapi',
        mood: 'Tenang',
        tags: [],
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now() + '_user',
      role: 'user',
      content: promptText,
      timestamp: new Date().toISOString(),
    };

    // Save user message in Firestore immediately
    await appendMessageToEntry(user.uid, targetId, userMessage);

    setIsAiProcessing(true);
    try {
      const response = await fetch('/api/gemini/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: targetEntry.title,
          journalContent: targetEntry.content,
          category: targetEntry.category,
          mood: targetEntry.mood,
          messages: [...(targetEntry.messages || []), userMessage],
          userPrompt: promptText,
        }),
      });

      if (!response.ok) {
        throw new Error(`Kesalahan Gemini API (${response.status})`);
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: 'msg_' + Date.now() + '_ai',
        role: 'model',
        content: data.reply || 'Saya telah merefleksikan pemikiran Anda dengan penuh empati.',
        timestamp: new Date().toISOString(),
        modelUsed: data.modelUsed || 'gemini-3.1-flash-lite',
      };

      // Save AI message in Firestore
      await appendMessageToEntry(user.uid, targetId, aiMessage);
    } catch (err: any) {
      console.error('Chat error:', err);
      showToast('error', err.message || 'Permintaan refleksi Gemini gagal.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // 7.1 Clear Conversation on Active Entry
  const handleClearChat = async () => {
    if (!user || !activeEntry) return;
    try {
      await updateJournalEntry(user.uid, activeEntry.id, {
        messages: [],
      });
      showToast('success', 'Riwayat percakapan lembar ini berhasil dibersihkan.');
    } catch (err: any) {
      console.error('Clear chat error:', err);
      showToast('error', err.message || 'Gagal membersihkan riwayat percakapan.');
    }
  };

  // 8. AI Quick Action (Reflect, Summarize, Brainstorm)
  const handleTriggerReflectionAction = async (actionType: 'reflect' | 'summarize' | 'brainstorm') => {
    if (!user || !activeEntry) return;

    setIsAiProcessing(true);
    try {
      if (actionType === 'summarize') {
        const response = await fetch('/api/gemini/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: activeEntry.title,
            journalContent: activeEntry.content,
            category: activeEntry.category,
            mood: activeEntry.mood,
          }),
        });

        if (!response.ok) throw new Error('Pembuatan ringkasan gagal');
        const data = await response.json();
        
        await updateJournalEntry(user.uid, activeEntry.id, {
          aiInsight: data.insight as ReflectionInsight,
        });

        showToast('success', 'Sintesis sesi klinis berhasil disimpan ke Firestore.');
      } else if (actionType === 'brainstorm') {
        const response = await fetch('/api/gemini/brainstorm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: activeEntry.title,
            journalContent: activeEntry.content,
            focusTopic: 'Restrukturisasi Kognitif (CBT) & Eksplorasi Pola Pikir Alternatif',
          }),
        });

        if (!response.ok) throw new Error('Analisis CBT gagal');
        const data = await response.json();

        const aiMessage: ChatMessage = {
          id: 'msg_' + Date.now() + '_ai',
          role: 'model',
          content: `### 🌿 Sudut Pandang Restrukturisasi Kognitif:\n\n${data.ideas}`,
          timestamp: new Date().toISOString(),
          modelUsed: data.modelUsed || 'gemini-3.1-flash-lite',
        };

        await appendMessageToEntry(user.uid, activeEntry.id, aiMessage);
        showToast('success', 'Analisis kognitif berhasil dirumuskan.');
      } else {
        // Deep reflection trigger
        await handleSendMessage(
          'Mohon berikan pertanyaan reflektif ala konseling psikologi atas catatan saya di atas. Bantu saya melihat sudut pandang yang lebih seimbang.'
        );
      }
    } catch (err: any) {
      console.error('Reflection action error:', err);
      showToast('error', err.message || 'Aksi gagal dijalankan.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Initial Auth Loading Spinner
  if (authLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center font-sans ${
          theme === 'cognitive_slate'
            ? 'bg-[#0B1118] text-[#F1F5F9]'
            : theme === 'sand_therapy'
            ? 'bg-[#FAF6F0] text-[#291E19]'
            : 'bg-[#F8FAF7] text-[#162A20]'
        }`}
      >
        <div className="text-center space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-[#2D5A46] dark:border-teal-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs opacity-70 font-serif">Menyiapkan Ruang Refleksi Tenang...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show the landing & sign-in view
  if (!user) {
    return <AuthLanding />;
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        theme === 'cognitive_slate'
          ? 'bg-[#0B1118] text-[#F1F5F9]'
          : theme === 'sand_therapy'
          ? 'bg-[#FAF6F0] text-[#291E19]'
          : 'bg-[#F8FAF7] text-[#162A20]'
      }`}
    >
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-fade-in">
          <div
            className={`px-4 py-3 rounded-xl border text-xs font-sans flex items-center gap-2 shadow-lg ${
              toastMessage.type === 'success'
                ? 'bg-[#FFFFFF] dark:bg-[#15222E] border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-[#FFFFFF] dark:bg-[#15222E] border-rose-500/40 text-rose-700 dark:text-rose-300'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Top Navigation Header */}
      <DashboardNavbar
        user={user}
        entryCount={entries.length}
        onOpenSecurityModal={() => setShowSecurityModal(true)}
      />

      {/* Main Multi-Pane Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-61px)]">
        
        {/* Left Pane: Entry History & Filter List */}
        <JournalSidebar
          entries={entries}
          selectedEntryId={selectedEntryId}
          onSelectEntry={(entry) => setSelectedEntryId(entry.id)}
          onNewEntry={handleCreateNewEntry}
          onDeleteEntry={handleRequestDelete}
          loading={entriesLoading}
        />

        {/* Center & Right Panes */}
        {activeEntry ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* Center: Reflection & Journal Editor */}
            <ReflectionEditor
              entry={activeEntry}
              onUpdate={handleUpdateActiveEntry}
              onTriggerReflection={handleTriggerReflectionAction}
              onDelete={() => handleRequestDelete(activeEntry)}
              isAiProcessing={isAiProcessing}
            />

            {/* Right: Multi-Turn Gemini Dialogue */}
            <MultiTurnConversation
              messages={activeEntry.messages || []}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              isLoading={isAiProcessing}
              entryTitle={activeEntry.title}
            />

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div className="max-w-md space-y-4">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                  theme === 'cognitive_slate'
                    ? 'bg-teal-500/15 text-teal-300'
                    : theme === 'sand_therapy'
                    ? 'bg-[#9C533A]/10 text-[#9C533A]'
                    : 'bg-[#2D5A46]/10 text-[#2D5A46]'
                }`}
              >
                <Feather className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold font-serif">
                  Selamat Datang di Ruang Refleksi, {user.displayName || 'Sahabat'}
                </h3>
                <p className="text-xs opacity-75 leading-relaxed font-sans">
                  Ruang tenang untuk mencatat pemikiran, mengevaluasi perasaan, dan memproses hari Anda secara sadar dan terlindungi.
                </p>
              </div>

              <button
                id="btn-create-first-reflection"
                onClick={handleCreateNewEntry}
                className={`py-2.5 px-6 rounded-xl text-xs font-semibold text-white transition-all inline-flex items-center gap-2 cursor-pointer shadow-md ${
                  theme === 'cognitive_slate'
                    ? 'bg-teal-600 hover:bg-teal-500'
                    : theme === 'sand_therapy'
                    ? 'bg-[#9C533A] hover:bg-[#83442E]'
                    : 'bg-[#2D5A46] hover:bg-[#234737]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Mulai Lembar Refleksi Pertama</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Security Inspector Modal */}
      <SecurityInspectorModal
        user={user}
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!entryPendingDelete}
        entryTitle={entryPendingDelete?.title || ''}
        isDeleting={isDeletingEntry}
        onConfirm={handleConfirmDelete}
        onCancel={() => setEntryPendingDelete(null)}
      />

    </div>
  );
}

