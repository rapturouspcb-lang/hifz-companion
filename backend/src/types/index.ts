// Core Quran Types

export interface Surah {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu: string;
  revelationType: 'Meccan' | 'Medinan';
  ayahCount: number;
  pageStart: number;
  pageEnd: number;
  juzList: number[];
}

export interface Ayah {
  id: number; // Global ayah number (1-6236)
  surahId: number;
  ayahNumber: number; // Ayah number within surah
  pageNumber: number;
  juzNumber: number;
  hizbNumber: number;
  textArabic: string;
  textArabicSimple: string; // Without diacritics
  textUrdu: string | null;
  textEnglish: string | null;
  wordCount: number;
}

export interface Mutashabih {
  id: number;
  ayahId1: number;
  ayahId2: number;
  similarityScore: number;
  similarityType: 'exact_repeat' | 'near_repeat' | 'thematic' | 'structural';
  diffData: AyahDiff | null;
}

export interface AyahDiff {
  words1: string[];
  words2: string[];
  diff: DiffItem[];
}

export interface DiffItem {
  type: 'equal' | 'add' | 'remove' | 'change';
  value: string;
  index1?: number;
  index2?: number;
}

// Reciter Types

export interface Reciter {
  id: string;
  nameEnglish: string;
  nameArabic: string;
  style: string;
  audioBaseUrl: string;
}

export const RECITERS: Reciter[] = [
  {
    id: 'abdul_basit_murattal',
    nameEnglish: 'Abdul Basit Abdul Samad',
    nameArabic: 'عبد الباسط عبد الصمد',
    style: 'Murattal',
    audioBaseUrl: '/abdul_basit_murattal'
  },
  {
    id: 'abdul_basit_mujawwad',
    nameEnglish: 'Abdul Basit Abdul Samad',
    nameArabic: 'عبد الباسط عبد الصمد',
    style: 'Mujawwad',
    audioBaseUrl: '/abdul_basit_mujawwad'
  },
  {
    id: 'sudais',
    nameEnglish: 'Abdur Rahman Al-Sudais',
    nameArabic: 'عبد الرحمن السديس',
    style: 'Murattal',
    audioBaseUrl: '/sudais'
  },
  {
    id: 'shuraim',
    nameEnglish: 'Saud Al-Shuraim',
    nameArabic: 'سعود الشريم',
    style: 'Murattal',
    audioBaseUrl: '/shuraim'
  }
];

// User Types

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  defaultReciter: string;
  showTranslation: boolean;
  translationLanguage: 'urdu' | 'english';
  mushafLayout: '13_line' | '15_line' | '16_line';
  fontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'auto';
}

// Progress Types

export interface UserProgress {
  surahId: number;
  memorizationStatus: 'not_started' | 'in_progress' | 'completed' | 'reviewing';
  masteryLevel: number; // 0-100
  lastRevisedAt: Date | null;
  revisionCount: number;
  mistakeCount: number;
}

export interface RevisionSession {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt: Date | null;
  revisionType: 'sabaq' | 'sabaq_para' | 'manzil' | 'weak_surahs' | 'custom';
  surahIds: number[];
  pagesCovered: number;
  mistakesLogged: number;
}

export interface Mistake {
  id: string;
  userId: string;
  ayahId: number;
  sessionId: string | null;
  mistakeType: 'stutter' | 'wrong_word' | 'forgot' | 'mutashabih_confusion' | 'other';
  notes: string | null;
  createdAt: Date;
}

export interface DailyStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
}

// Search Types

export interface SearchResult {
  ayahs: Ayah[];
  totalCount: number;
  query: string;
  searchType: 'arabic' | 'translation' | 'topic';
}

export type TopicCategory =
  | 'sabr' | 'jannah' | 'jahannam' | 'salah' | 'zakah'
  | 'hajj' | 'fasting' | 'parents' | 'orphans' | 'knowledge'
  | 'taqwa' | 'tawakkul' | 'shukr' | 'istighfar' | 'dua';
