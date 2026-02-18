// Shared types between frontend and backend

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
  id: number;
  surahId: number;
  ayahNumber: number;
  pageNumber: number;
  juzNumber: number;
  hizbNumber: number;
  textArabic: string;
  textArabicSimple: string;
  textUrdu: string | null;
  textEnglish: string | null;
  wordCount: number;
}

export interface Mutashabihat {
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

export interface Reciter {
  id: string;
  nameEnglish: string;
  nameArabic: string;
  style: string;
}

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

export interface UserProgress {
  surahId: number;
  memorizationStatus: 'not_started' | 'in_progress' | 'completed' | 'reviewing';
  masteryLevel: number;
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
