import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Firestore
} from 'firebase/firestore';
import type { JournalEntry, ChatMessage, ReflectionInsight, UserProfile } from '../types';
import firebaseAppConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseAppConfig.apiKey,
  authDomain: firebaseAppConfig.authDomain,
  projectId: firebaseAppConfig.projectId,
  storageBucket: firebaseAppConfig.storageBucket,
  messagingSenderId: firebaseAppConfig.messagingSenderId,
  appId: firebaseAppConfig.appId,
};

// Initialize Firebase App defensively
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use named Firestore database if configured, or default
export const db: Firestore = firebaseAppConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseAppConfig.firestoreDatabaseId)
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Local fallback demo user key for guaranteed demo session stability
const DEMO_STORAGE_KEY = 'gemini_reflection_demo_session';

// Reactive local subscriber registry for real-time local updates
type EntrySubscriber = (entries: JournalEntry[]) => void;
const localSubscribers: Map<string, Set<EntrySubscriber>> = new Map();

function notifyLocalSubscribers(userId: string) {
  const subs = localSubscribers.get(userId);
  if (subs && subs.size > 0) {
    const current = getLocalEntries(userId);
    subs.forEach((cb) => {
      try {
        cb(current);
      } catch (e) {
        console.error('Subscriber notification error:', e);
      }
    });
  }
}

// ==========================================
// AUTHENTICATION UTILITIES
// ==========================================

export async function loginWithGoogle(): Promise<User> {
  try {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      throw new Error('Popup masuk terblokir atau ditutup. Izinkan popup peramban atau gunakan Registrasi Akun / Sesi Demo.');
    }
    throw error;
  }
}

export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<User> {
  try {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    await setPersistence(auth, browserLocalPersistence);
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    
    if (displayName.trim()) {
      await updateProfile(result.user, {
        displayName: displayName.trim(),
      });
    }

    await syncUserProfile(result.user, false, displayName.trim());
    return result.user;
  } catch (error: any) {
    console.error('Registration Error:', error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email ini sudah terdaftar. Silakan masuk menggunakan kata sandi Anda.');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('Kata sandi terlalu pendek. Gunakan minimal 6 karakter.');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Format email tidak valid. Periksa kembali alamat email Anda.');
    }
    throw new Error(error.message || 'Gagal mendaftarkan akun baru.');
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  try {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    await syncUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    console.error('Login Error:', error);
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      throw new Error('Email atau kata sandi salah. Silakan coba lagi atau daftarkan akun baru.');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Format email tidak valid.');
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat.');
    }
    throw new Error(error.message || 'Gagal masuk dengan email & kata sandi.');
  }
}

let activeAuthCallback: ((user: UserProfile | null) => void) | null = null;

export async function loginAsDemoUser(): Promise<UserProfile> {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInAnonymously(auth);
    await syncUserProfile(result.user, true);
    await seedDemoEntriesIfEmpty(result.user.uid);
    localStorage.removeItem(DEMO_STORAGE_KEY);
    const profile: UserProfile = {
      uid: result.user.uid,
      email: null,
      displayName: 'Penjelajah Refleksi (Demo)',
      photoURL: null,
      isAnonymous: true,
    };
    return profile;
  } catch (error: any) {
    console.warn('Firebase Anonymous Auth fallback to resilient local session:', error);
    // If anonymous auth is not enabled in console or fails, provide guaranteed persistent demo session
    let storedDemo = localStorage.getItem(DEMO_STORAGE_KEY);
    let demoUid = storedDemo;
    if (!demoUid) {
      demoUid = 'demo_user_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem(DEMO_STORAGE_KEY, demoUid);
    }
    
    const demoProfile: UserProfile = {
      uid: demoUid,
      email: 'demo@gemini-refleksi.id',
      displayName: 'Penjelajah Refleksi (Demo Instan)',
      photoURL: null,
      isAnonymous: true,
    };

    if (activeAuthCallback) {
      activeAuthCallback(demoProfile);
    }
    
    // Seed sample starter data
    await seedDemoEntriesIfEmpty(demoUid);
    return demoProfile;
  }
}

export async function logout(): Promise<void> {
  localStorage.removeItem(DEMO_STORAGE_KEY);
  await signOut(auth);
  if (activeAuthCallback) {
    activeAuthCallback(null);
  }
}

export function subscribeToAuthState(callback: (user: UserProfile | null) => void) {
  activeAuthCallback = callback;

  // Check if we have an active resilient demo session in local storage
  const storedDemoUid = localStorage.getItem(DEMO_STORAGE_KEY);
  if (storedDemoUid && !auth.currentUser) {
    callback({
      uid: storedDemoUid,
      email: 'demo@gemini-refleksi.id',
      displayName: 'Penjelajah Refleksi (Demo Instan)',
      photoURL: null,
      isAnonymous: true,
    });
  }

  const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || (user.isAnonymous ? 'Penjelajah Refleksi (Demo)' : 'Penjelajah Jurnal'),
        photoURL: user.photoURL,
        isAnonymous: user.isAnonymous,
      });
    } else {
      const activeDemo = localStorage.getItem(DEMO_STORAGE_KEY);
      if (activeDemo) {
        callback({
          uid: activeDemo,
          email: 'demo@gemini-refleksi.id',
          displayName: 'Penjelajah Refleksi (Demo Instan)',
          photoURL: null,
          isAnonymous: true,
        });
      } else {
        callback(null);
      }
    }
  });

  return () => {
    unsubscribe();
    activeAuthCallback = null;
  };
}

async function syncUserProfile(user: User, isDemo = false, customDisplayName?: string) {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userDocRef);
    const now = new Date().toISOString();
    const name = customDisplayName || user.displayName || (isDemo ? 'Penjelajah Refleksi (Demo)' : 'Penjelajah Jurnal');
    
    if (!snapshot.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email || (isDemo ? 'demo@gemini-refleksi.id' : null),
        displayName: name,
        photoURL: user.photoURL || null,
        isAnonymous: user.isAnonymous || isDemo,
        createdAt: now,
        lastLoginAt: now,
      });
    } else {
      await updateDoc(userDocRef, {
        lastLoginAt: now,
        ...(customDisplayName ? { displayName: customDisplayName } : {}),
      });
    }
  } catch (err) {
    console.warn('Failed to sync user profile document:', err);
  }
}

// Starter seed entries for fresh demo sessions
export async function seedDemoEntriesIfEmpty(userId: string) {
  try {
    const local = getLocalEntries(userId);
    if (local && local.length > 0) return;

    const sample1: Partial<JournalEntry> = {
      title: 'Menyelaraskan Fokus & Produktivitas Minggu Ini',
      content: `Pagi ini saya menyempatkan waktu 15 menit untuk merefleksikan ritme kerja.
Saya menyadari ada beberapa distraksi yang membuat prioritas utama tertunda, terutama terlalu sering memeriksa notifikasi di pagi hari.

Target yang ingin dicapai:
1. Blok waktu 90 menit kerja mendalam (deep work) sebelum membuka media sosial.
2. Membagi tugas besar menjadi langkah mikro yang jelas.
3. Menjaga energi tetap stabil dengan istirahat teratur.`,
      category: 'Pengembangan Diri',
      mood: 'Reflektif',
      tags: ['Produktivitas', 'Deep Work', 'Fokus'],
      messages: [
        {
          id: 'msg_starter_1',
          role: 'user',
          content: 'Bantu saya menganalisis pola ini dan berikan 1 eksperimen praktis untuk menjaga fokus.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'msg_starter_2',
          role: 'model',
          content: `### 🪞 Analisis Refleksi Cerdas\n\nLangkah Anda menyadari pola distraksi di pagi hari adalah titik awal yang sangat baik. Kebiasaan reaktif di awal hari sering menguras *decision energy* sebelum tugas krusial dimulai.\n\n#### Rekomendasi Eksperimen Mikro 24 Jam:\n- **Protokol 60 Menit Pertama Bebas Layar**: Letakkan ponsel di ruangan berbeda saat bangun pagi hingga sesi fokus pertama Anda selesai.\n- **Tulis 1 Kemenangan Utama**: Sebelum mulai bekerja, tuliskan hanya 1 hal yang wajib diselesaikan hari ini.`,
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          modelUsed: 'gemini-3.6-flash',
        },
      ],
      aiInsight: {
        summary: 'Refleksi mendalam mengenai eliminasi distraksi pagi hari dan penerapan kerja terfokus (deep work) dengan target harian yang terukur.',
        keyTakeaways: [
          'Distraksi pagi hari secara signifikan menurunkan cadangan energi fokus.',
          'Pemisahan tegas antara waktu kerja mendalam dan komunikasi meningkatkan kualitas eksekusi.',
        ],
        actionItems: [
          'Terapkan blok 90 menit deep work tanpa notifikasi setiap pagi.',
          'Evaluasi hasil fokus pada sore hari untuk perbaikan ritme harian.',
        ],
        detectedThemes: ['Fokus', 'Disiplin Waktu', 'Pengembangan Diri'],
        generatedAt: new Date().toISOString(),
      },
    };

    const sample2: Partial<JournalEntry> = {
      title: 'Eksplorasi Ide Proyek Cerdas Baru',
      content: `Saya sedang mempertimbangkan konsep aplikasi asisten berbasis kecerdasan buatan yang berfokus pada ketenangan pikiran pengguna. Bukan sekadar alat pencatat, tetapi partner dialog yang mampu membantu merumuskan keputusan strategis secara bijak.`,
      category: 'Brainstorming Ide',
      mood: 'Terinspirasi',
      tags: ['Inovasi', 'Kreativitas', 'Ide'],
      messages: [],
    };

    await saveJournalEntry(userId, sample1);
    await saveJournalEntry(userId, sample2);
  } catch (err) {
    console.warn('Seed demo entries skipped or local fallback:', err);
  }
}

// ==========================================
// USER-ISOLATED FIRESTORE UTILITIES
// Collection Path: /users/{userId}/entries/{entryId}
// Strict isolation enforced via firestore.rules
// ==========================================

export function stripUndefinedValues<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return (obj === undefined ? null : obj) as T;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((v) => v !== undefined)
      .map((v) => stripUndefinedValues(v)) as unknown as T;
  }
  if (typeof obj === 'object' && obj !== null) {
    if (obj instanceof Date || obj instanceof RegExp) {
      return obj;
    }
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        clean[key] = stripUndefinedValues(value);
      }
    }
    return clean as T;
  }
  return obj;
}

// Local fallback storage helpers for demo sessions
function getLocalEntries(userId: string): JournalEntry[] {
  try {
    const raw = localStorage.getItem(`entries_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalEntries(userId: string, list: JournalEntry[]) {
  try {
    localStorage.setItem(`entries_${userId}`, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export async function saveJournalEntry(
  userId: string,
  entry: Partial<JournalEntry>
): Promise<string> {
  if (!userId) throw new Error('User ID is required for saving entries.');

  const now = new Date().toISOString();
  const entryId = entry.id || 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const payload: JournalEntry = {
    id: entryId,
    userId,
    title: entry.title?.trim() || 'Refleksi Baru',
    content: entry.content || '',
    category: entry.category || 'Pengembangan Diri',
    mood: entry.mood || 'Reflektif',
    tags: entry.tags || [],
    messages: entry.messages || [],
    aiInsight: entry.aiInsight || undefined,
    createdAt: entry.createdAt || now,
    updatedAt: now,
    isFavorite: entry.isFavorite ?? false,
  };

  const sanitized = stripUndefinedValues(payload);

  // 1. Immediately mirror to local store
  const localList = getLocalEntries(userId);
  const existingIdx = localList.findIndex((e) => e.id === entryId);
  if (existingIdx >= 0) {
    localList[existingIdx] = { ...localList[existingIdx], ...sanitized };
  } else {
    localList.unshift(sanitized);
  }
  setLocalEntries(userId, localList);
  notifyLocalSubscribers(userId);

  // 2. Persist to Firestore if user is authenticated
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const entryRef = doc(db, 'users', userId, 'entries', entryId);
      await setDoc(entryRef, sanitized, { merge: true });
    } catch (err) {
      console.warn('Firestore setDoc failed, safely stored in local session:', err);
    }
  }

  return entryId;
}

export async function updateJournalEntry(
  userId: string,
  entryId: string,
  updates: Partial<JournalEntry>
): Promise<void> {
  if (!userId || !entryId) throw new Error('User ID and Entry ID are required.');
  const sanitized = stripUndefinedValues({
    ...updates,
    updatedAt: new Date().toISOString(),
  });

  // 1. Immediately update local store
  const localList = getLocalEntries(userId);
  const idx = localList.findIndex((e) => e.id === entryId);
  if (idx >= 0) {
    localList[idx] = { ...localList[idx], ...sanitized };
    setLocalEntries(userId, localList);
    notifyLocalSubscribers(userId);
  }

  // 2. Persist to Firestore if authenticated
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const entryRef = doc(db, 'users', userId, 'entries', entryId);
      await updateDoc(entryRef, sanitized);
    } catch (err) {
      console.warn('Firestore updateDoc failed, safely stored in local session:', err);
    }
  }
}

export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  if (!userId || !entryId) throw new Error('User ID and Entry ID are required.');
  
  // 1. Immediately delete from local store
  const localList = getLocalEntries(userId).filter((e) => e.id !== entryId);
  setLocalEntries(userId, localList);
  notifyLocalSubscribers(userId);

  // 2. Delete from Firestore if authenticated
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const entryRef = doc(db, 'users', userId, 'entries', entryId);
      await deleteDoc(entryRef);
    } catch (err) {
      console.warn('Firestore deleteDoc failed, safely removed from local session:', err);
    }
  }
}

export function subscribeUserEntries(
  userId: string,
  onUpdate: (entries: JournalEntry[]) => void,
  onError?: (err: Error) => void
) {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  // 1. Register to reactive local subscribers map
  if (!localSubscribers.has(userId)) {
    localSubscribers.set(userId, new Set());
  }
  localSubscribers.get(userId)!.add(onUpdate);

  // 2. Send current local cache immediately for zero latency
  const initialLocal = getLocalEntries(userId);
  onUpdate(initialLocal);

  // 3. Connect to Firestore snapshot if authenticated in Firebase
  let unsubscribeFirestore: (() => void) | null = null;
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const entriesRef = collection(db, 'users', userId, 'entries');
      const q = query(entriesRef, orderBy('createdAt', 'desc'));

      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          const items: JournalEntry[] = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data() as JournalEntry);
          });
          if (items.length > 0) {
            setLocalEntries(userId, items);
            notifyLocalSubscribers(userId);
          }
        },
        (err) => {
          console.warn('Firestore snapshot subscription warning (using local store):', err);
          if (onError) onError(err);
        }
      );
    } catch (err: any) {
      console.warn('Firestore query setup warning:', err);
    }
  }

  return () => {
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
    const subs = localSubscribers.get(userId);
    if (subs) {
      subs.delete(onUpdate);
      if (subs.size === 0) {
        localSubscribers.delete(userId);
      }
    }
  };
}

export async function appendMessageToEntry(
  userId: string,
  entryId: string,
  message: ChatMessage
): Promise<void> {
  if (!userId || !entryId) return;
  
  // 1. Immediately append to local store
  const localList = getLocalEntries(userId);
  const idx = localList.findIndex((e) => e.id === entryId);
  if (idx >= 0) {
    const msgs = [...(localList[idx].messages || []), message];
    localList[idx].messages = msgs;
    localList[idx].updatedAt = new Date().toISOString();
    setLocalEntries(userId, localList);
    notifyLocalSubscribers(userId);
  }

  // 2. Persist to Firestore if authenticated
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const entryRef = doc(db, 'users', userId, 'entries', entryId);
      const snap = await getDoc(entryRef);
      if (snap.exists()) {
        const existing = snap.data() as JournalEntry;
        const messages = [...(existing.messages || []), message];
        await updateDoc(entryRef, {
          messages: stripUndefinedValues(messages),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Firestore appendMessage failed, stored in local session:', err);
    }
  }
}
